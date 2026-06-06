use crate::models::file_model::TreeOption;
use chrono::{NaiveDate, TimeZone, Utc};
use flate2::read::GzDecoder;
use std::fs::File;
use std::io::{BufReader, Read};
use std::path::Path;
use std::{fs, io};
use unrar::Archive;
use zip::ZipArchive;

/**
 * 解析rar文件
 */
pub fn parse_rar(path: &str) -> Vec<TreeOption> {
    let mut data_list = Vec::new();
    for entry in Archive::new(path).open_for_listing().unwrap() {
        let file_info = entry.unwrap();
        data_list.push(TreeOption {
            path: file_info
                .filename
                .to_str()
                .unwrap()
                .to_string()
                .replace("\\", "/"),
            dir: file_info.is_directory(),
            date: file_info.file_time as u64,
            size: file_info.unpacked_size,
        });
    }
    data_list.sort_by(|a, b| a.path.len().cmp(&b.path.len()));
    data_list
}

/**
 * 解析tar文件
 */
pub fn parse_tar(path: &str) -> Vec<TreeOption> {
    let mut data_list = Vec::new();
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
    data_list
}

/**
 * 解析gzip文件
 */
pub fn parse_gzip(path: &str) -> Vec<TreeOption> {
    let mut data_list = Vec::new();
    let file = File::open(path).unwrap();
    let buf_reader = BufReader::new(file);
    let gz_decoder = GzDecoder::new(buf_reader);
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
    data_list
}

/**
 * 解压zip文件
 */
pub fn unzip_file(zip_path: &str, target_dir: &str) -> bool {
    let file = File::open(zip_path).expect("无法打开 ZIP 文件");
    let mut archive = ZipArchive::new(file).expect("无法创建 ZIP 存档");

    for i in 0..archive.len() {
        let mut entry = archive.by_index(i).expect("无法获取条目");
        let out_path = Path::new(target_dir).join(entry.name());

        if entry.is_dir() {
            // 如果是目录，直接创建
            fs::create_dir_all(&out_path).expect("无法创建目录");
        } else {
            // 如果是文件，确保父目录存在并写入内容
            if let Some(parent) = out_path.parent() {
                fs::create_dir_all(parent).expect("无法创建目录");
            }
            let mut outfile = File::create(&out_path).expect("无法创建文件");
            io::copy(&mut entry, &mut outfile).expect("无法写入文件");
        }
    }
    true
}

/**
 * 读取zip文件
 */
pub fn parse_zip(zip_path: &str) -> Vec<TreeOption> {
    let mut data_list = Vec::new();
    let file = File::open(zip_path).expect("无法打开 ZIP 文件");
    let mut archive = ZipArchive::new(file).expect("无法创建 ZIP 存档");

    // 遍历 ZIP 归档中的每个条目
    for i in 0..archive.len() {
        let entry = archive.by_index(i).expect("无法获取条目");

        // 获取最后修改时间并转换为 u64 时间戳
        // 直接使用 zip::DateTime 的字段配合 chrono 进行转换
        let date = entry
            .last_modified()
            .and_then(|dt| {
                // 1. 使用 zip 提供的 year, month, day 等方法构建 NaiveDate
                let naive_date =
                    NaiveDate::from_ymd_opt(dt.year() as i32, dt.month() as u32, dt.day() as u32)?;

                // 2. 结合时分秒构建 NaiveDateTime
                let naive_datetime = naive_date.and_hms_opt(
                    dt.hour() as u32,
                    dt.minute() as u32,
                    dt.second() as u32,
                )?;

                // 3. 假设 ZIP 内的时间为 UTC，转换为带时区的 DateTime 并提取时间戳
                Some(Utc.from_utc_datetime(&naive_datetime).timestamp() as u64)
            })
            .unwrap_or(0); // 如果时间解析失败，默认返回 0

        // 4. 构建 TreeOption 并加入列表
        data_list.push(TreeOption {
            path: entry.name().to_string(),
            dir: entry.is_dir(),
            date,
            size: entry.size(),
        });
    }

    data_list
}

/**
 * 读取zip指定文件内容
 */
pub(crate) fn read_zip_content(zip_path: &str, file_name: &str) -> String {
    let file = File::open(zip_path).expect("无法打开 ZIP 文件");
    let mut archive = ZipArchive::new(file).expect("无法创建 ZIP 存档");

    // 直接通过文件名获取压缩包内的文件
    let mut target_file = archive.by_name(file_name).expect("无法获取文件");

    // 将内容读取为字符串（如果是文本文件）
    let mut contents = String::new();
    target_file.read_to_string(&mut contents).expect("无法读取文件内容");

    contents
}
