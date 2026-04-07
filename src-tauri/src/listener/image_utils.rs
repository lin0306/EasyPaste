use log::info;
use std::fs::create_dir_all;
use std::path::PathBuf;
use tauri::path::BaseDirectory;
use tauri::{AppHandle, Manager};
use tauri_plugin_store::StoreExt;

/**
 * 获取图片保存路径
 */
pub fn get_image_path(app: AppHandle) -> String {
    let path_buf = get_image_folder(app);
    let image_file_name = format!(
        "EasyPaste_{}.jpg",
        chrono::Local::now().format("%Y-%m-%d_%H-%M-%S-%3f")
    );

    let mut full_path = path_buf.clone();
    full_path.push(image_file_name);

    full_path.to_str().expect("图片保存路径转换失败").to_owned()
}

/**
 * 获取图片文件夹路径
 */
fn get_image_folder(app: AppHandle) -> PathBuf {
    let settings_path = load_settings_path(&app);

    if let Some(path) = settings_path {
        info!("获取图片保存路径:{}", path.display());
        ensure_dir_exists(&path);
        return path;
    }

    let default_path = app
        .clone()
        .path()
        .resolve("images", BaseDirectory::AppData)
        .expect("获取图片目录失败");

    ensure_dir_exists(&default_path);
    default_path
}

/**
 * 从配置文件中获取图片保存路径
 */
fn load_settings_path(app: &AppHandle) -> Option<PathBuf> {
    match app.store("settings.json") {
        Ok(store) => {
            if store.has("imageBasePath") {
                if let Some(value) = store.get("imageBasePath") {
                    if let Some(path_str) = value.as_str() {
                        return Some(PathBuf::from(path_str));
                    }
                }
            }
        }
        _ => {}
    }
    None
}

/**
 * 确保目录存在
 */
fn ensure_dir_exists(path: &PathBuf) {
    if !path.exists() {
        create_dir_all(path).expect("创建图片目录失败");
    }
}
