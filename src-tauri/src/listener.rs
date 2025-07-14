use std::sync::{Arc, Mutex};
use clipboard_rs::{
    Clipboard, ClipboardContext, ClipboardHandler, ClipboardWatcher, ClipboardWatcherContext,
};
use serde_json::Map;
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
            println!("files:{}", files.join(";"));
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
            println!("text:{}", text);
            let mut map = Map::new();
            map.insert("type".into(), "text".into());
            map.insert("content".into(), text.into());
            let _ = self.app.emit("clipboard-change", serde_json::json!(&map));
            return;
        }
    }
}

// 全局状态管理结构体
#[derive(Default)]
struct ListenerState {
    watcher_thread: Option<thread::JoinHandle<()>>,
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
        println!("已经在监听了");
        return;
    }

    let manager = Manager::new(app);

    let mut watcher = ClipboardWatcherContext::new().unwrap();

    let handle = thread::spawn(move || {
        println!("开始监听剪贴板变化...");
        watcher.add_handler(manager).start_watch();
    });

    state.watcher_thread = Some(handle);
    state.is_listening = true;
}

// 停止监听函数
pub fn stop_listening() {
    let mut state = LISTENER_STATE.lock().unwrap();

    if !state.is_listening {
        println!("当前没有监听");
        return;
    }

    // 这里假设 `ClipboardWatcherContext.start_watch()` 是阻塞式的，
    // 并且当线程被 drop 时自动退出（或你可以在 `Manager` 中实现 drop 逻辑）。
    // 如果你的 `watcher` 支持主动关闭，请在这里添加关闭逻辑。

    drop(state.watcher_thread.take()); // 等待线程结束
    state.is_listening = false;
    println!("已停止监听剪贴板");
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
        "files" => {
            let paths = serde_json::from_str::<Vec<String>>(&content).unwrap();
            ctx.set_files(paths).is_ok()
        }
        _ => {
            panic!("文件类型不支持");
        }
    }
}
