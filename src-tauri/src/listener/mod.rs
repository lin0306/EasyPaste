mod handler;
mod state;
mod image_utils;
mod clipboard_ops;

use crate::listener::handler::ClipboardManager;
use crate::listener::state::LISTENER_STATE;
use log::info;
use std::thread;
use clipboard_rs::ClipboardWatcher;
use tauri::{AppHandle, Emitter};

pub use clipboard_ops::*;

pub fn start_listening(app: AppHandle) {
    let mut state = LISTENER_STATE.lock().unwrap();

    if state.listen_status {
        info!("已经在监听了");
        return;
    }

    let manager = ClipboardManager::new(app.clone());
    let mut watcher = clipboard_rs::ClipboardWatcherContext::new().unwrap();
    let shutdown = watcher.add_handler(manager).get_shutdown_channel();

    let handle = thread::spawn(move || {
        info!("开始监听剪贴板变化...");
        watcher.start_watch();
    });

    state.watcher_shutdown = Some(shutdown);
    state.watcher_thread = Some(handle);
    state.listen_status = true;
    app.clone().emit("update-listening", true).unwrap();

    info!("已开始监听剪贴板");
}

pub fn stop_listening(app: AppHandle) {
    let mut state = LISTENER_STATE.lock().unwrap();

    if !state.listen_status {
        info!("当前没有监听，不需要停止监听");
        return;
    }

    state.watcher_shutdown.take().unwrap().stop();
    drop(state.watcher_thread.take());
    state.listen_status = false;
    app.clone().emit("update-listening", false).unwrap();

    info!("已停止监听剪贴板");
}
