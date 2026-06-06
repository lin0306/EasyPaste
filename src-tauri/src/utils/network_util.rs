use futures_util::StreamExt;
use log::{error, info};
use reqwest::Client;
use tokio::io::AsyncWriteExt;

/**
 * 下载文件
 * @param url 文件下载地址
 * @param save_path 文件保存路径
 */
pub async fn download_file(url: String, save_path: String) -> bool {
    let client = Client::new();

    // 发起请求
    let resp = client.get(&url).send().await.map_err(|e| {
        error!("请求发起失败: {}", e);
        e.to_string()
    }).expect("请求失败");

    // 获取文件总大小
    // let total_size = resp.content_length().unwrap_or(0);
    let mut stream = resp.bytes_stream();

    // 创建本地文件
    let mut file = tokio::fs::File::create(&save_path).await.map_err(|e| {
        error!("创建本地文件失败: {}", e);
        e.to_string()
    }).expect("创建本地文件失败");

    // let mut downloaded: u64 = 0;
    info!("开始下载: {} -> {}", url, save_path);

    // 流式读取并写入
    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| {
            error!("读取数据流失败: {}", e);
            e.to_string()
        }).expect("读取数据流失败");

        file.write_all(&chunk).await.map_err(|e| {
            error!("写入本地文件失败: {}", e);
            e.to_string()
        }).expect("写入本地文件失败");

        // downloaded += chunk.len() as u64;

        // 仅在控制台/日志文件打印进度，不占用 IPC 资源
        // info!("下载进度: {} / {} bytes", downloaded, total_size);
    }

    info!("文件下载完成: {}", save_path);
    true
}
