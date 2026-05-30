// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // 根据 Rust 的编译模式，动态决定加载哪个 .env 文件
    let env_file = if cfg!(debug_assertions) {
        // 开发环境 (tauri dev) 加载 .env.development
        "../.env.development"
    } else {
        // 生产环境 (tauri build) 加载 .env.production
        "../.env.production"
    };

    // 加载对应的环境变量文件
    dotenv::from_filename(env_file).ok();

    easypaste_lib::run()
}
