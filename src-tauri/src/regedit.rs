#[cfg(target_os = "windows")]
use log::info;
#[cfg(target_os = "windows")]
use winreg::enums::{HKEY_LOCAL_MACHINE, REG_OPENED_EXISTING_KEY};
#[cfg(target_os = "windows")]
use winreg::{RegKey, RegValue};

// 剪贴板注册表项路径
#[cfg(target_os = "windows")]
const CLIPBOARD_PATH: &str = "SOFTWARE\\Microsoft\\Clipboard";
// 剪贴板注册表项备份路径
#[cfg(target_os = "windows")]
const CLIPBOARD_PATH_BACKUP: &str = "SOFTWARE\\Microsoft\\Clipboard-Backup";

/**
 * 检查剪贴板注册表项是否存在
 */
#[cfg(target_os = "windows")]
#[tauri::command]
pub fn valid_clipboard_regedit() -> tauri::Result<bool> {
    info!("开始检查剪贴板注册表");
    let h_k_l_m = RegKey::predef(HKEY_LOCAL_MACHINE);
    match h_k_l_m.open_subkey(CLIPBOARD_PATH) {
        Ok(_key) => Ok(true),
        Err(e) => {
            info!("没有找到注册表配置: {}", e);
            Ok(false)
        }
    }
}

/**
 * 检查剪贴板备份注册表项是否存在
 */
#[cfg(target_os = "windows")]
#[tauri::command]
pub fn valid_clipboard_backup_regedit() -> tauri::Result<bool> {
    info!("开始检查剪贴板备份注册表");
    let h_k_l_m = RegKey::predef(HKEY_LOCAL_MACHINE);
    match h_k_l_m.open_subkey(CLIPBOARD_PATH_BACKUP) {
        Ok(_key) => Ok(true),
        Err(e) => {
            info!("没有找到注册表配置: {}", e);
            Ok(false)
        }
    }
}

/**
 * 备份注册表剪贴板配置
 */
#[cfg(target_os = "windows")]
#[tauri::command]
pub fn backup_clipboard_regedit() -> tauri::Result<bool> {
    let h_k_l_m = RegKey::predef(HKEY_LOCAL_MACHINE);
    rename_regedit(h_k_l_m, CLIPBOARD_PATH_BACKUP, CLIPBOARD_PATH)
}

/**
 * 还原注册表剪贴板配置
 */
#[cfg(target_os = "windows")]
#[tauri::command]
pub fn recover_clipboard_regedit() -> tauri::Result<bool> {
    let h_k_l_m = RegKey::predef(HKEY_LOCAL_MACHINE);
    rename_regedit(h_k_l_m, CLIPBOARD_PATH, CLIPBOARD_PATH_BACKUP)
}

/// 重命名注册表项
/// `key` 注册表项
/// `new_name` 新注册表项名称
/// `old_name` 旧注册表项名称
#[cfg(target_os = "windows")]
fn rename_regedit(root_key: RegKey, new_name: &str, old_name: &str) -> tauri::Result<bool> {
    match root_key.open_subkey(old_name) {
        Ok(key) => {
            info!(
                "开始修改注册表配置，原注册表文件夹：{}, 新注册表文件夹：{}",
                old_name, new_name
            );
            let mut values: Vec<(String, RegValue)> = Vec::new();
            let mut enum_values = key.enum_values();
            loop {
                match enum_values.next() {
                    Some(Ok((key, value))) => values.push((key, value)),
                    Some(Err(e)) => {
                        info!("无法枚举注册表项: {}", e);
                        return Ok(false);
                    }
                    None => break,
                }
            }

            match root_key.create_subkey(new_name) {
                Ok((dest_key, disposition)) => {
                    if disposition == REG_OPENED_EXISTING_KEY {
                        info!("注册表项已存在");
                        return Ok(false);
                    }
                    for (sub_key, value) in values {
                        info!(
                            "正在修改注册表项: {}, {:?}, {:?}",
                            sub_key, value.bytes, value.vtype
                        );
                        let copied_value = RegValue {
                            bytes: value.bytes.clone(),
                            vtype: value.vtype,
                        };
                        dest_key
                            .set_raw_value(&sub_key, &copied_value)
                            .expect("无法设置注册表项");
                        info!("已修改注册表项：{}", sub_key);
                    }
                    match root_key.delete_subkey_all(old_name) {
                        Ok(_) => {
                            info!("已删除原注册表项");
                        }
                        Err(e) => {
                            info!("无法删除原注册表项: {}", e);
                            let err = root_key.delete_subkey_all(new_name).err();
                            if err.is_some() {
                                info!("无法删除新注册表项: {}", err.unwrap());
                            }
                            return Ok(false);
                        }
                    }
                    info!("已删除原注册表项");
                }
                Err(e) => {
                    info!("无法创建备份注册表项: {}", e);
                    return Ok(false);
                }
            }

            Ok(true)
        }
        Err(e) => {
            info!("没有找到注册表配置: {}", e);
            Ok(false)
        }
    }
}
