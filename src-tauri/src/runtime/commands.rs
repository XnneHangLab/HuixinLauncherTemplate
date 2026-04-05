use tauri::{AppHandle, State};

use super::process::{
    drain_download_queue, open_path, resolve_managed_path, run_inspect_command, write_console_log,
};
use super::state::{resolve_workspace_root, RuntimeState};

#[tauri::command]
pub async fn inspect_runtime(state: State<'_, RuntimeState>) -> Result<serde_json::Value, String> {
    let workspace_root = state.workspace_root.clone();
    run_blocking_runtime_action(move || run_inspect_command(&workspace_root)).await
}

#[tauri::command]
pub fn enqueue_download(
    app: AppHandle,
    state: State<'_, RuntimeState>,
    target: String,
) -> Result<serde_json::Value, String> {
    let (target, label) = validate_download_target(&target)?;
    let (task, should_spawn_worker) = {
        let mut queue = state.queue.lock().unwrap();
        queue.enqueue_with_worker_control(target.to_string(), label.to_string())
    };

    if should_spawn_worker {
        let app_handle = app.clone();
        let runtime_state = RuntimeState {
            workspace_root: state.workspace_root.clone(),
            queue: state.queue.clone(),
        };

        tauri::async_runtime::spawn(async move {
            drain_download_queue(app_handle.clone(), runtime_state);
        });
    }

    serde_json::to_value(task).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn list_download_tasks(state: State<'_, RuntimeState>) -> Result<serde_json::Value, String> {
    let queue = state.queue.lock().unwrap();
    serde_json::to_value(&queue.tasks).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn open_managed_path(state: State<'_, RuntimeState>, path_key: String) -> Result<(), String> {
    let path = resolve_managed_path(&state.workspace_root, &path_key)?;
    open_path(&path)
}

#[tauri::command]
pub fn export_console_logs(
    state: State<'_, RuntimeState>,
    contents: String,
) -> Result<String, String> {
    let log_dir = resolve_managed_path(&state.workspace_root, "downloadLogs")?;
    let path = write_console_log(&log_dir, &contents)?;
    Ok(path.display().to_string())
}

pub fn build_runtime_state() -> Result<RuntimeState, String> {
    Ok(RuntimeState::new(resolve_workspace_root()?))
}

fn validate_download_target(target: &str) -> Result<(&'static str, &'static str), String> {
    match target {
        "genie-base" => Ok(("genie-base", "GenieData 基础资源")),
        other => Err(format!("unsupported download target: {other}")),
    }
}

async fn run_blocking_runtime_action<T, F>(action: F) -> Result<T, String>
where
    T: Send + 'static,
    F: FnOnce() -> Result<T, String> + Send + 'static,
{
    tauri::async_runtime::spawn_blocking(action)
        .await
        .map_err(|error| format!("failed to join runtime task: {error}"))?
}

#[cfg(test)]
mod tests {
    #[test]
    fn run_blocking_runtime_action_moves_work_off_the_calling_thread() {
        let caller_thread = format!("{:?}", std::thread::current().id());
        let worker_thread =
            tauri::async_runtime::block_on(super::run_blocking_runtime_action(|| {
                Ok(format!("{:?}", std::thread::current().id()))
            }))
            .unwrap();

        assert_ne!(worker_thread, caller_thread);
    }
}
