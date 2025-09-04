use serde::de::DeserializeOwned;
use serde_json::from_reader;
use std::fs::File;
use std::path::PathBuf;
use tauri::AppHandle;

/**
 * 加载文件内容
 */
pub fn load_file_content<T: DeserializeOwned>(
    app: AppHandle,
    file_name: String,
) -> tauri::Result<T> {
    let appdata_dir = dirs::data_dir().expect("未找到数据目录");
    let mut path = PathBuf::new();
    path.push(appdata_dir);
    path.push(&app.config().identifier);
    path.push(file_name);
    if path.exists() {
        // 文件存在，读取文件内容
        let file = File::open(path)?;
        let data: T = from_reader(file)?;
        Ok(data)
    } else {
        // 失败
        Err(tauri::Error::Io(std::io::Error::new(
            std::io::ErrorKind::Other,
            "找不到文件",
        )))
    }
}

/**
 * 打开文件夹
 */
#[tauri::command]
pub async fn open_folder(path: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    let command = "open";

    #[cfg(target_os = "windows")]
    let command = "explorer";

    std::process::Command::new(command)
        .arg(&path)
        .spawn()
        .map_err(|e| e.to_string())?;

    Ok(())
}