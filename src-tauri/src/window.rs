use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};

pub fn open_main_window(app: AppHandle) {
    let window =
        WebviewWindowBuilder::new(app.app_handle(), "main", WebviewUrl::App("/list".into()))
            .title("main")                  // 窗口唯一标识
            .inner_size(350.0, 550.0)       // 窗口初始大小
            .min_inner_size(350.0, 550.0)   // 窗口最小大小
            .max_inner_size(800.0, 1000.0)  // 窗口最大大小
            .prevent_overflow()             // 限制窗口内容超出范围
            .resizable(true)                // 窗口可自由拖放大小
            .decorations(false)             // 窗口无边框
            .visible(false)                 // 窗口默认不显示
            .skip_taskbar(true)             // 任务栏不显示
            .always_on_top(true)            // 窗口置顶
            .focused(true)                  // 窗口聚焦
            .fullscreen(false)              // 禁止全屏
            .maximizable(false)             // 禁止最大化
            .minimizable(false)             // 禁止最小化
            .content_protected(false)       // 禁止窗口被捕获
            .drag_and_drop(true)            // 允许拖拽
            .incognito(true)                // 隐私模式
            .shadow(true)                   // 窗口阴影
            .build();
    app.manage(window);
}
