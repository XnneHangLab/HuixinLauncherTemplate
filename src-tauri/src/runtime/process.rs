use std::fs;
use std::io::{BufRead, BufReader};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

use tauri::{AppHandle, Emitter};

use super::models::{PythonEnvelope, RuntimeEventPayload, TaskStatus};
use super::state::RuntimeState;

pub fn run_inspect_command(workspace_root: &Path) -> Result<serde_json::Value, String> {
    let output = Command::new("uv")
        .args([
            "run",
            "python",
            "-m",
            "xnnehanglab_tts.cli",
            "inspect-runtime",
        ])
        .current_dir(workspace_root)
        .output()
        .map_err(|error| format!("failed to run inspect-runtime: {error}"))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).trim().to_string());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let last_line = stdout
        .lines()
        .last()
        .ok_or_else(|| "inspect-runtime returned no stdout".to_string())?;
    let envelope: PythonEnvelope = serde_json::from_str(last_line).map_err(|error| error.to_string())?;
    Ok(envelope.payload)
}

pub fn run_download_command(
    app: AppHandle,
    state: RuntimeState,
    task_id: String,
) -> Result<(), String> {
    let mut command = Command::new("uv");
    command
        .args([
            "run",
            "python",
            "-m",
            "xnnehanglab_tts.cli",
            "download",
            "genie-base",
        ])
        .current_dir(&state.workspace_root)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    let mut child = command
        .spawn()
        .map_err(|error| format!("failed to spawn download process: {error}"))?;
    let stdout = child
        .stdout
        .take()
        .ok_or_else(|| "missing child stdout".to_string())?;
    let stderr = child
        .stderr
        .take()
        .ok_or_else(|| "missing child stderr".to_string())?;

    let stdout_reader = BufReader::new(stdout);
    for line_result in stdout_reader.lines() {
        let line = line_result.map_err(|error| error.to_string())?;
        if line.trim().is_empty() {
            continue;
        }
        if let Ok(envelope) = serde_json::from_str::<PythonEnvelope>(&line) {
            if envelope.kind == "event" {
                let payload = envelope.payload;
                let status = payload["status"].as_str().unwrap_or("downloading");
                {
                    let mut queue = state.queue.lock().unwrap();
                    queue.apply_update(
                        &task_id,
                        task_status_from_str(status),
                        payload["message"].as_str().unwrap_or("").to_string(),
                        payload["progressCurrent"].as_u64().unwrap_or(0),
                        payload["progressTotal"].as_u64().unwrap_or(3),
                    );
                }
                let event = RuntimeEventPayload {
                    event: payload["event"]
                        .as_str()
                        .unwrap_or("download.progress")
                        .to_string(),
                    task_id: task_id.clone(),
                    target: payload["target"].as_str().unwrap_or("genie-base").to_string(),
                    status: status.to_string(),
                    message: payload["message"].as_str().unwrap_or("").to_string(),
                    progress_current: payload["progressCurrent"].as_u64().unwrap_or(0),
                    progress_total: payload["progressTotal"].as_u64().unwrap_or(3),
                    progress_unit: payload["progressUnit"].as_str().unwrap_or("stage").to_string(),
                    timestamp: super::state::current_timestamp(),
                };
                app.emit("runtime:event", &event)
                    .map_err(|error| error.to_string())?;
            }
        } else {
            app.emit("runtime:raw-log", &line)
                .map_err(|error| error.to_string())?;
        }
    }

    let stderr_reader = BufReader::new(stderr);
    for line_result in stderr_reader.lines() {
        let line = line_result.map_err(|error| error.to_string())?;
        if !line.trim().is_empty() {
            app.emit("runtime:raw-log", &line)
                .map_err(|error| error.to_string())?;
        }
    }

    let status = child.wait().map_err(|error| error.to_string())?;
    if status.success() {
        Ok(())
    } else {
        Err(format!("download process exited with status {status}"))
    }
}

pub fn drain_download_queue(app: AppHandle, state: RuntimeState) {
    loop {
        let next_task_id = {
            let mut queue = state.queue.lock().unwrap();
            queue.next_queued_task_id()
        };

        let Some(task_id) = next_task_id else {
            let mut queue = state.queue.lock().unwrap();
            queue.worker_running = false;
            break;
        };

        if let Err(error) = run_download_command(
            app.clone(),
            RuntimeState {
                workspace_root: state.workspace_root.clone(),
                queue: state.queue.clone(),
            },
            task_id.clone(),
        ) {
            let mut queue = state.queue.lock().unwrap();
            queue.apply_update(&task_id, TaskStatus::Failed, error, 3, 3);
        }
    }
}

pub fn open_path(path: &Path) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    let mut command = {
        let mut command = Command::new("explorer");
        command.arg(path);
        command
    };

    #[cfg(target_os = "linux")]
    let mut command = {
        let mut command = Command::new("xdg-open");
        command.arg(path);
        command
    };

    #[cfg(target_os = "macos")]
    let mut command = {
        let mut command = Command::new("open");
        command.arg(path);
        command
    };

    command.spawn().map_err(|error| error.to_string())?;
    Ok(())
}

pub fn write_console_log(workspace_root: &Path, contents: &str) -> Result<PathBuf, String> {
    let log_dir = workspace_root.join("logs").join("downloads");
    fs::create_dir_all(&log_dir).map_err(|error| error.to_string())?;
    let log_path = log_dir.join(format!(
        "launcher-{}.log",
        super::state::current_timestamp()
    ));
    fs::write(&log_path, contents).map_err(|error| error.to_string())?;
    Ok(log_path)
}

fn task_status_from_str(value: &str) -> TaskStatus {
    match value {
        "queued" => TaskStatus::Queued,
        "preparing" => TaskStatus::Preparing,
        "downloading" => TaskStatus::Downloading,
        "verifying" => TaskStatus::Verifying,
        "completed" => TaskStatus::Completed,
        "failed" => TaskStatus::Failed,
        "cancelled" => TaskStatus::Cancelled,
        _ => TaskStatus::Downloading,
    }
}
