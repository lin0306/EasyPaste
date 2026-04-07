use clipboard_rs::{Clipboard, ClipboardContext};
use log::error;

/**
 * 写入剪贴板
 */
#[tauri::command]
pub fn write_to_clipboard(content: String, format: String) -> bool {
    let ctx = ClipboardContext::new().unwrap();

    match format.as_str() {
        "text" => ctx.set_text(content).is_ok(),
        "image" => {
            let mut paths: Vec<String> = Vec::new();
            paths.push(content);
            ctx.set_files(paths).is_ok()
        }
        "files" => {
            let paths = serde_json::from_str::<Vec<String>>(&content).unwrap();
            ctx.set_files(paths).is_ok()
        }
        _ => {
            error!("文件类型不支持:{}复制到剪贴板", format);
            false
        }
    }
}

/**
 * 判断是否在监听
 */
#[tauri::command]
pub fn is_listening() -> bool {
    let state = super::state::LISTENER_STATE.lock().unwrap();
    state.listen_status
}
