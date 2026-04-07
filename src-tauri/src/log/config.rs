use tauri::Runtime;
use tauri_plugin_log::{Builder, RotationStrategy, Target, TargetKind, TimezoneStrategy};

/**
 * 日志构建配置
 */
pub fn build_log_config<R: Runtime>() -> Builder {
    Builder::default()
        .targets([
            Target::new(TargetKind::Stdout),
            Target::new(TargetKind::Webview),
            Target::new(TargetKind::LogDir {
                file_name: Some("logs".to_string()),
            }),
        ])
        .max_file_size(1024_000)
        .level(log::LevelFilter::Info)
        .rotation_strategy(RotationStrategy::KeepSome(30))
        .timezone_strategy(TimezoneStrategy::UseLocal)
}
