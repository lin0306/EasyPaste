use tauri::Manager;

#[tauri::command]
pub fn open_dev_tool(app_handle: tauri::AppHandle, window_name: &str) {
    if let Some(window) = app_handle.get_webview_window(&window_name) {
        println!("正在打开 {} 页面的开发者工具", window_name);
        window.open_devtools();
    } else {
        eprintln!("找不到名称为 {} 的窗口", window_name);
    }
}