use log::info;
use std::path::PathBuf;
use tauri::AppHandle;

/**
 * 获取插件目录
 */
#[tauri::command]
pub fn get_plugins_dir(app: AppHandle) -> Result<String, String> {
    let appdata_dir = dirs::data_local_dir().expect("未找到数据目录");
    let mut path = PathBuf::new();
    path.push(appdata_dir);
    path.push(&app.config().identifier);
    path.push("plugins");
    info!("插件目录: {}", path.to_string_lossy());
    Ok(path.to_string_lossy().into_owned())
}
