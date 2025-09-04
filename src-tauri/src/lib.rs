// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::Manager;

mod listener;
mod log;
#[cfg(target_os = "windows")]
mod regedit;
mod tray;
mod permission;
mod windows;
mod file;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // 自启动配置
            let _ = app.handle().plugin(tauri_plugin_autostart::init(
                tauri_plugin_autostart::MacosLauncher::LaunchAgent,
                Some(vec!["--flag1", "--flag2"]), /* arbitrary number of args to pass to your app */
            ));
            // 开始监听
            listener::start_listening(app.handle().clone());
            // 创建系统托盘
            tray::create_tray(app.handle().clone());
            windows::create_main_window(app.handle().clone());
            Ok(())
        })
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let win = app.get_webview_window("main").expect("主窗口不存在");
            win.show().expect("窗口显示失败");
            win.set_focus().expect("窗口聚焦失败");
        }))
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(log::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            #[cfg(debug_assertions)]
            open_dev_tool,
            restart_computer,
            tray::reload_tray_menu,
            listener::write_to_clipboard,
            #[cfg(target_os = "windows")]
            regedit::valid_clipboard_regedit,
            #[cfg(target_os = "windows")]
            regedit::valid_clipboard_backup_regedit,
            #[cfg(target_os = "windows")]
            regedit::backup_clipboard_regedit,
            #[cfg(target_os = "windows")]
            regedit::recover_clipboard_regedit,
            permission::check_admin,
            file::open_folder,
        ])
        .run(tauri::generate_context!())
        .expect("应用程序运行异常");
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

/**
 * 重启电脑
 */
#[tauri::command]
async fn restart_computer() -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("shutdown")
            .args(["/r", "/t", "0"]) // 立即重启
            .status()
            .map_err(|e| e.to_string()).expect("重启失败");
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("sudo")
            .args(["shutdown", "-r", "now"])
            .status()
            .map_err(|e| e.to_string()).expect("重启失败");
    }

    Ok(())
}