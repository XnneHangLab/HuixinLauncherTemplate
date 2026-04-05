use std::fs;
use std::io::{BufRead, BufReader};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::thread;

use tauri::{AppHandle, Emitter};

use super::models::{EnvironmentProbePayload, PythonEnvelope, RuntimeEventPayload, TaskStatus};
use super::state::RuntimeState;

const ENVIRONMENT_PROBE_SCRIPT: &str = r#"
import importlib
import json

result = {
    "status": "torch-unavailable",
    "mode": None,
    "torchAvailable": False,
    "torchVersion": None,
    "cudaAvailable": False,
    "issues": [],
    "message": "torch 不可用",
}

try:
    torch = importlib.import_module("torch")
except Exception as error:
    result["issues"].append(str(error))
else:
    cuda_available = False
    try:
        cuda_available = bool(getattr(torch, "cuda", None) and torch.cuda.is_available())
    except Exception as error:
        result["issues"].append(f"torch cuda probe failed: {error}")

    result["status"] = "torch-gpu-ready" if cuda_available else "torch-cpu-ready"
    result["mode"] = "gpu" if cuda_available else "cpu"
    result["torchAvailable"] = True
    result["torchVersion"] = str(getattr(torch, "__version__", "unknown"))
    result["cudaAvailable"] = cuda_available
    result["message"] = f"torch 已就绪: {'GPU' if cuda_available else 'CPU'}"

print(json.dumps(result, ensure_ascii=False), flush=True)
"#;

pub fn run_inspect_command(repo_root: &Path, workspace_root: &Path) -> Result<serde_json::Value, String> {
    let output = build_uv_python_command(
        repo_root,
        workspace_root,
        ["-m", "xnnehanglab_tts.cli", "inspect-runtime"],
    )
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

pub fn run_probe_command(repo_root: &Path, workspace_root: &Path) -> Result<EnvironmentProbePayload, String> {
    if !workspace_root.is_dir() {
        return Ok(build_probe_payload(
            repo_root,
            workspace_root,
            "workspace-invalid",
            None,
            false,
            None,
            false,
            vec!["workspace root is missing or not a directory".to_string()],
            "工作目录无效".to_string(),
        ));
    }

    let uv_version = Command::new("uv")
        .arg("--version")
        .current_dir(repo_root)
        .output()
        .map_err(|error| {
            if error.kind() == std::io::ErrorKind::NotFound {
                format!("uv not available: {error}")
            } else {
                format!("failed to run uv --version: {error}")
            }
        });

    let uv_version = match uv_version {
        Ok(output) => output,
        Err(error) => {
            return Ok(build_probe_payload(
                repo_root,
                workspace_root,
                "uv-unavailable",
                None,
                false,
                None,
                false,
                vec![error.clone()],
                "uv 不可用".to_string(),
            ));
        }
    };

    if !uv_version.status.success() {
        let stderr = String::from_utf8_lossy(&uv_version.stderr).trim().to_string();
        return Ok(build_probe_payload(
            repo_root,
            workspace_root,
            "uv-unavailable",
            None,
            false,
            None,
            false,
            vec![stderr.clone()],
            "uv 不可用".to_string(),
        ));
    }

    let python_probe = build_uv_python_command(
        repo_root,
        workspace_root,
        ["-c", "import sys; print(sys.executable)"],
    )
    .output()
    .map_err(|error| format!("failed to run python probe: {error}"))?;

    if !python_probe.status.success() {
        let stderr = String::from_utf8_lossy(&python_probe.stderr).trim().to_string();
        return Ok(build_probe_payload(
            repo_root,
            workspace_root,
            "python-unavailable",
            None,
            false,
            None,
            false,
            vec![stderr.clone()],
            "Python 不可用".to_string(),
        ));
    }

    let output = build_uv_python_command(repo_root, workspace_root, ["-c", ENVIRONMENT_PROBE_SCRIPT])
        .output()
        .map_err(|error| format!("failed to run environment probe: {error}"))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        return Ok(build_probe_payload(
            repo_root,
            workspace_root,
            "torch-unavailable",
            None,
            false,
            None,
            false,
            vec![stderr.clone()],
            "torch 不可用".to_string(),
        ));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let last_line = stdout
        .lines()
        .last()
        .ok_or_else(|| "environment probe returned no stdout".to_string())?;
    let mut payload: EnvironmentProbePayload =
        serde_json::from_str(last_line).map_err(|error| error.to_string())?;
    payload.workspace_root = workspace_root.display().to_string();
    payload.repo_root = repo_root.display().to_string();
    Ok(payload)
}

pub fn ensure_environment_ready(
    repo_root: &Path,
    workspace_root: &Path,
) -> Result<EnvironmentProbePayload, String> {
    let probe = run_probe_command(repo_root, workspace_root)?;
    if matches!(probe.status.as_str(), "torch-cpu-ready" | "torch-gpu-ready") {
        Ok(probe)
    } else {
        Err(probe.message)
    }
}

pub fn run_download_command(
    app: AppHandle,
    state: RuntimeState,
    task_id: String,
    target: String,
) -> Result<(), String> {
    let mut command = build_uv_python_command(
        &state.repo_root,
        &state.current_workspace_root(),
        ["-m", "xnnehanglab_tts.cli", "download"],
    );
    command.arg(&target).stdout(Stdio::piped()).stderr(Stdio::piped());

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
                repo_root: state.repo_root.clone(),
                workspace_root: state.workspace_root.clone(),
                queue: state.queue.clone(),
            },
            task.task_id.clone(),
            task.target.clone(),
        ) {
            let timestamp = super::state::current_timestamp();
            let mut queue = state.queue.lock().unwrap();
            queue.apply_update(&task.task_id, TaskStatus::Failed, error.clone(), 3, 3);
            drop(queue);

            let event = build_terminal_failure_event(
                &task.task_id,
                &task.target,
                &error,
                &timestamp,
            );
            let _ = app.emit("runtime:event", &event);
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

pub fn pick_workspace_root() -> Result<Option<PathBuf>, String> {
    #[cfg(target_os = "windows")]
    {
        let output = Command::new("powershell")
            .args([
                "-NoProfile",
                "-Command",
                "Add-Type -AssemblyName System.Windows.Forms; $dialog = New-Object System.Windows.Forms.FolderBrowserDialog; $dialog.Description = '选择工作目录'; $dialog.ShowNewFolderButton = $true; if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Write-Output $dialog.SelectedPath }",
            ])
            .output()
            .map_err(|error| format!("failed to open workspace picker: {error}"))?;
        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
            return Err(if stderr.is_empty() {
                "failed to open workspace picker".to_string()
            } else {
                stderr
            });
        }
        let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
        return if stdout.is_empty() {
            Ok(None)
        } else {
            Ok(Some(PathBuf::from(stdout)))
        };
    }

    #[cfg(target_os = "macos")]
    {
        let output = Command::new("osascript")
            .args([
                "-e",
                "POSIX path of (choose folder with prompt \"选择工作目录\")",
            ])
            .output()
            .map_err(|error| format!("failed to open workspace picker: {error}"))?;
        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
            return Err(if stderr.is_empty() {
                "failed to open workspace picker".to_string()
            } else {
                stderr
            });
        }
        let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
        return if stdout.is_empty() {
            Ok(None)
        } else {
            Ok(Some(PathBuf::from(stdout)))
        };
    }

    #[cfg(target_os = "linux")]
    {
        for (program, args) in [
            (
                "zenity",
                vec![
                    "--file-selection",
                    "--directory",
                    "--title=选择工作目录",
                ],
            ),
            ("kdialog", vec!["--getexistingdirectory", "."]),
        ] {
            let output = Command::new(program).args(args).output();
            let Ok(output) = output else {
                continue;
            };
            if !output.status.success() {
                continue;
            }
            let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
            return if stdout.is_empty() {
                Ok(None)
            } else {
                Ok(Some(PathBuf::from(stdout)))
            };
        }

        Err("failed to open workspace picker: no supported dialog program found".to_string())
    }
}

pub fn resolve_managed_path(workspace_root: &Path, path_key: &str) -> Result<PathBuf, String> {
    let models_root = workspace_root.join("models");
    let logs_root = workspace_root.join("logs");

    match path_key {
        "workspace" => Ok(workspace_root.to_path_buf()),
        "models" => Ok(models_root),
        "genieBase" => Ok(workspace_root.join("models").join("genie").join("base")),
        "modelscopeCache" => Ok(workspace_root.join("models").join("cache").join("modelscope")),
        "downloadLogs" => Ok(logs_root.join("downloads")),
        other => Err(format!("managed path key not found in local runtime layout: {other}")),
    }
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

#[cfg(test)]
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

fn build_terminal_failure_event(
    task_id: &str,
    target: &str,
    message: &str,
    timestamp: &str,
) -> RuntimeEventPayload {
    RuntimeEventPayload {
        event: "download.failed".to_string(),
        task_id: task_id.to_string(),
        target: target.to_string(),
        status: "failed".to_string(),
        message: message.to_string(),
        progress_current: 3,
        progress_total: 3,
        progress_unit: "stage".to_string(),
        timestamp: timestamp.to_string(),
    }
}

pub fn build_uv_python_command<I, S>(
    repo_root: &Path,
    workspace_root: &Path,
    python_args: I,
) -> Command
where
    I: IntoIterator<Item = S>,
    S: AsRef<str>,
{
    let mut command = Command::new("uv");
    command
        .arg("run")
        .arg("--no-sync")
        .arg("python")
        .current_dir(repo_root)
        .env("XH_VOICE_WORKSPACE_ROOT", workspace_root)
        .env("XH_RUNTIME_CONFIG", repo_root.join("config").join("runtime.toml"));
    for arg in python_args {
        command.arg(arg.as_ref());
    }
    command
}

fn build_probe_payload(
    repo_root: &Path,
    workspace_root: &Path,
    status: &str,
    mode: Option<&str>,
    torch_available: bool,
    torch_version: Option<&str>,
    cuda_available: bool,
    issues: Vec<String>,
    message: String,
) -> EnvironmentProbePayload {
    EnvironmentProbePayload {
        workspace_root: workspace_root.display().to_string(),
        repo_root: repo_root.display().to_string(),
        status: status.to_string(),
        mode: mode.map(str::to_string),
        torch_available,
        torch_version: torch_version.map(str::to_string),
        cuda_available,
        issues,
        message,
    }
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
    use std::path::Path;

    use serde_json::json;

    use super::{
        build_terminal_failure_event, build_uv_python_command, managed_path_from_payload,
        EnvironmentProbePayload,
    };

    #[test]
    fn build_uv_python_command_always_includes_no_sync() {
        let command = build_uv_python_command(
            Path::new("/tmp/repo"),
            Path::new("/tmp/workspace"),
            ["-m", "xnnehanglab_tts.cli", "inspect-runtime"],
        );
        let args = command
            .get_args()
            .map(|value| value.to_string_lossy().into_owned())
            .collect::<Vec<_>>();

        assert_eq!(
            args,
            vec![
                "run".to_string(),
                "--no-sync".to_string(),
                "python".to_string(),
                "-m".to_string(),
                "xnnehanglab_tts.cli".to_string(),
                "inspect-runtime".to_string(),
            ]
        );
        let envs = command
            .get_envs()
            .map(|(key, value)| {
                (
                    key.to_string_lossy().into_owned(),
                    value.map(|item| item.to_string_lossy().into_owned()),
                )
            })
            .collect::<Vec<_>>();

        assert!(envs.iter().any(|(key, value)| {
            key == "XH_VOICE_WORKSPACE_ROOT"
                && value.as_deref() == Some("/tmp/workspace")
        }));
    }

    #[test]
    fn environment_probe_payload_defaults_workspace_fields_when_python_probe_omits_them() {
        let payload: EnvironmentProbePayload = serde_json::from_str(
            r#"{
                "status":"torch-cpu-ready",
                "mode":"cpu",
                "torchAvailable":true,
                "torchVersion":"2.6.0+cpu",
                "cudaAvailable":false,
                "issues":[],
                "message":"torch 已就绪: CPU"
            }"#,
        )
        .unwrap();

        assert_eq!(payload.workspace_root, "");
        assert_eq!(payload.repo_root, "");
        assert_eq!(payload.status, "torch-cpu-ready");
    }

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

    #[test]
    fn build_terminal_failure_event_marks_task_as_failed() {
        let event = build_terminal_failure_event(
            "task-7",
            "genie-base",
            "spawn failed",
            "1712300000",
        );

        assert_eq!(event.event, "download.failed");
        assert_eq!(event.task_id, "task-7");
        assert_eq!(event.target, "genie-base");
        assert_eq!(event.status, "failed");
        assert_eq!(event.message, "spawn failed");
        assert_eq!(event.progress_current, 3);
        assert_eq!(event.progress_total, 3);
        assert_eq!(event.progress_unit, "stage");
        assert_eq!(event.timestamp, "1712300000");
    }
}
