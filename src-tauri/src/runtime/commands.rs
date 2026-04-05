use tauri::{AppHandle, State};

use super::process::{drain_download_queue, open_path, run_inspect_command, write_console_log};
use super::state::{resolve_workspace_root, RuntimeState};

#[tauri::command]
pub fn inspect_runtime(state: State<'_, RuntimeState>) -> Result<serde_json::Value, String> {
    run_inspect_command(&state.workspace_root)
}

#[tauri::command]
pub fn enqueue_download(
    app: AppHandle,
    state: State<'_, RuntimeState>,
    target: String,
) -> Result<serde_json::Value, String> {
    let task = {
        let mut queue = state.queue.lock().unwrap();
        let task = queue.enqueue(target, "GenieData 基础资源".to_string());
        if queue.worker_running {
            return serde_json::to_value(task).map_err(|error| error.to_string());
        }
        queue.worker_running = true;
        task
    };

    let app_handle = app.clone();
    let runtime_state = RuntimeState {
        workspace_root: state.workspace_root.clone(),
        queue: state.queue.clone(),
    };

    tauri::async_runtime::spawn(async move {
        drain_download_queue(app_handle.clone(), runtime_state);
    });

    serde_json::to_value(task).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn list_download_tasks(state: State<'_, RuntimeState>) -> Result<serde_json::Value, String> {
    let queue = state.queue.lock().unwrap();
    serde_json::to_value(&queue.tasks).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn open_managed_path(state: State<'_, RuntimeState>, path_key: String) -> Result<(), String> {
    let path = match path_key.as_str() {
        "workspace" => state.workspace_root.clone(),
        "models" => state.workspace_root.join("models"),
        "genieBase" => state.workspace_root.join("models").join("genie").join("base"),
        "modelscopeCache" => state
            .workspace_root
            .join("models")
            .join("cache")
            .join("modelscope"),
        "downloadLogs" => state.workspace_root.join("logs").join("downloads"),
        other => return Err(format!("unsupported managed path key: {other}")),
    };
    open_path(&path)
}

#[tauri::command]
pub fn export_console_logs(
    state: State<'_, RuntimeState>,
    contents: String,
) -> Result<String, String> {
    let path = write_console_log(&state.workspace_root, &contents)?;
    Ok(path.display().to_string())
}

pub fn build_runtime_state() -> Result<RuntimeState, String> {
    Ok(RuntimeState::new(resolve_workspace_root()?))
}
