// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::Manager;

mod clipboard_monitor;
mod log;
mod tray;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            let _ = app.handle().plugin(tauri_plugin_autostart::init(
                tauri_plugin_autostart::MacosLauncher::LaunchAgent,
                Some(vec!["--flag1", "--flag2"]), /* arbitrary number of args to pass to your app */
            ));
            Ok(())
        })
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(log::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tray::init())
        .plugin(clipboard_monitor::init())
        .invoke_handler(tauri::generate_handler![
            #[cfg(debug_assertions)]
            open_dev_tool,
            tray::reload_tray_menu
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(debug_assertions)]
#[tauri::command]
fn open_dev_tool(app_handle: tauri::AppHandle, window_name: &str) {
    if let Some(window) = app_handle.get_webview_window(&window_name) {
        window.open_devtools();
    } else {
        eprintln!("找不到名称为 {} 的窗口", window_name);
    }
}
