/**
 * 日志格式化
 */
pub fn format_log(
    out: tauri_plugin_log::fern::FormatCallback,
    message: &std::fmt::Arguments,
    record: &log::Record,
) {
    out.finish(format_args!(
        "{} [{} {}] {}",
        chrono::Local::now().format("%Y-%m-%d %H:%M:%S%.3f"),
        record.level(),
        record.target(),
        message
    ));
}
