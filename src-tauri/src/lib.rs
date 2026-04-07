mod runtime;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let runtime_state =
        runtime::commands::build_runtime_state().expect("failed to build runtime state");

    let app = tauri::Builder::default()
        .manage(runtime_state)
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .on_window_event(|window, event| {
            if matches!(event, tauri::WindowEvent::CloseRequested { .. }) {
                cleanup_webui_processes(&window.app_handle());
            }
        })
        .invoke_handler(tauri::generate_handler![
            runtime::commands::probe_environment,
            runtime::commands::choose_workspace_root,
            runtime::commands::use_repo_workspace_root,
            runtime::commands::inspect_runtime,
            runtime::commands::enqueue_download,
            runtime::commands::list_download_tasks,
            runtime::commands::list_managed_folders,
            runtime::commands::open_managed_path,
            runtime::commands::export_console_logs,
            runtime::commands::set_runtime_driver,
            runtime::commands::pick_python_path_command,
            runtime::commands::launch_webui,
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    app.run(|app_handle, event| {
        if matches!(
            event,
            tauri::RunEvent::ExitRequested { .. } | tauri::RunEvent::Exit
        ) {
            cleanup_webui_processes(app_handle);
        }
    });
}

fn cleanup_webui_processes(app_handle: &tauri::AppHandle) {
    let state = app_handle.state::<runtime::state::RuntimeState>();
    if let Err(error) = runtime::process::cleanup_webui_processes(app_handle, &state) {
        log::warn!("failed to clean up webui process: {error}");
    }
}
