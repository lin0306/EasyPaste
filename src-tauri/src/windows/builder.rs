use std::path::PathBuf;
use tauri::{
    AppHandle, Manager, PhysicalPosition, WebviewUrl, WebviewWindow, WebviewWindowBuilder,
};
use tauri_plugin_store::StoreExt;

/**
 * 创建主窗口
 */
pub fn build_main_window(app: AppHandle) -> tauri::Result<WebviewWindow> {
    let mut path = PathBuf::new();
    path.push("/list");

    let mut build = WebviewWindowBuilder::new(&app, "list", WebviewUrl::App(path))
        .title("EasyPaste")
        .inner_size(350.0, 550.0)
        .min_inner_size(350.0, 550.0)
        .max_inner_size(800.0, 1000.0)
        .prevent_overflow()
        .decorations(false)
        .visible(false)
        .focused(true)
        .focusable(true)
        .fullscreen(false)
        .incognito(true)
        .shadow(true)
        .content_protected(false)
        .resizable(true)
        .disable_drag_drop_handler()
        .visible_on_all_workspaces(true)
        .center();

    match &app.store("settings.json") {
        Ok(store) => {
            // 是否自动隐藏窗口
            let auto_hide_window = store
                .get("autoHideWindow")
                .and_then(|v| v.as_bool())
                .unwrap_or(false);
            // 窗口是否置顶
            let always_on_top = store
                .get("alwaysOnTop")
                .and_then(|v| v.as_bool())
                .unwrap_or(false);
            // 窗口宽度
            let width = store
                .get("windowWidth")
                .and_then(|v| v.as_f64())
                .unwrap_or(350.0);
            // 窗口高度
            let height = store
                .get("windowHeight")
                .and_then(|v| v.as_f64())
                .unwrap_or(550.0);
            build = build
                .always_on_top(auto_hide_window || always_on_top)
                .skip_taskbar(auto_hide_window)
                .min_inner_size(width, height);

            #[cfg(target_os = "windows")]
            {
                build = build.transparent(true);
            }
        }
        _ => {
            build = build.always_on_top(true).skip_taskbar(true);
            #[cfg(target_os = "windows")]
            {
                build = build.transparent(true);
            }
        }
    };

    let window = build.build().expect("Failed to build window");
    #[cfg(debug_assertions)]
    {
        use crate::commands::dev::open_dev_tool;

        open_dev_tool(app.clone(), "list");
    }
    Ok(window)
}

/**
 * 初始化窗口位置
 */
pub fn init_window_position(app: AppHandle) {
    let win = &app.get_webview_window("list").expect("主窗口不存在");
    win.set_position(PhysicalPosition::new(-1000.0, -1000.0))
        .expect("设置窗口坐标失败");
    win.show().expect("显示窗口失败");
    win.hide().expect("隐藏窗口失败");
}
