use log::info;
use serde::Deserialize;
use serde_json::{from_reader, from_slice};
use std::fs::File;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::menu::{Menu, MenuItem};
use tauri::plugin::{Builder, TauriPlugin};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle, Emitter, Manager, Runtime};

// 状态结构体，用于保存托盘图标
struct TrayState<R: Runtime> {
    tray: Mutex<Option<tauri::tray::TrayIcon<R>>>,
}

// 初始化插件
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("tray_manager")
        .setup(|app, _| {
            // 初始化托盘状态
            app.manage(TrayState::<R> {
                tray: Mutex::new(None),
            });

            // 创建初始托盘
            create_tray(app)?;
            Ok(())
        })
        .build()
}

// 创建/更新托盘的函数
fn create_tray<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<()> {
    let language = load_language();

    // 创建菜单项
    let settings = MenuItem::with_id(app, "settings", &language.settings, true, None::<&str>)?;
    let check_update = MenuItem::with_id(
        app,
        "check_update",
        &language.checkUpdate,
        true,
        None::<&str>,
    )?;
    let about = MenuItem::with_id(app, "about", &language.about, true, None::<&str>)?;
    let restart = MenuItem::with_id(app, "restart", &language.restart, true, None::<&str>)?;
    let exit = MenuItem::with_id(app, "exit", &language.exit, true, None::<&str>)?;

    // 创建菜单
    let items: Vec<&dyn tauri::menu::IsMenuItem<R>> =
        vec![&settings, &check_update, &about, &restart, &exit];
    let menu = Menu::with_items(app, &items)?;

    // 获取状态
    let state = app.state::<TrayState<R>>();
    let mut tray_guard = state.tray.lock().unwrap();

    // 如果已有托盘图标，更新其菜单
    if let Some(tray) = tray_guard.as_ref() {
        tray.set_menu(Some(menu))?;
        return Ok(());
    }

    // 创建新的托盘图标
    let tray = TrayIconBuilder::new()
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
                // 打开主窗口
                info!("触发系统托盘图标单击事件，打开主窗口");
                let win = tray.app_handle().get_window("main").expect("主窗口不存在");
                match win.is_visible() {
                    Ok(visible) if !visible => {
                        win.show().unwrap();
                        win.set_focus().unwrap();
                    }
                    Ok(visible) if visible => win.hide().unwrap(),
                    Err(e) => eprintln!("窗口可见性错误: {}", e),
                    _ => (),
                };
                win.set_focus().unwrap();
            }
            _ => {}
        })
        .on_menu_event(|app, event| match event.id.as_ref() {
            "settings" => {
                app.emit("open-settings", "".to_string()).unwrap();
                println!("打开设置窗口");
            }
            "check_update" => println!("触发检查更新逻辑"),
            "about" => {
                app.emit("open-about", "".to_string()).unwrap();
                info!("打开关于窗口");
            }
            "restart" => {
                app.exit(0);
                app.restart()
            }
            "exit" => app.exit(0),
            _ => println!("菜单项 {:?} 未处理", event.id),
        })
        .build(app)?;

    // 保存新的托盘实例到状态
    *tray_guard = Some(tray);
    Ok(())
}

// 重新加载托盘菜单的命令
#[tauri::command]
pub fn reload_tray_menu<R: Runtime>(app: AppHandle<R>) -> tauri::Result<()> {
    info!("重新加载托盘菜单语言");
    create_tray(&app)?;
    Ok(())
}

/**
 * 加载语言配置
 */
fn load_language() -> Tray {
    let appdata_dir = dirs::data_dir().expect("未找到数据目录");
    let mut path = PathBuf::new();
    path.push(appdata_dir);
    path.push("com.easyclip.app");
    path.push("language.json");

    info!("语言配置文件路径：{}", path.display());

    if path.exists() {
        info!("使用缓存托盘语言配置");
        // 文件存在，读取文件内容
        let file = File::open(path).unwrap();
        let json: LanguageConfig = from_reader(file).unwrap();
        json.tray
    } else {
        info!("使用默认托盘语言配置");
        let default_json = r#"{
            "settings": "设置",
            "checkUpdate": "检查更新",
            "about": "关于",
            "restart": "重启",
            "exit": "退出"
        }"#;
        from_slice(default_json.as_bytes()).unwrap()
    }
}

#[derive(Deserialize)]
struct LanguageConfig {
    tray: Tray,
}

#[derive(Deserialize)]
pub struct Tray {
    settings: String,
    checkUpdate: String,
    about: String,
    restart: String,
    exit: String,
}
