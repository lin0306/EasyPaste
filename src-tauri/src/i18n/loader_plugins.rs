use std::fs;
use std::fs::File;
use std::path::PathBuf;
use log::warn;
use serde_json::from_reader;
use tauri::{AppHandle, Manager};
use tauri::path::BaseDirectory;
use tauri_plugin_store::StoreExt;
use crate::i18n::I18nState;
use crate::i18n::models::PluginLanguage;

/**
 * 加载所有插件的语言
 */
pub fn load_plugins_locales(app: AppHandle, state: &I18nState) {
    println!("加载插件语言");
    let plugins_path = get_plugins_path(app);
    println!("插件文件所在目录: {:?}", plugins_path);
    if plugins_path.exists() {
        // 遍历插件目录
        for plugin_entry in fs::read_dir(plugins_path).expect("无法读取插件目录") {
            let plugin_entry = plugin_entry.expect("无效的插件目录");
            let plugin_path = plugin_entry.path();
            println!("正在加载的插件目录: {:?}", plugin_path);
            load_plugin_locales(state, plugin_path);
        }
    }
    println!("插件语言加载完成");
}

/**
 * 根据插件ID加载插件语言
 */
pub fn load_plugin_locales_by_plugin_id(app: AppHandle, state: &I18nState, plugin_id: &str) {
    println!("加载 {} 插件语言", plugin_id);
    let plugins_path = get_plugins_path(app);
    println!("插件文件所在目录: {:?}", plugins_path);
    if plugins_path.exists() {
        let plugin_path = plugins_path.join(plugin_id);
        load_plugin_locales(state, plugin_path);
    }
    println!("{} 插件语言加载完成", plugin_id);
}

/**
 * 加载插件语言
 */
fn load_plugin_locales(state: &I18nState, plugin_path: PathBuf) {
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
                        Ok(file) => match from_reader::<File, PluginLanguage>(file) {
                            Ok(data) => {
                                state.insert_plugin_locale(data);
                            }
                            Err(e) => {
                                warn!(
                                        "解析插件语言文件失败: {:?}, 错误: {}",
                                        locale_entry.file_name(),
                                        e
                                    );
                            }
                        },
                        Err(_) => {
                            warn!(
                                    "无法打开插件语言文件: {:?}, {:?}",
                                    plugin_path.file_name(),
                                    locale_entry.file_name()
                                );
                        }
                    }
                }
            }
        } else {
            println!("插件语言目录不存在: {:?}", plugin_path.file_name());
        }
    }
}

/**
 * 获取插件目录
 */
fn get_plugins_path(app: AppHandle) -> PathBuf {
    let plugins_path: PathBuf = match app.store("settings.json") {
        Ok(store) => {
            if store.has("pluginPath") {
                PathBuf::from(
                    store
                        .get("pluginPath")
                        .expect("插件路径获取失败")
                        .as_str()
                        .expect("插件路径获取失败"),
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
    plugins_path
}