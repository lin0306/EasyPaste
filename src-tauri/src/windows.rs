use crate::file;
use serde::Deserialize;
use std::path::PathBuf;
use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindow};

pub fn create_main_window(app: AppHandle) {
    let mut path = PathBuf::new();
    path.push("/list");

    match file::load_file_content::<Settings>(app.clone(), "settings.json".into()) {
        Ok(data) => {
            let window = WebviewWindow::builder(&app, "main", WebviewUrl::App(path))
                .title("main")
                .inner_size(350.0, 550.0) // 窗口初始大小
                .min_inner_size(350.0, 550.0) // 窗口最小大小
                .max_inner_size(800.0, 1000.0) // 窗口最大大小
                .prevent_overflow() // 限制窗口内容超出范围
                .always_on_top(data.auto_hide_window || data.always_on_top) // 窗口置顶
                .decorations(false) // 窗口无边框
                .visible(false) // 窗口默认不显示
                .skip_taskbar(data.auto_hide_window) // 任务栏不显示
                .focused(true) // 窗口聚焦
                .fullscreen(false) // 禁止全屏
                .incognito(true) // 隐私模式
                .shadow(true) // 窗口阴影
                .content_protected(false) // 禁止窗口被捕获
                .resizable(true) // 窗口可自由拖放大小
                .disable_drag_drop_handler() // 允许拖拽
                .transparent(false) // 窗口不透明
                .build();
            app.manage(window);
        }
        Err(_e) => {
            let window = WebviewWindow::builder(&app, "main", WebviewUrl::App(path))
                .title("main")
                .inner_size(350.0, 550.0) // 窗口初始大小
                .min_inner_size(350.0, 550.0) // 窗口最小大小
                .max_inner_size(800.0, 1000.0) // 窗口最大大小
                .prevent_overflow() // 限制窗口内容超出范围
                .always_on_top(true) // 窗口置顶
                .decorations(false) // 窗口无边框
                .visible(false) // 窗口默认不显示
                .skip_taskbar(true) // 任务栏不显示
                .focused(true) // 窗口聚焦
                .fullscreen(false) // 禁止全屏
                .incognito(true) // 隐私模式
                .shadow(true) // 窗口阴影
                .content_protected(false) // 禁止窗口被捕获
                .resizable(true) // 窗口可自由拖放大小
                .disable_drag_drop_handler() // 允许拖拽
                .transparent(false) // 窗口不透明
                .build();
            app.manage(window);
        }
    }
}

#[derive(Deserialize)]
pub struct Settings {
    #[serde(rename = "autoHideWindow")]
    auto_hide_window: bool,
    #[serde(rename = "alwaysOnTop")]
    always_on_top: bool,
    #[serde(rename = "imageBasePath")]
    pub image_base_path: String,
}
