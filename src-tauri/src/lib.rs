// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::Manager;

mod file;
mod listener;
mod log;
mod permission;
#[cfg(target_os = "windows")]
mod regedit;
mod tray;
mod windows;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_os::init())
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
            tray::hide_win_msg,
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
            file::read_rar_data,
            file::read_tar_data,
            file::read_gzip_data,
            windows::invoke_external_plugin,
            fetch_page_title,
        ])
        .run(tauri::generate_context!())
        .expect("应用程序运行异常");
}

#[cfg(debug_assertions)]
#[tauri::command]
fn open_dev_tool(app_handle: tauri::AppHandle, window_name: &str) {
    if let Some(window) = app_handle.get_webview_window(&window_name) {
        println!("正在打开 {} 页面的开发者工具", window_name);
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
            .map_err(|e| e.to_string())
            .expect("重启失败");
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("sudo")
            .args(["shutdown", "-r", "now"])
            .status()
            .map_err(|e| e.to_string())
            .expect("重启失败");
    }

    Ok(())
}

/**
 * 获取页面标题
 */
#[tauri::command]
async fn fetch_page_title(url: String) -> Result<String, String> {
    let client = reqwest::Client::new();
    let res = client
        .get(&url)
        .header("User-Agent", "Tauri App")
        .timeout(std::time::Duration::from_secs(10))
        .send()
        .await
        .map_err(|e| e.to_string())?;
    if !res.status().is_success() {
        return Ok("NotFound".into());
    }

    let html = res.text().await.map_err(|e| e.to_string())?;

    // 简单提取 <title>（可用 scraper 库更健壮）
    if let Some(start) = html.find("<title>") {
        let start = start + 7;
        if let Some(end) = html[start..].find("</title>") {
            let title = html[start..start + end].trim().to_string();
            return Ok(title);
        }
    }

    Ok("NotFound".into())
}
