use crate::i18n::models::{LanguageConfig, Tray};
use log::info;
use serde_json::from_slice;
use std::collections::HashMap;
use std::sync::Mutex;

pub struct I18nState {
    current_locale_id: Mutex<String>,
    locales: Mutex<HashMap<String, LanguageConfig>>,
}

impl I18nState {
    pub fn new() -> Self {
        Self {
            current_locale_id: Mutex::new("zhCN".to_string()),
            locales: Mutex::new(HashMap::new()),
        }
    }

    pub fn get_current_locale_id(&self) -> String {
        self.current_locale_id.lock().unwrap().clone()
    }

    pub fn set_current_locale_id(&self, locale_id: String) {
        *self.current_locale_id.lock().unwrap() = locale_id;
    }

    pub fn get_locales(&self) -> HashMap<String, LanguageConfig> {
        self.locales.lock().unwrap().clone()
    }

    pub fn get_locale_by_id(&self, locale_id: &str) -> Option<LanguageConfig> {
        self.locales.lock().unwrap().get(locale_id).cloned()
    }

    pub fn get_current_locale(&self) -> Option<LanguageConfig> {
        self.get_locale_by_id(self.get_current_locale_id().as_str())
    }

    pub fn insert_locale(&self, id: String, config: LanguageConfig) {
        self.locales.lock().unwrap().insert(id, config);
    }

    pub fn get_tray(&self) -> Tray {
        let option = self.get_locale_by_id(self.get_current_locale_id().as_str());
        if let Some(tray) = option.map(|l| l.pages.tray) {
            tray
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
