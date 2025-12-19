use crate::file;
use crate::windows::Settings;
use clipboard_rs::common::RustImage;
use clipboard_rs::{
    Clipboard, ClipboardContext, ClipboardHandler, ClipboardWatcher, ClipboardWatcherContext,
    WatcherShutdown,
};
use log::{error, info};
use serde_json::Map;
use std::fs::create_dir_all;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use std::thread;
use tauri::{AppHandle, Emitter};

struct Manager {
    ctx: ClipboardContext,
    app: AppHandle,
}

impl Manager {
    pub fn new(app: AppHandle) -> Self {
        let ctx = ClipboardContext::new().unwrap();
        Manager { ctx, app }
    }
}

impl ClipboardHandler for Manager {
    fn on_clipboard_change(&mut self) {
        // 1. 检测文件
        if let Ok(files) = self.ctx.get_files() {
            info!("检测到剪贴板有复制到新的文件，files:{}", files.join(";"));
            let mut map = Map::new();
            map.insert("type".into(), "file".into());
            map.insert(
                "file_path".into(),
                serde_json::Value::String(serde_json::to_string(&files).unwrap()),
            );
            let _ = self.app.emit("clipboard-change", serde_json::json!(&map));
            return;
        }

        // 2. 检测文本
        if let Ok(text) = self.ctx.get_text() {
            info!("检测到剪贴板有复制到新的文本，text:{}", text);
            let mut map = Map::new();
            map.insert("type".into(), "text".into());
            map.insert("content".into(), text.into());
            let _ = self.app.emit("clipboard-change", serde_json::json!(&map));
            return;
        }

        // 3.检测图片
        if let Ok(image) = self.ctx.get_image() {
            // 如果配置中未开启保存图片功能，则不保存图片
            let mut is_save_image = false;
            if let Ok(data) = file::load_file_content::<Settings>(self.app.clone(), "settings.json".into()) {
                if data.enable_image_save {
                    is_save_image = true;
                }
            }
            if !is_save_image {
                info!("剪贴板有复制到新的图片，但未开启保存图片功能");
                return;
            }

            // 获取图片保存路径
            let mut path = get_image_base_path(self.app.clone());
            // 拼接文件名：EasyPaste_当前时间.jpg
            let image_file_name = format!(
                "EasyPaste_{}.jpg",
                chrono::Local::now().format("%Y-%m-%d_%H-%M-%S-%3f")
            );
            // 文件路径拼接
            path.push(image_file_name);
            let path = path.to_str().expect("图片保存路径转换失败").to_owned();
            // 保存图片
            if image.save_to_path(&path).is_ok() {
                info!("检测到剪贴板有复制到新的图片，image_path:{}", path);
                let mut map = Map::new();
                map.insert("type".into(), "image".into());
                map.insert("file_path".into(), path.into());
                let _ = self.app.emit("clipboard-change", serde_json::json!(&map));
            } else {
                error!("图片保存失败，{}", path);
            }
            return;
        }
    }
}

// 全局状态管理结构体
#[derive(Default)]
struct ListenerState {
    watcher_thread: Option<thread::JoinHandle<()>>,
    watcher_shutdown: Option<WatcherShutdown>,
    is_listening: bool,
}

// 使用 Arc + Mutex 实现线程安全共享
lazy_static::lazy_static! {
    static ref LISTENER_STATE: Arc<Mutex<ListenerState>> = Arc::new(Mutex::new(ListenerState::default()));
}

// 开始监听函数（会启动线程）
pub fn start_listening(app: AppHandle) {
    let mut state = LISTENER_STATE.lock().unwrap();

    if state.is_listening {
        info!("已经在监听了");
        return;
    }

    let manager = Manager::new(app);

    let mut watcher = ClipboardWatcherContext::new().unwrap();

    let shutdown = watcher.add_handler(manager).get_shutdown_channel();
    let handle = thread::spawn(move || {
        info!("开始监听剪贴板变化...");
        watcher.start_watch();
    });

    state.watcher_shutdown = Some(shutdown);
    state.watcher_thread = Some(handle);
    state.is_listening = true;
}

// 停止监听函数
pub fn stop_listening() {
    let mut state = LISTENER_STATE.lock().unwrap();

    if !state.is_listening {
        info!("当前没有监听，不需要停止监听");
        return;
    }

    // 这里假设 `ClipboardWatcherContext.start_watch()` 是阻塞式的，
    // 并且当线程被 drop 时自动退出（或你可以在 `Manager` 中实现 drop 逻辑）。
    // 如果你的 `watcher` 支持主动关闭，请在这里添加关闭逻辑。

    state.watcher_shutdown.take().unwrap().stop();
    drop(state.watcher_thread.take()); // 等待线程结束
    state.is_listening = false;
    info!("已停止监听剪贴板");
}

// 获取监听状态
pub fn is_listening() -> bool {
    let state = LISTENER_STATE.lock().unwrap();
    state.is_listening
}

// Tauri 命令：写入剪贴板
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
            return false;
        }
    }
}

/**
 * 获取图片保存路径
 */
fn get_image_base_path(app: AppHandle) -> PathBuf {
    let mut settings_image_path: Option<PathBuf> = None;
    if let Ok(data) =
        file::load_file_content::<Settings>(app.clone(), "settings.json".into())
    {
        if !data.image_base_path.trim().is_empty() {
            // 如果配置中的路径非空，尝试使用它
            settings_image_path = Some(PathBuf::from(&data.image_base_path));
        }
    }

    // 如果没拿到有效路径，使用默认路径
    if let Some(path) = settings_image_path {
        return path;
    };
    let appdata_dir = dirs::data_dir().expect("未找到数据目录");
    let mut path = PathBuf::new();
    path.push(appdata_dir);
    path.push(app.config().identifier.clone());
    path.push("images");
    if !path.exists() {
        create_dir_all(&path).expect("图片文件夹创建失败");
    }
    path
}
