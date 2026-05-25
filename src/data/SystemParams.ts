import { platform } from '@tauri-apps/plugin-os'

/**
 * 当前运行环境
 */
const currentPlatform = platform()

/**
 * node 配置
 */
export const env = process.env.NODE_ENV

/**
 * 判断当前运行环境是否开发环境
 */
export const isDev = env === 'development'

/**
 * 判断当前是否为Mac操作系统
 */
export const isMac = currentPlatform === 'macos'

/**
 * 程序配置：启动时是否打开开发者工具
 * 从环境变量 VITE_OPEN_DEV_TOOLS_ON_STARTUP 读取，默认为 false
 */
export const OPEN_DEV_TOOLS_ON_STARTUP = import.meta.env.VITE_OPEN_DEV_TOOLS_ON_STARTUP === 'true'
