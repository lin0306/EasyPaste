use crate::i18n::models::LanguageConfig;
use crate::i18n::I18nState;
use log::{error, warn};
use serde_json::from_reader;
use std::fs;
use std::fs::File;
use tauri::path::BaseDirectory;
use tauri::{AppHandle, Manager};
use tauri_plugin_store::StoreExt;

pub fn load_default(app: &AppHandle, state: &I18nState) {
    load_user_language(&app, &state);
    load_default_locales(&app, &state);
    // println!(
    //     "加载系统默认语言：{:?}",
    //     serde_json::to_string(&state.get_locales())
    // )
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
 * 加载默认语言
 */
fn load_default_locales(app: &AppHandle, state: &I18nState) {
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
                    match File::open(path.clone()) {
                        Ok(file) => match from_reader::<File, LanguageConfig>(file) {
                            Ok(data) => {
                                let id = data.id.clone();
                                // println!("语言ID: {}", id);
                                // println!("语言数据: {:?}", serde_json::to_string(&data.clone()));
                                state.insert_locale(id, data);
                            }
                            Err(e) => {
                                error!("读取语言文件失败: {}", e)
                            }
                        },
                        Err(e) => {
                            error!("打开语言文件失败: {}", e)
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
 * 语言ID转换
 */
fn normalize_language(lang: &str) -> &str {
    match lang {
        "chinese" => "zhCN",
        "english" => "enUS",
        _ => lang,
    }
}
