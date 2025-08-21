const env = process.env.NODE_ENV;

// 判断当前运行环境是否开发环境
export const isDev = env === 'development';

// 判断当前是否为Mac操作系统
export const isMac = /macintosh|mac os x/i.test(navigator.userAgent);