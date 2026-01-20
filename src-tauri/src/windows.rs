use crate::{file, plugins};
use log::info;
use serde::Deserialize;
use std::io::Write;
use std::path::PathBuf;
use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindow};

pub fn create_main_window(app: AppHandle) {
    let mut path = PathBuf::new();
    path.push("/list");

    match file::load_file_content::<Settings>(app.clone(), "settings.json".into()) {
        Ok(data) => {
            let window = WebviewWindow::builder(&app, "main", WebviewUrl::App(path))
                .title("EasyPaste")
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
                .transparent(true) // 窗口透明
                .visible_on_all_workspaces(true) // 窗口在所有工作区都显示
                .build();
            app.manage(window);
        }
        Err(_e) => {
            let window = WebviewWindow::builder(&app, "main", WebviewUrl::App(path))
                .title("EasyPaste")
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
                .transparent(true) // 窗口透明
                .visible_on_all_workspaces(true) // 窗口在所有工作区都显示
                .build();
            app.manage(window);
        }
    }
}

/**
 * 调用外部插件
 */
#[tauri::command]
pub async fn invoke_external_plugin(
    app: AppHandle,
    plugin_id: String,
    plugin_name: String,
    cmd: String,
    payload: serde_json::Value,
) -> Result<String, String> {
    info!(
        "invoke_external_plugin: {:?}, {:?}, {:?}, {:?}",
        plugin_id, plugin_name, cmd, payload
    );
    match plugins::get_plugins_dir(app) {
        Ok(plugins_dir) => {
            let mut path = PathBuf::new();
            path.push(plugins_dir);
            path.push(plugin_id);
            path.push(plugin_name);
            let plugin_path = path.to_string_lossy().to_string();
            let input = serde_json::json!({
                "cmd": cmd,
                "payload": payload
            })
            .to_string();

            // 启动子进程
            let mut child = std::process::Command::new(plugin_path)
                .stdin(std::process::Stdio::piped())
                .stdout(std::process::Stdio::piped())
                .stderr(std::process::Stdio::piped()) // 可选：捕获错误日志
                .spawn()
                .map_err(|e| format!("Failed to spawn plugin: {}", e))?;

            // 向 stdin 写入数据
            {
                let mut stdin = child.stdin.take().unwrap();
                stdin
                    .write_all(input.as_bytes())
                    .map_err(|e| format!("Failed to write to plugin stdin: {}", e))?;
                // stdin 在这里关闭，插件才能读到 EOF
            }

            // 等待插件执行完成
            let output = child
                .wait_with_output()
                .map_err(|e| format!("Plugin process failed: {}", e))?;

            if output.status.success() {
                let stdout_str = String::from_utf8(output.stdout)
                    .map_err(|e| format!("Invalid UTF-8 from plugin: {}", e))?;
                Ok(stdout_str.trim().to_string()) // 移除末尾换行
            } else {
                let stderr_str = String::from_utf8_lossy(&output.stderr);
                Err(format!(
                    "Plugin exited with error (code {}): {}",
                    output.status.code().unwrap_or(-1),
                    stderr_str
                ))
            }
        }
        _ => {
            return Err("插件文件夹获取失败".into());
        }
    }
}

#[derive(Deserialize)]
pub struct Settings {
    #[serde(rename = "autoHideWindow")]
    pub auto_hide_window: bool,
    #[serde(rename = "alwaysOnTop")]
    pub always_on_top: bool,
    #[serde(rename = "imageBasePath")]
    pub image_base_path: String,
    #[serde(rename = "enableImageSave")]
    pub enable_image_save: bool,
}
