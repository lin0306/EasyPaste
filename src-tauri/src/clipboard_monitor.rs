use chrono::Local;
use image::{ImageBuffer, RgbaImage};
use log::info;
use std::error::Error;
use std::fs::create_dir_all;
use std::path::PathBuf;
use std::thread;
use std::time::Duration;
use tauri::image::Image;
use tauri::plugin::{Builder, TauriPlugin};
use tauri::{AppHandle, Emitter, Manager, Runtime};
use tauri_plugin_clipboard_manager::ClipboardExt;
use uuid::Uuid;

// 获取图片存储目录路径
fn get_images_dir<R: Runtime>(app: &AppHandle<R>) -> PathBuf {
    // 使用tauri::path获取正确的应用本地数据目录路径
    let app_local_data_dir =
        tauri::path::PathResolver::app_data_dir(app.path()).expect("获取应用本地数据目录失败");
    // 在应用数据目录下创建images子目录
    app_local_data_dir.join("images")
}

// 确保图片存储目录存在
fn ensure_images_dir<R: Runtime>(app: &AppHandle<R>) -> Result<(), Box<dyn Error>> {
    let images_dir = get_images_dir(app);
    if !images_dir.exists() {
        create_dir_all(&images_dir)?;
        info!("图片存储目录创建成功: {:?}", images_dir);
    }
    Ok(())
}

// 保存图片到文件系统
fn save_image_to_file<R: Runtime>(
    app: &AppHandle<R>,
    image_info: Image<'_>,
) -> Result<(String, String), Box<dyn Error>> {
    // 确保目录存在
    ensure_images_dir(app)?;

    // 生成唯一文件名
    let timestamp = Local::now().format("%Y%m%d%H%M%S").to_string();
    let uuid = Uuid::new_v4().to_string();
    let file_name = format!("{}-{}.png", timestamp, uuid);

    // 构建完整文件路径
    let images_dir = get_images_dir(app);
    let file_path = images_dir.join(&file_name);

    // 图片rgba内容
    let rgba = image_info.rgba();
    // 图片宽度
    let width = image_info.width();
    // 图片高度
    let height = image_info.height();

    // 创建RgbaImage并保存到文件
    let img: RgbaImage =
        ImageBuffer::from_raw(width, height, rgba.to_vec()).ok_or("无法创建图像缓冲区")?;

    // 保存为PNG文件
    img.save(&file_path)?;
    info!("图片已保存: {}x{} 像素", width, height);

    // 返回文件名和文件路径
    Ok((file_name, file_path.to_string_lossy().to_string()))
}

// 初始化插件
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("clipboard_manager")
        .setup(|app, _| {
            // 启动剪贴板监听线程
            start_clipboard_monitor(app.clone());
            Ok(())
        })
        .build()
}

// 剪贴板监听函数
fn start_clipboard_monitor<R: Runtime>(app: tauri::AppHandle<R>) {
    // 保存上一次的剪贴板内容，用于比较变化
    let mut last_text = String::new();
    match app.clipboard().read_text() {
        Ok(text_data) => {
            if !text_data.is_empty() {
                last_text = text_data;
                info!("初始化剪贴板文本内容成功: {}", last_text);
            } else {
                info!("初始化剪贴板文本内容为空");
            }
        }
        Err(_e) => {
            // info!("读取剪贴板文本内容失败: {}", e);
        }
    }

    let mut last_image = Vec::new();
    match app.clipboard().read_image() {
        Ok(image_data) => {
            let image_bytes = image_data.rgba().to_vec();
            if !image_bytes.is_empty() {
                last_image = image_bytes;
                info!("初始化剪贴板图片内容成功: {} bytes", last_image.len());
            } else {
                info!("初始化剪贴板图片内容为空");
            }
        }
        Err(_e) => {
            // info!("读取剪贴板图片内容失败: {}", e);
        }
    }

    // 启动监听线程
    thread::spawn(move || {
        // 确保图片存储目录存在
        if let Err(e) = ensure_images_dir(&app) {
            info!("创建图片存储目录失败: {}", e);
        }

        loop {
            // 检查文本变化
            match app.clipboard().read_text() {
                Ok(text_data) => {
                    let current_text = text_data;
                    if !current_text.is_empty() && current_text != last_text {
                        info!("text changed: {}", current_text);
                        // 发送文本变化事件
                        let _ = app.emit("clipboard-change", {
                            serde_json::json!({
                                "type": "text",
                                "content": current_text.clone()
                            })
                        });
                        last_text = current_text;
                    }
                }
                Err(_e) => {
                    // 记录错误但不中断监听循环
                    // info!("读取剪贴板文本内容失败: {}", e);
                }
            }

            // 检查图片变化
            match app.clipboard().read_image() {
                Ok(image_data) => {
                    let image_bytes = image_data.rgba().to_vec();
                    if !image_bytes.is_empty() && image_bytes != last_image {
                        info!("image changed: {} bytes", image_bytes.len());

                        // 保存图片到文件系统
                        match save_image_to_file(&app, image_data) {
                            Ok((file_name, file_path)) => {
                                // 发送文件路径信息给前端，而不是图片数据
                                let _ = app.emit("clipboard-change", {
                                    serde_json::json!({
                                        "type": "image",
                                        "file_name": file_name,
                                        "file_path": file_path
                                    })
                                });
                                info!("图片已保存到: {}", file_path);
                            }
                            Err(e) => {
                                info!("保存图片失败: {}", e);
                            }
                        }

                        last_image = image_bytes;
                    }
                }
                Err(_e) => {
                    // 记录错误但不中断监听循环
                    // info!("读取剪贴板图片内容失败: {}", e);
                }
            }

            // 短暂休眠，避免过度消耗CPU
            thread::sleep(Duration::from_millis(200));
        }
    });
}
