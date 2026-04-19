use serde::{Deserialize, Serialize};
use serde_json::Value;

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
    #[serde(rename = "themeEditor")]
    pub theme_editor: Value,
    pub list: Value,
    #[serde(rename = "itemEditor")]
    pub item_editor: Value,
    pub tags: Value,
    pub about: Value,
    pub update: Value,
    pub preview: Value,

    #[serde(rename = "pluginStore")]
    pub plugin_store: Value,
    #[serde(rename = "pluginView")]
    pub plugin_view: Value,
    pub plugins: Value,
    pub tray: Tray,
}

impl Pages {
    pub fn get_by_key(&self, key: &str) -> Option<&Value> {
        match key {
            "settings" => Some(&self.settings),
            "themeEditor" => Some(&self.theme_editor),
            "list" => Some(&self.list),
            "itemEditor" => Some(&self.item_editor),
            "tags" => Some(&self.tags),
            "about" => Some(&self.about),
            "update" => Some(&self.update),
            "preview" => Some(&self.preview),
            "pluginStore" => Some(&self.plugin_store),
            "pluginView" => Some(&self.plugin_view),
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

#[derive(Deserialize, Serialize, Clone)]
pub struct PluginLanguage {
    pub id: String,
    #[serde(rename = "pluginId")]
    pub plugin_id: String,
    pub locale: Value,
}