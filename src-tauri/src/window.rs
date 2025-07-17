use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};

pub fn open_main_window(app: AppHandle) {
    let window =
        WebviewWindowBuilder::new(app.app_handle(), "main", WebviewUrl::App("/list".into()))
            .title("main")
            .inner_size(350.0, 550.0)
            .min_inner_size(350.0, 550.0)
            .max_inner_size(800.0, 1000.0)
            .prevent_overflow()
            .resizable(true)
            .decorations(false)
            .visible(false)
            .skip_taskbar(true)
            .always_on_top(true)
            .decorations(false)
            .focused(true)
            .fullscreen(false)
            .maximizable(false)
            .minimizable(false)
            .build();
    app.manage(window);
}
