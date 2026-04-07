use crate::utils::compress_utils;
use std::process::Command;

/**
 * 打开文件所在位置
 */
#[tauri::command]
pub async fn open_folder(path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let output = Command::new("explorer")
            .arg("/select,")
            .arg(&path)
            .output()
            .map_err(|e| e.to_string())?;
        if !output.status.success() {
            return Err(String::from("Failed to run explorer"));
        }
    }

    #[cfg(target_os = "macos")]
    {
        let output = Command::new("open")
            .arg("-R")
            .arg(&path)
            .output()
            .map_err(|e| e.to_string())?;
        if !output.status.success() {
            return Err(String::from("Failed to run open -R"));
        }
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    {
        use std::path::Path;
        let parent = Path::new(&path)
            .parent()
            .ok_or("Invalid path")?
            .to_str()
            .ok_or("Invalid UTF-8 in path")?;

        let output = Command::new("xdg-open")
            .arg(parent)
            .output()
            .map_err(|e| e.to_string())?;
        if !output.status.success() {
            return Err(String::from("Failed to open file manager"));
        }
    }

    Ok(())
}

/**
 * 读取 RAR 压缩文件数据
 */
#[tauri::command]
pub fn read_rar_data(path: String) -> Result<String, ()> {
    let data_list = compress_utils::parse_rar(&path);
    Ok(serde_json::to_string(&data_list).unwrap())
}

/**
 * 读取 TAR 压缩文件数据
 */
#[tauri::command]
pub fn read_tar_data(path: String) -> Result<String, ()> {
    let data_list = compress_utils::parse_tar(&path);
    Ok(serde_json::to_string(&data_list).unwrap())
}

/**
 * 读取 GZIP 压缩文件数据
 */
#[tauri::command]
pub fn read_gzip_data(path: String) -> Result<String, ()> {
    let data_list = compress_utils::parse_gzip(&path);
    Ok(serde_json::to_string(&data_list).unwrap())
}
