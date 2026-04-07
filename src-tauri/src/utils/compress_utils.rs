use crate::models::file_model::TreeOption;
use flate2::read::GzDecoder;
use std::fs::File;
use std::io::BufReader;
use unrar::Archive;

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
