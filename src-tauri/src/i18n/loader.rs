use crate::i18n::models::{LanguageConfig, PluginLanguage};
use crate::i18n::state::I18nState;
use log::{error, info, warn};
use serde_json::from_reader;
use std::fs::{self, File};
use std::path::PathBuf;
use tauri::path::BaseDirectory;
use tauri::{AppHandle, Manager};
use tauri_plugin_store::StoreExt;

/**
 * 初始化语言
 */
pub fn init_locale(app: AppHandle) {
    info!("系统语言初始化...");
    println!("正在获取用户设置的语言");

    let state = app.state::<I18nState>();
    load_user_language(&app, &state);
    load_default_languages(&app, &state);
    load_custom_languages(&state);
    load_plugin_languages(app.clone(), &state);

    info!("语言初始化完成");
}

/**
 * 加载用户语言
 */
fn load_user_language(app: &AppHandle, state: &I18nState) {
    match app.store("settings.json") {
        Ok(store) => {
            if store.has("languages") {
                if let Some(languages) = store.get("languages") {
                    let lang_str = languages.as_str().unwrap_or("chinese");
                    let normalized = normalize_language(lang_str);

                    if normalized != lang_str {
                        store.set("languages", normalized);
                        store.save().expect("语言更新失败");
                    }

                    println!("用户语言配置: {}", normalized);
                    state.set_current_locale_id(normalized.to_string());
                } else {
                    println!("未获取到用户设置的语言，使用系统默认语言")
                }
            } else {
                println!("未获取到用户设置语言，使用系统默认语言");
            }
        }
        _ => {
            println!("未获取到用户设置语言，使用系统默认语言")
        }
    }
}

/**
 * 语言ID转换
 */
fn normalize_language(lang: &str) -> &str {
    match lang {
        "chinese" => "zhCN",
        "english" => "enUS",
        _ => lang,
    }
}

/**
 * 加载默认语言
 */
fn load_default_languages(app: &AppHandle, state: &I18nState) {
    println!("正在加载默认语言文件...");

    let resource_locales_path = app
        .path()
        .resolve("resources/locales", BaseDirectory::Resource)
        .expect("获取不到语言文件");

    println!("语言文件目录: {:?}", resource_locales_path);

    if !resource_locales_path.exists() {
        warn!("语言文件目录不存在: {:?}", resource_locales_path);
        return;
    }

    match fs::read_dir(&resource_locales_path) {
        Ok(entries) => {
            for entry in entries {
                let entry = entry.expect("Invalid entry");
                let path = entry.path();
                if path.is_file() {
                    println!("加载语言文件: {:?}", path);
                    if let Ok(file) = File::open(path.clone()) {
                        if let Ok(data) = from_reader::<File, LanguageConfig>(file) {
                            let id = data.id.clone();
                            state.insert_locale(id, data);
                        }
                    }
                }
            }
        }
        Err(e) => {
            error!("读取语言文件目录失败: {}", e);
        }
    }
    println!("默认语言文件加载完成");
}

/**
 * 加载用户自定义语言
 */
fn load_custom_languages(_state: &I18nState) {
    println!("加载用户自定义语言文件");
    // todo
    println!("用户自定义语言文件加载完成");
}

/**
 * 加载插件语言
 */
fn load_plugin_languages(app: AppHandle, state: &I18nState) {
    println!("加载插件语言");
    let plugins_path: PathBuf = match app.store("settings.json") {
        Ok(store) => {
            if store.has("pluginPath") {
                PathBuf::from(
                    store
                        .get("pluginPath")
                        .expect("插件路径获取失败")
                        .as_str()
                        .expect("插件路径获取失败")
                )
            } else {
                app.path()
                    .resolve("plugins", BaseDirectory::AppLocalData)
                    .expect("获取不到语言文件")
            }
        }
        _ => app
            .path()
            .resolve("plugins", BaseDirectory::AppLocalData)
            .expect("获取不到语言文件"),
    };
    println!("插件文件所在目录: {:?}", plugins_path);
    if plugins_path.exists() {
        // 遍历插件目录
        for plugin_entry in fs::read_dir(plugins_path).expect("无法读取插件目录") {
            let plugin_entry = plugin_entry.expect("无效的插件目录");
            let plugin_path = plugin_entry.path();
            println!("正在加载的插件目录: {:?}", plugin_path);
            if plugin_path.is_dir() {
                let locales_path = plugin_path.join("locales");
                if locales_path.exists() {
                    for locale_entry in fs::read_dir(locales_path).expect("无法读取插件语言目录")
                    {
                        let locale_entry = locale_entry.expect("无效的插件语言目录");
                        let locale_path = locale_entry.path();
                        if locale_path.is_file()
                            && locale_path
                                .file_name()
                                .expect("文件名获取失败")
                                .to_string_lossy()
                                .ends_with(".json")
                        {
                            println!("正在加载插件语言文件: {:?}", locale_path);
                            match File::open(locale_path) {
                                Ok(file) => {
                                    match from_reader::<File, PluginLanguage>(file) {
                                        Ok(data) => {
                                            state.insert_plugin_locale(data);
                                        }
                                        Err(e) => {
                                            warn!("解析插件语言文件失败: {:?}, 错误: {}", locale_entry.file_name(), e);
                                        }
                                    }
                                }
                                Err(_) => {
                                    warn!("无法打开插件语言文件: {:?}, {:?}",plugin_entry.file_name(), locale_entry.file_name());
                                }
                            }
                        }
                    }
                } else {
                    println!("插件语言目录不存在: {:?}", plugin_entry.file_name());
                }
            }
        }
    }
    println!("插件语言加载完成");
}
