/**
 * 程序配置：启动时是否打开开发者工具
 * 从环境变量 OPEN_DEV_TOOLS_ON_STARTUP 读取，默认为 false
 */
#[cfg(debug_assertions)]
pub fn should_open_dev_tools_on_startup() -> bool {
    std::env::var("OPEN_DEV_TOOLS_ON_STARTUP")
        .map(|v| v == "true")
        .unwrap_or(false)
}