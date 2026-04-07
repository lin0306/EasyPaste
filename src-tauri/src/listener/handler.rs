use crate::listener::image_utils;
use clipboard_rs::{Clipboard, ClipboardContext, ClipboardHandler, RustImageData};
use clipboard_rs::common::RustImage;
use log::{error, info};
use serde_json::Map;
use tauri::{AppHandle, Emitter};
use tauri_plugin_store::StoreExt;

pub struct ClipboardManager {
    ctx: ClipboardContext,
    app: AppHandle,
}

impl ClipboardManager {
    pub fn new(app: AppHandle) -> Self {
        let ctx = ClipboardContext::new().unwrap();
        ClipboardManager { ctx, app }
    }
}

impl ClipboardHandler for ClipboardManager {
    fn on_clipboard_change(&mut self) {
        if let Ok(files) = self.ctx.get_files() {
            info!("检测到剪贴板有复制到新的文件，files:{}", files.join(";"));
            self.emit_clipboard_change("file", |map| {
                map.insert(
                    "file_path".into(),
                    serde_json::Value::String(serde_json::to_string(&files).unwrap()),
                );
            });
            return;
        }

        if let Ok(text) = self.ctx.get_text() {
            info!("检测到剪贴板有复制到新的文本，text:{}", text);
            self.emit_clipboard_change("text", |map| {
                map.insert("content".into(), text.into());
            });
            return;
        }

        if let Ok(image) = self.ctx.get_image() {
            self.handle_image(image);
        }
    }
}

impl ClipboardManager {
    fn emit_clipboard_change<F>(&self, clip_type: &str, extra: F)
    where
        F: FnOnce(&mut Map<String, serde_json::Value>),
    {
        let mut map = Map::new();
        map.insert("type".into(), clip_type.into());
        extra(&mut map);
        let _ = self.app.emit("clipboard-change", serde_json::json!(&map));
    }

    fn handle_image(&self, image: RustImageData) {
        let mut is_save_image = false;
        match self.app.store("settings.json") {
            Ok(store) => {
                if store.has("enableImageSave") {
                    is_save_image = store.get("enableImageSave").unwrap().is_boolean();
                }
            }
            _ => {}
        }

        if !is_save_image {
            info!("剪贴板有复制到新的图片，但未开启保存图片功能");
            return;
        }

        let path = image_utils::get_image_path(self.app.clone());
        if image.save_to_path(&path).is_ok() {
            info!("检测到剪贴板有复制到新的图片，image_path:{}", path);
            self.emit_clipboard_change("image", |map| {
                map.insert("file_path".into(), path.into());
            });
        } else {
            error!("图片保存失败，{}", path);
        }
    }
}
