mod commands;
mod event_handler;
mod menu_builder;
mod state;

use crate::tray::event_handler::*;
use crate::tray::menu_builder::build_tray_menu;
use crate::tray::state::TRAY_STATE;
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle};

pub use commands::*;

/**
 * 创建托盘
 */
pub fn create_tray(app: AppHandle) {
    let mut state = TRAY_STATE.lock().unwrap();
    let menu = build_tray_menu(&app);

    if state.is_loaded {
        if let Some(tray) = state.tray.take() {
            tray.set_menu(Some(menu)).unwrap();
            state.tray = Some(tray);
            return;
        }
    }

    let tray = TrayIconBuilder::new()
        .tooltip("EasyPaste")
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_tray_icon_event(|tray, event| match event {
            TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } => handle_tray_click(&tray),
            TrayIconEvent::Enter { .. } => handle_tray_enter(&tray),
            _ => {}
        })
        .on_menu_event(|app, event| handle_menu_event(&app, event.id.as_ref()))
        .build(&app)
        .unwrap();

    state.is_loaded = true;
    state.tray = Some(tray);
    state.win_current_visible = false;
    state.is_first_hide = false;
}

/**
 * 重新加载托盘菜单
 */
pub fn reload_tray_menu(app: AppHandle) -> tauri::Result<()> {
    println!("重新加载托盘菜单");
    create_tray(app);
    Ok(())
}
