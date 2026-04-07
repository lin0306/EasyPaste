use std::sync::{Arc, Mutex};
use tauri::tray::TrayIcon;
use lazy_static::lazy_static;

#[derive(Default)]
pub struct TrayState {
    pub tray: Option<TrayIcon>,
    pub is_loaded: bool,
    pub win_current_visible: bool,
    pub win_enter_visible: bool,
    pub is_first_hide: bool,
}

lazy_static! {
    pub static ref TRAY_STATE: Arc<Mutex<TrayState>> = 
        Arc::new(Mutex::new(TrayState::default()));
}
