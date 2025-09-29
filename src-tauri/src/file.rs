use serde::de::DeserializeOwned;
use serde::{Deserialize, Serialize};
use serde_json::from_reader;
use std::fs::File;
use std::io::BufReader;
use std::path::PathBuf;
use tauri::AppHandle;
use unrar::Archive;

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

/**
 * 读取rar文件内容
 */
#[tauri::command]
pub fn read_rar_data(path: String) -> Result<String, ()> {
    let mut data_list: Vec<TreeOption> = Vec::new();
    for entry in Archive::new(&path).open_for_listing().unwrap() {
        let file_info = entry.unwrap();
        data_list.push(TreeOption {
            path: file_info.filename.to_str().unwrap().to_string().replace("\\", "/"), // 统一使用左斜杠
            dir: file_info.is_directory(),
            date: file_info.file_time as u64,
            size: file_info.unpacked_size,
        });
    }
    // 按照文件名长短进行排序，保证文件夹的顺序在文件前面
    data_list.sort_by(|a, b| a.path.len().cmp(&b.path.len()));

    Ok(serde_json::to_string(&data_list).unwrap())
}

/**
 * 读取tar文件内容
 */
#[tauri::command]
pub fn read_tar_data(path: String) -> Result<String, ()> {
    let mut data_list: Vec<TreeOption> = Vec::new();
    tar::Archive::new(File::open(path).unwrap())
        .entries()
        .unwrap()
        .for_each(|entry| {
            let entry = entry.unwrap();
            data_list.push(TreeOption {
                path: entry.path().unwrap().to_str().unwrap().to_string(),
                dir: entry.header().entry_type().is_dir(),
                date: entry.header().mtime().unwrap(),
                size: entry.header().size().unwrap(),
            });
        });
    Ok(serde_json::to_string(&data_list).unwrap())
}

/**
 * 读取gzip文件内容
 */
#[tauri::command]
pub fn read_gzip_data(path: String) -> Result<String, ()> {
    let mut data_list: Vec<TreeOption> = Vec::new();
    // 打开 .tar.gz 文件
    let file = File::open(&path).unwrap();
    let buf_reader = BufReader::new(file);

    // 使用 flate2 解压 Gzip 流
    let gz_decoder = flate2::read::GzDecoder::new(buf_reader);

    // 使用 tar 读取解压后的 tar 流
    let mut archive = tar::Archive::new(gz_decoder);

    archive.entries().unwrap().for_each(|entry| {
        let entry = entry.unwrap();
        data_list.push(TreeOption {
            path: entry.path().unwrap().to_str().unwrap().to_string(),
            dir: entry.header().entry_type().is_dir(),
            date: entry.header().mtime().unwrap(),
            size: entry.header().size().unwrap(),
        });
    });
    Ok(serde_json::to_string(&data_list).unwrap())
}

/**
 * 文件树节点
 */
#[derive(Deserialize, Serialize)]
pub struct TreeOption {
    pub(crate) path: String,
    dir: bool,
    date: u64,
    size: u64,
}
