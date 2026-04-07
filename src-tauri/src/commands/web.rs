/**
 * 获取页面标题
 */
#[tauri::command]
pub async fn fetch_page_title(url: String) -> Result<String, String> {
    let client = reqwest::Client::new();
    let res = client
        .get(&url)
        .header("User-Agent", "Tauri App")
        .timeout(std::time::Duration::from_secs(10))
        .send()
        .await
        .map_err(|e| e.to_string())?;
    if !res.status().is_success() {
        return Ok("NotFound".into());
    }

    let html = res.text().await.map_err(|e| e.to_string())?;

    if let Some(start) = html.find("<title>") {
        let start = start + 7;
        if let Some(end) = html[start..].find("</title>") {
            let title = html[start..start + end].trim().to_string();
            return Ok(title);
        }
    }

    Ok("NotFound".into())
}