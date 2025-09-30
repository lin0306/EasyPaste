use crate::file;
use crate::listener::{is_listening, start_listening, stop_listening};
use log::info;
use serde::Deserialize;
use serde_json::from_slice;
use std::sync::{Arc, Mutex};
use tauri::menu::{CheckMenuItem, Menu, MenuItem, PredefinedMenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle, Emitter, Manager};

// 创建/更新托盘的函数
pub fn create_tray(app: AppHandle) {
    let mut state = LOAD_STATE.lock().unwrap();
    // 获取语言配置
    let language = load_language(&app);

    // 创建菜单项
    let settings =
        MenuItem::with_id(&app, "settings", &language.settings, true, None::<&str>).unwrap();
    let clipboard_monitor = CheckMenuItem::with_id(
        &app,
        "clipboard_monitor",
        &language.clipboard_monitor,
        true,
        is_listening(),
        None::<&str>,
    )
    .unwrap();
    let check_update = MenuItem::with_id(
        &app,
        "check_update",
        &language.check_update,
        true,
        None::<&str>,
    )
    .unwrap();
    let about = MenuItem::with_id(&app, "about", &language.about, true, None::<&str>).unwrap();
    let restart =
        MenuItem::with_id(&app, "restart", &language.restart, true, None::<&str>).unwrap();
    let exit = MenuItem::with_id(&app, "exit", &language.exit, true, None::<&str>).unwrap();
    let separator = PredefinedMenuItem::separator(&app).unwrap();

    // 创建菜单
    let menu = Menu::with_items(
        &app,
        &[
            &settings,
            &clipboard_monitor,
            &separator,
            &check_update,
            &about,
            &separator,
            &restart,
            &exit,
        ],
    )
    .unwrap();

    // 如果已有托盘图标，更新其菜单
    if state.is_loaded {
        match state.tray.take() {
            Some(tray) => {
                tray.set_menu(Some(menu)).unwrap();
                // 重新设置托盘
                state.tray = Some(tray);
                return;
            }
            None => {}
        }
    }

    // 创建新的托盘图标
    let tray = TrayIconBuilder::new()
        .tooltip("EasyPaste")
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu) // 直接使用菜单对象
        .show_menu_on_left_click(false)
        .on_tray_icon_event(|tray, event| match event {
            // 左键点击托盘图标显示窗口
            TrayIconEvent::Click {
                id: _,
                position: _,
                rect: _,
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
            } => {
                let mut state_new = LOAD_STATE.lock().unwrap();
                // 判断窗口是否可显示/隐藏
                if state_new.win_enter_visible
                    && state_new.win_current_visible == false
                    && state_new.is_first_hide
                {
                    // 鼠标移到托盘图标上时，窗口是显示的
                    state_new.is_first_hide = false;
                    return;
                }
                println!("鼠标松开");
                // 打开主窗口
                let win = tray
                    .app_handle()
                    .get_webview_window("main")
                    .expect("主窗口不存在");
                match win.is_visible() {
                    Ok(visible) => {
                        if !visible {
                            println!("显示窗口");
                            win.show().expect("窗口显示失败");
                            win.set_focus().expect("窗口聚焦失败");

                            state_new.win_current_visible = true;
                            state_new.win_enter_visible = true;
                            state_new.is_first_hide = false;
                        } else {
                            println!("隐藏窗口");
                            win.hide().expect("窗口隐藏失败");

                            state_new.win_current_visible = false;
                            state_new.win_enter_visible = false;
                            state_new.is_first_hide = true;
                        }
                    }
                    Err(e) => eprintln!("窗口可见性错误: {}", e),
                };
            }
            TrayIconEvent::Enter {
                id: _,
                position: _,
                rect: _,
            } => {
                let mut state_new = LOAD_STATE.lock().unwrap();
                match tray.app_handle().get_webview_window("main") {
                    Some(win) => {
                        // 鼠标移到托盘图标上时，设置移入时窗口是否可见
                        state_new.win_enter_visible = win.is_visible().unwrap();
                    }
                    None => {}
                }
            }
            _ => {}
        })
        .on_menu_event(|app, event| match event.id.as_ref() {
            "settings" => {
                app.emit("open-settings", "".to_string()).unwrap();
                println!("打开设置窗口");
            }
            "clipboard_monitor" => {
                if is_listening() {
                    stop_listening();
                    println!("停止监听剪贴板")
                } else {
                    start_listening(app.app_handle().clone());
                    println!("开始监听剪贴板")
                }
            }
            "check_update" => {
                app.emit("check-update", "".to_string()).unwrap();
            }
            "about" => {
                app.emit("open-about", "".to_string()).unwrap();
            }
            "restart" => {
                app.exit(0);
                app.restart()
            }
            "exit" => app.exit(0),
            _ => println!("菜单项 {:?} 未处理", event.id),
        })
        .build(&app)
        .unwrap();

    // 保存新的托盘实例到状态
    state.is_loaded = true;
    state.tray = Some(tray);
    state.win_current_visible = false;
    state.is_first_hide = false;
}

// 重新加载托盘菜单的命令
#[tauri::command]
pub fn reload_tray_menu(app: AppHandle) -> tauri::Result<()> {
    println!("重新加载托盘菜单");
    create_tray(app);
    Ok(())
}

/**
 * 接收窗口隐藏消息
 */
#[tauri::command]
pub fn hide_win_msg() {
    let mut state = LOAD_STATE.lock().unwrap();
    state.win_current_visible = false;
    state.is_first_hide = true;
}

/**
 * 加载语言配置
 */
fn load_language(app: &AppHandle) -> Tray {
    match file::load_file_content::<LanguageConfig>(app.clone(), "language.json".into()) {
        Ok(data) => data.tray,
        Err(_e) => {
            info!("使用默认托盘语言配置");
            let default_json = r#"{
                "settings": "设置",
                "clipboardMonitor": "剪贴板监听",
                "checkUpdate": "检查更新",
                "about": "关于",
                "restart": "重启",
                "exit": "退出"
            }"#;
            from_slice(default_json.as_bytes()).unwrap()
        }
    }
}

#[derive(Deserialize)]
struct LanguageConfig {
    tray: Tray,
}

#[derive(Deserialize)]
pub struct Tray {
    settings: String,
    #[serde(rename = "checkUpdate")]
    check_update: String,
    about: String,
    restart: String,
    exit: String,
    #[serde(rename = "clipboardMonitor")]
    clipboard_monitor: String,
}

// 全局状态管理结构体
#[derive(Default)]
struct LoadState {
    tray: Option<TrayIcon>,    // 托盘图标实例
    is_loaded: bool,           // 托盘图标是否已加载
    win_current_visible: bool, // 窗口当前是否可见
    win_enter_visible: bool,   // 鼠标进入托盘图标时，窗口是否可见
    is_first_hide: bool,       // 鼠标进入托盘图标时，窗口是否第一次隐藏
}

// 使用 Arc + Mutex 实现线程安全共享
lazy_static::lazy_static! {
    static ref LOAD_STATE: Arc<Mutex<LoadState>> = Arc::new(Mutex::new(LoadState::default()));
}
