use log::info;
use serde::{Deserialize, Serialize};
use serde_json::{from_reader, from_slice, Value};
use std::collections::HashMap;
use std::fs;
use std::fs::File;
use std::sync::Mutex;
use tauri::path::BaseDirectory;
use tauri::{AppHandle, Manager};
use tauri_plugin_store::StoreExt;
use crate::tray::reload_tray_menu;

pub struct I18nState {
    /**
     * 当前语言id
     */
    current_locale_id: Mutex<String>,
    /**
     * 语言列表
     */
    locales: Mutex<HashMap<String, LanguageConfig>>,
}

impl I18nState {
    pub fn new() -> Self {
        Self {
            current_locale_id: Mutex::new("zhCN".to_string()),
            locales: Mutex::new(HashMap::new()),
        }
    }

    /**
     * 获取当前语言id
     */
    pub fn get_current_locale_id(&self) -> String {
        self.current_locale_id.lock().unwrap().clone()
    }

    /**
     * 获取所有语言
     */
    pub fn get_locales(&self) -> HashMap<String, LanguageConfig> {
        self.locales.lock().unwrap().clone()
    }

    /**
     * 获取语言
     */
    pub fn get_locale_by_id(&self, locale_id: &str) -> Option<LanguageConfig> {
        self.locales.lock().unwrap().get(locale_id).cloned()
    }

    /**
     * 获取当前语言
     */
    pub fn get_current_locale(&self) -> Option<LanguageConfig> {
        self.get_locale_by_id(self.get_current_locale_id().as_str())
    }

    /**
     * 获取托盘语言
     */
    pub fn get_tray(&self) -> Tray {
        let option = self.get_locale_by_id(self.get_current_locale_id().as_str());
        if option.is_some() {
            option.unwrap().pages.tray
        } else {
            info!("使用默认托盘语言配置");
            let default_json = r#"{
                "settings": "设置",
                "clipboardMonitor": "剪贴板监听",
                "checkUpdate": "检查更新",
                "about": "关于",
                "restart": "重启",
                "exit": "退出"
            }"#;
            from_slice(default_json.as_bytes()).unwrap()
        }
    }
}

/**
 * 初始化语言
 */
pub fn init_locale(app: AppHandle) {
    info!("系统语言初始化...");
    println!("正在获取用户设置的语言");
    let state = app.state::<I18nState>();
    let mut inner = state.current_locale_id.lock().unwrap();
    match app.store("settings.json") {
        Ok(store) => {
            if store.has("languages") {
                let option = store.get("languages");
                if option.is_some() {
                    let languages = option.clone().unwrap();
                    let lang_str = languages.as_str().unwrap_or("chinese");

                    let normalized = match lang_str {
                        "chinese" => "zhCN",
                        "english" => "enUS",
                        _ => lang_str,
                    };

                    if normalized != lang_str {
                        store.set("languages", normalized);
                        store.save().expect("语言更新失败");
                    }

                    println!("用户语言配置: {}", normalized);
                    *inner = normalized.to_string();
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

    println!("正在加载默认语言文件...");
    // 语言资源目录
    let resource_locales_path = app
        .path()
        .resolve("resources/locales", BaseDirectory::Resource)
        .expect("获取不到语言文件");

    println!("语言文件目录: {:?}", resource_locales_path);

    if !resource_locales_path.exists() {
        log::warn!("语言文件目录不存在: {:?}", resource_locales_path);
        return;
    }

    match fs::read_dir(&resource_locales_path) {
        Ok(entries) => {
            for entry in entries {
                let entry = entry.expect("Invalid entry");
                let path = entry.path();
                if path.is_file() {
                    println!("加载语言文件: {:?}", path);
                    let file = File::open(path.clone()).expect("读取语言文件内容失败");
                    let data: LanguageConfig = from_reader(file).expect("语言文件内容处理失败");
                    let id = &data.id;
                    state.locales.lock().unwrap().insert(id.to_string(), data);
                }
            }
        }
        Err(e) => {
            log::error!("读取语言文件目录失败: {}", e);
        }
    }
    println!("默认语言文件加载完成");

    println!("加载用户自定义语言文件");
    // todo
    println!("用户自定义语言文件加载完成");

    println!("加载插件语言");
    // todo
    println!("插件语言加载完成");

    info!("语言初始化完成");
}

/**
 * 获取当前语言
 */
#[tauri::command]
pub fn get_current_locale(app: AppHandle) -> tauri::Result<LanguageConfig> {
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
    *state.current_locale_id.lock().unwrap() = locale;
    reload_tray_menu(app).expect("托盘语言更新失败");
    Ok(())
}

/**
 * 获取指定页面的语言数据
 */
#[tauri::command]
pub fn get_page_locale(app: AppHandle, page: String) -> tauri::Result<String> {
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
 * 获取当前语言的 UI 语言
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

#[derive(Deserialize, Serialize, Clone)]
pub struct Language {
    pub id: String,
    pub name: String,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct LanguageConfig {
    pub id: String,
    pub name: String,
    #[serde(rename = "uiLocale")]
    pub ui_locale: String,
    pub pages: Pages,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct Pages {
    pub settings: Value,
    pub list: Value,
    pub tags: Value,
    pub about: Value,
    pub update: Value,
    pub preview: Value,
    #[serde(rename = "pluginStore")]
    pub plugin_store: Value,
    pub plugins: Value,
    pub tray: Tray,
}

impl Pages {
    fn get_by_key(&self, key: &str) -> Option<&Value> {
        match key {
            "settings" => Some(&self.settings),
            "list" => Some(&self.list),
            "tags" => Some(&self.tags),
            "about" => Some(&self.about),
            "update" => Some(&self.update),
            "preview" => Some(&self.preview),
            "pluginStore" => Some(&self.plugin_store),
            "plugins" => Some(&self.plugins),
            _ => None,
        }
    }
}

#[derive(Deserialize, Serialize, Clone)]
pub struct Tray {
    pub settings: String,
    #[serde(rename = "checkUpdate")]
    pub check_update: String,
    pub about: String,
    pub restart: String,
    pub exit: String,
    #[serde(rename = "clipboardMonitor")]
    pub clipboard_monitor: String,
}
