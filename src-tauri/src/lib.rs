// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::Manager;

mod commands;
mod models;
mod utils;

mod listener;
mod log;
mod tray;
mod windows;
mod i18n;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(i18n::I18nState::new())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_os::init())
        .setup(|app| {
            // 自启动配置
            let _ = app.handle().clone().plugin(tauri_plugin_autostart::init(
                tauri_plugin_autostart::MacosLauncher::LaunchAgent,
                Some(vec!["--flag1", "--flag2"]), /* arbitrary number of args to pass to your app */
            ));
            // 开始监听
            listener::start_listening(app.handle().clone());
            // 初始化系统语言
            i18n::init_locale(app.handle().clone());
            // 创建系统托盘
            tray::create_tray(app.handle().clone());
            // 创建主窗口
            windows::create_main_window(app.handle().clone());
            Ok(())
        })
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let win = app.get_webview_window("list").expect("主窗口不存在");
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
            commands::dev::open_dev_tool,
            commands::system::restart_computer,
            tray::hide_win_msg,
            listener::write_to_clipboard,
            listener::is_listening,
            #[cfg(target_os = "windows")]
            commands::regedit::valid_clipboard_regedit,
            #[cfg(target_os = "windows")]
            commands::regedit::valid_clipboard_backup_regedit,
            #[cfg(target_os = "windows")]
            commands::regedit::backup_clipboard_regedit,
            #[cfg(target_os = "windows")]
            commands::regedit::recover_clipboard_regedit,
            commands::system::check_admin,
            commands::file::open_folder,
            commands::file::read_rar_data,
            commands::file::read_tar_data,
            commands::file::read_gzip_data,
            windows::invoke_external_plugin,
            windows::init_main_window,
            commands::web::fetch_page_title,
            i18n::get_current_locale,
            i18n::get_locales,
            i18n::update_current_locale,
            i18n::get_page_locale,
            i18n::get_ui_locale,
        ])
        .run(tauri::generate_context!())
        .expect("应用程序运行异常");
}