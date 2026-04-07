use crate::tray::state::TRAY_STATE;

/**
 * 接收窗口隐藏消息
 */
#[tauri::command]
pub fn hide_win_msg() {
    let mut state = TRAY_STATE.lock().unwrap();
    state.win_current_visible = false;
    state.is_first_hide = true;
}
