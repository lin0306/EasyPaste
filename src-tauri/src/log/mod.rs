mod config;
mod formatter;

use tauri::{plugin::TauriPlugin, Runtime};

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    config::build_log_config::<R>()
        .format(formatter::format_log)
        .build()
}
