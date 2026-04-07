use crate::listener;
use crate::tray::state::TRAY_STATE;
use tauri::{AppHandle, Emitter, Manager};

/**
 * 鼠标点击事件处理
 */
pub fn handle_tray_click(tray: &tauri::tray::TrayIcon) {
    let mut state = TRAY_STATE.lock().unwrap();

    if state.win_enter_visible && !state.win_current_visible && state.is_first_hide {
        state.is_first_hide = false;
        return;
    }

    println!("鼠标松开");
    let win = tray
        .app_handle()
        .get_webview_window("list")
        .expect("主窗口不存在");
    match win.is_visible() {
        Ok(visible) => {
            if !visible {
                println!("显示窗口");
                win.show().expect("窗口显示失败");
                win.unminimize().expect("窗口取消最小化失败");
                win.set_focus().expect("窗口聚焦失败");
                win.center().expect("居中窗口失败");

                state.win_current_visible = true;
                state.win_enter_visible = true;
                state.is_first_hide = false;
                tray.app_handle()
                    .emit("tray-open-window", "".to_string())
                    .unwrap();
            } else {
                println!("隐藏窗口");
                win.hide().expect("窗口隐藏失败");

                state.win_current_visible = false;
                state.win_enter_visible = false;
                state.is_first_hide = true;
            }
        }
        Err(e) => eprintln!("窗口可见性错误: {}", e),
    };
}

/**
 * 鼠标进入事件处理
 */
pub fn handle_tray_enter(tray: &tauri::tray::TrayIcon) {
    let mut state = TRAY_STATE.lock().unwrap();
    match tray.app_handle().get_webview_window("list") {
        Some(win) => {
            state.win_enter_visible = win.is_visible().unwrap();
        }
        None => {}
    }
}

/**
 * 菜单点击事件处理
 */
pub fn handle_menu_event(app: &AppHandle, event_id: &str) {
    match event_id {
        "settings" => {
            app.emit("open-settings", "".to_string()).unwrap();
            println!("打开设置窗口");
        }
        "clipboard_monitor" => {
            if listener::is_listening() {
                listener::stop_listening(app.clone());
                println!("停止监听剪贴板")
            } else {
                listener::start_listening(app.clone());
                println!("开始监听剪贴板")
            }
        }
        "check_update" => {
            app.emit("check-update", "".to_string()).unwrap();
        }
        "about" => {
            app.emit("open-about", "".to_string()).unwrap();
        }
        "restart" => {
            app.exit(0);
            app.restart()
        }
        "exit" => app.exit(0),
        _ => println!("菜单项 {:?} 未处理", event_id),
    }
}
