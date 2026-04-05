use std::fs;
use std::io::{BufRead, BufReader};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::thread;

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
    let envelope: PythonEnvelope =
        serde_json::from_str(last_line).map_err(|error| error.to_string())?;
    Ok(envelope.payload)
}

pub fn run_download_command(
    app: AppHandle,
    state: RuntimeState,
    task_id: String,
    target: String,
) -> Result<(), String> {
    let mut command = Command::new("uv");
    command
        .args(["run", "python", "-m", "xnnehanglab_tts.cli", "download"])
        .arg(&target)
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

    let app_for_stderr = app.clone();
    let stderr_reader = thread::spawn(move || -> Result<(), String> {
        for line_result in BufReader::new(stderr).lines() {
            let line = line_result.map_err(|error| error.to_string())?;
            if !line.trim().is_empty() {
                app_for_stderr
                    .emit("runtime:raw-log", &line)
                    .map_err(|error| error.to_string())?;
            }
        }
        Ok(())
    });

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
                    target: payload["target"].as_str().unwrap_or(&target).to_string(),
                    status: status.to_string(),
                    message: payload["message"].as_str().unwrap_or("").to_string(),
                    progress_current: payload["progressCurrent"].as_u64().unwrap_or(0),
                    progress_total: payload["progressTotal"].as_u64().unwrap_or(3),
                    progress_unit: payload["progressUnit"]
                        .as_str()
                        .unwrap_or("stage")
                        .to_string(),
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

    let status = child.wait().map_err(|error| error.to_string())?;
    stderr_reader
        .join()
        .map_err(|_| "stderr reader thread panicked".to_string())??;

    if status.success() {
        Ok(())
    } else {
        Err(format!("download process exited with status {status}"))
    }
}

pub fn drain_download_queue(app: AppHandle, state: RuntimeState) {
    loop {
        let next_task = {
            let mut queue = state.queue.lock().unwrap();
            queue.take_next_task_or_mark_idle()
        };

        let Some(task) = next_task else {
            break;
        };

        if let Err(error) = run_download_command(
            app.clone(),
            RuntimeState {
                workspace_root: state.workspace_root.clone(),
                queue: state.queue.clone(),
            },
            task.task_id.clone(),
            task.target.clone(),
        ) {
            let mut queue = state.queue.lock().unwrap();
            queue.apply_update(&task.task_id, TaskStatus::Failed, error, 3, 3);
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

pub fn resolve_managed_path(workspace_root: &Path, path_key: &str) -> Result<PathBuf, String> {
    let inspection = run_inspect_command(workspace_root)?;
    managed_path_from_payload(&inspection, path_key)
}

pub fn write_console_log(log_dir: &Path, contents: &str) -> Result<PathBuf, String> {
    fs::create_dir_all(&log_dir).map_err(|error| error.to_string())?;
    let log_path = log_dir.join(format!(
        "launcher-{}.log",
        super::state::current_timestamp()
    ));
    fs::write(&log_path, contents).map_err(|error| error.to_string())?;
    Ok(log_path)
}

fn managed_path_from_payload(
    payload: &serde_json::Value,
    path_key: &str,
) -> Result<PathBuf, String> {
    let managed_paths = payload
        .get("managedPaths")
        .and_then(serde_json::Value::as_array)
        .ok_or_else(|| "inspect-runtime payload missing managedPaths".to_string())?;

    for entry in managed_paths {
        let key = entry
            .get("key")
            .and_then(serde_json::Value::as_str)
            .ok_or_else(|| "managedPaths entry missing key".to_string())?;
        if key != path_key {
            continue;
        }

        let path = entry
            .get("path")
            .and_then(serde_json::Value::as_str)
            .ok_or_else(|| format!("managedPaths entry missing path for key: {path_key}"))?;
        return Ok(PathBuf::from(path));
    }

    Err(format!(
        "managed path key not found in inspect-runtime payload: {path_key}"
    ))
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

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::managed_path_from_payload;

    #[test]
    fn managed_path_from_payload_returns_matched_path() {
        let payload = json!({
            "managedPaths": [
                {"key": "workspace", "path": "/tmp/workspace"},
                {"key": "downloadLogs", "path": "/tmp/logs/downloads"}
            ]
        });

        let resolved = managed_path_from_payload(&payload, "downloadLogs").unwrap();
        assert_eq!(resolved.to_string_lossy(), "/tmp/logs/downloads");
    }

    #[test]
    fn managed_path_from_payload_returns_error_for_unknown_key() {
        let payload = json!({
            "managedPaths": [
                {"key": "workspace", "path": "/tmp/workspace"}
            ]
        });

        let error = managed_path_from_payload(&payload, "downloadLogs").unwrap_err();
        assert!(error.contains("downloadLogs"));
    }
}
