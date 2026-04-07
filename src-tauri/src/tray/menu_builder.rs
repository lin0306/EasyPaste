use crate::i18n::I18nState;
use crate::listener;
use tauri::menu::{CheckMenuItem, Menu, MenuItem, PredefinedMenuItem};
use tauri::{AppHandle, Manager, Wry};

/**
 * 创建托盘菜单
 */
pub fn build_tray_menu(app: &AppHandle) -> Menu<Wry> {
    let language = load_language(app);

    let settings =
        MenuItem::with_id(app, "settings", &language.settings, true, None::<&str>).unwrap();
    let clipboard_monitor = CheckMenuItem::with_id(
        app,
        "clipboard_monitor",
        &language.clipboard_monitor,
        true,
        listener::is_listening(),
        None::<&str>,
    )
    .unwrap();
    let check_update = MenuItem::with_id(
        app,
        "check_update",
        &language.check_update,
        true,
        None::<&str>,
    )
    .unwrap();
    let about = MenuItem::with_id(app, "about", &language.about, true, None::<&str>).unwrap();
    let restart = MenuItem::with_id(app, "restart", &language.restart, true, None::<&str>).unwrap();
    let exit = MenuItem::with_id(app, "exit", &language.exit, true, None::<&str>).unwrap();
    let separator = PredefinedMenuItem::separator(app).unwrap();

    Menu::with_items(
        app,
        &[
            &settings,
            &clipboard_monitor,
            &separator,
            &check_update,
            &about,
            &separator,
            &restart,
            &exit,
        ],
    )
    .unwrap()
}

fn load_language(app: &AppHandle) -> crate::i18n::models::Tray {
    let state = app.state::<I18nState>();
    state.get_tray()
}
