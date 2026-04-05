mod runtime;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let runtime_state =
        runtime::commands::build_runtime_state().expect("failed to build runtime state");

    tauri::Builder::default()
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
        .invoke_handler(tauri::generate_handler![
            runtime::commands::inspect_runtime,
            runtime::commands::enqueue_download,
            runtime::commands::list_download_tasks,
            runtime::commands::open_managed_path,
            runtime::commands::export_console_logs,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
