use log::info;
use std::io::Write;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};
use tauri_plugin_store::StoreExt;

/**
 * 运行外部插件
 */
pub async fn run_external_plugin(
    app: AppHandle,
    plugin_id: String,
    plugin_name: String,
    cmd: String,
    payload: serde_json::Value,
) -> Result<String, String> {
    info!(
        "invoke_external_plugin: {:?}, {:?}, {:?}, {:?}",
        plugin_id, plugin_name, cmd, payload
    );

    match app.store("settings.json") {
        Ok(store) => {
            let plugin_path = store.get("pluginPath").expect("插件路径获取失败");
            let plugin_path = plugin_path.as_str().expect("插件路径转字符串格式失败");
            let plugin_path = build_plugin_path(plugin_path, &plugin_id, &plugin_name);
            let input = serde_json::json!({ "cmd": cmd, "payload": payload }).to_string();

            info!("plugin_path: {:?}", plugin_path);

            let identifier = app.config().identifier.clone();
            // 数据目录
            let app_data_dir = dirs::data_dir()
                .map(|d| d.join(identifier.clone()))
                .unwrap_or_else(|| PathBuf::from("."));
            info!("app_data_dir: {:?}", app_data_dir);

            // 日志路径
            let log_path = match app.path().app_log_dir() {
                Ok(log_dir) => {
                    log_dir.to_string_lossy().to_string()
                },
                Err(_e) => {
                    "".to_string()
                }
            };
            info!("log_path: {:?}", log_path);


            let mut child = std::process::Command::new(plugin_path)
                .stdin(std::process::Stdio::piped())
                .stdout(std::process::Stdio::piped())
                .stderr(std::process::Stdio::piped())
                .env("EASYPASTE_DATA_DIR", app_data_dir.to_string_lossy().to_string())
                .env("EASYPASTE_IDENTIFIER", identifier.clone())
                .env("EASYPASTE_LOGS", log_path)
                .spawn()
                .map_err(|e| format!("Failed to spawn plugin: {}", e))?;

            {
                let mut stdin = child.stdin.take().unwrap();
                stdin
                    .write_all(input.as_bytes())
                    .map_err(|e| format!("Failed to write to plugin stdin: {}", e))?;
            }

            let output = child
                .wait_with_output()
                .map_err(|e| format!("Plugin process failed: {}", e))?;

            println!("output：{:?}", output);
            println!("output.stdout：{:?}", String::from_utf8(output.stdout.clone()));

            if output.status.success() {
                let stdout_str = String::from_utf8(output.stdout)
                    .map_err(|e| format!("Invalid UTF-8 from plugin: {}", e))?;

                // 提取第一个完整的 JSON 对象（处理可能存在的额外输出）
                let json_str = extract_json_from_output(&stdout_str);
                Ok(json_str.trim().to_string())
            } else {
                let stderr_str = String::from_utf8_lossy(&output.stderr);
                Err(format!(
                    "Plugin exited with error (code {}): {}",
                    output.status.code().unwrap_or(-1),
                    stderr_str
                ))
            }
        }
        _ => Err("插件文件夹获取失败".into()),
    }
}

/**
 * 从输出中提取第一个完整的 JSON 对象
 * 处理第三方库可能输出的额外信息
 */
fn extract_json_from_output(output: &str) -> String {
    // 查找第一个 '{' 和最后一个 '}' 之间的内容
    if let Some(start) = output.find('{') {
        if let Some(end) = output.rfind('}') {
            if start <= end {
                return output[start..=end].to_string();
            }
        }
    }
    // 如果没有找到 JSON 格式，返回原始输出
    output.to_string()
}

/**
 * 构建插件路径
 */
fn build_plugin_path(plugin_path: &str, plugin_id: &str, plugin_name: &str) -> String {
    let mut path = PathBuf::new();
    path.push(plugin_path);
    path.push(plugin_id);
    path.push("rust");
    path.push(plugin_name);
    path.to_string_lossy().to_string()
}
