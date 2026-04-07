use std::process::Command;

/**
 * 检查是否有管理员权限
 */
#[tauri::command]
pub fn check_admin() -> tauri::Result<bool> {
    #[cfg(windows)]
    let output = Command::new("net").args(["session"]).output();

    #[cfg(unix)]
    let output = Command::new("id").args(["-u"]).output();

    match output {
        Ok(output) => {
            #[cfg(windows)]
            return Ok(output.status.success());

            #[cfg(unix)]
            if let Ok(stdout) = String::from_utf8(output.stdout) {
                Ok(stdout.trim() == "0")
            } else {
                Ok(false)
            }
        }
        Err(_) => Ok(false),
    }
}

/**
 * 重启电脑
 */
#[tauri::command]
pub async fn restart_computer() -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("shutdown")
            .args(["/r", "/t", "0"])
            .status()
            .map_err(|e| e.to_string())
            .expect("重启失败");
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("sudo")
            .args(["shutdown", "-r", "now"])
            .status()
            .map_err(|e| e.to_string())
            .expect("重启失败");
    }

    Ok(())
}
