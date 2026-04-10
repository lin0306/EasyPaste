use crate::i18n::state::I18nState;
use crate::i18n::{loader_custom, loader_default, loader_plugins};
use log::info;
use tauri::{AppHandle, Manager};

/**
 * 初始化语言
 */
pub fn init_locale(app: AppHandle) {
    info!("系统语言初始化...");
    println!("正在获取用户设置的语言");

    let state = app.state::<I18nState>();
    loader_default::load_default(&app, &state);
    loader_custom::load_custom_locales(&state);
    loader_plugins::load_plugins_locales(app.clone(), &state);

    info!("语言初始化完成");
}
