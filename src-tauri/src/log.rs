use tauri::{Runtime, plugin::TauriPlugin};
use tauri_plugin_log::{RotationStrategy, Target, TargetKind, TimezoneStrategy};

// 初始化插件
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    // 初始化日志配置
    tauri_plugin_log::Builder::default()
        .targets([
            Target::new(TargetKind::Stdout),
            Target::new(TargetKind::Webview),
            Target::new(TargetKind::LogDir {
                file_name: Some("logs".to_string()),
            }),
        ])
        .max_file_size(50_000 /* bytes */) // 单个日志文件大小限制为 50KB
        .level(log::LevelFilter::Info) // 日志级别
        .rotation_strategy(RotationStrategy::KeepAll) // 设置日志保留策略为保留所有日志文件
        .timezone_strategy(TimezoneStrategy::UseLocal) // 日志时区使用本地时区
        .format(|out, message, record| {
            out.finish(format_args!(
                "{} [{} {}] {}",
                chrono::Local::now().format("%Y-%m-%d %H:%M:%S%.3f"),
                record.level(),
                record.target(),
                message
            )) // 日志格式化
        })
        .build()
}
