use clipboard_rs::WatcherShutdown;
use lazy_static::lazy_static;
use std::sync::{Arc, Mutex};
use std::thread;

#[derive(Default)]
pub struct ListenerState {
    /**
     * 监听线程
     */
    pub watcher_thread: Option<thread::JoinHandle<()>>,
    /**
     * 监听关闭
     */
    pub watcher_shutdown: Option<WatcherShutdown>,
    /**
     * 监听状态
     */
    pub listen_status: bool,
}

lazy_static! {
    pub static ref LISTENER_STATE: Arc<Mutex<ListenerState>> =
        Arc::new(Mutex::new(ListenerState::default()));
}
