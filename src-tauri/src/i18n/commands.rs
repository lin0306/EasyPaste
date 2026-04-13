use log::info;
use crate::i18n::models::Language;
use crate::tray::reload_tray_menu;
use tauri::{AppHandle, Manager};
use crate::i18n::{loader_plugins, I18nState};

/**
 * 获取当前语言
 */
#[tauri::command]
pub fn get_current_locale(app: AppHandle) -> tauri::Result<crate::i18n::models::LanguageConfig> {
    let state = app.state::<I18nState>();
    let option = state.get_current_locale();
    Ok(option.unwrap().clone())
}

/**
 * 获取所有语言
 */
#[tauri::command]
pub fn get_locales(app: AppHandle) -> tauri::Result<String> {
    let state = app.state::<I18nState>();
    let languages: Vec<Language> = state
        .get_locales()
        .values()
        .cloned()
        .map(|x| Language {
            id: x.id,
            name: x.name,
        })
        .collect();
    Ok(serde_json::to_string(&languages)?.to_string())
}

/**
 * 更新当前语言
 */
#[tauri::command]
pub fn update_current_locale(app: AppHandle, locale: String) -> tauri::Result<()> {
    let state = app.state::<I18nState>();
    state.set_current_locale_id(locale);
    reload_tray_menu(app).expect("托盘语言更新失败");
    Ok(())
}

/**
 * 获取页面语言
 */
#[tauri::command]
pub fn get_page_locale(app: AppHandle, page: String) -> tauri::Result<String> {
    info!("获取 {} 页面语言", page);
    let state = app.state::<I18nState>();
    let option = state.get_locale_by_id(state.get_current_locale_id().as_str());

    match option {
        Some(locale) => match locale.pages.get_by_key(&page) {
            Some(value) => Ok(value.clone().to_string()),
            None => Err(tauri::Error::Anyhow(anyhow::anyhow!(
                "页面 '{}' 不存在",
                page
            ))),
        },
        None => Err(tauri::Error::Anyhow(anyhow::anyhow!("语言配置不存在"))),
    }
}

/**
 * 获取UI框架语言
 */
#[tauri::command]
pub fn get_ui_locale(app: AppHandle) -> tauri::Result<String> {
    let state = app.state::<I18nState>();
    let option = state.get_locale_by_id(state.get_current_locale_id().as_str());

    match option {
        Some(locale) => Ok(locale.ui_locale),
        None => Ok("zhCN".to_string()),
    }
}

/**
 * 加载指定插件的语言
 */
#[tauri::command]
pub fn load_plugin_locales(app: AppHandle, plugin_id: &str) {
    println!("加载插件语言: {}", plugin_id);
    let state = app.state::<I18nState>();
    loader_plugins::load_plugin_locales_by_plugin_id(app.clone(), &state, plugin_id);
}
