const env = process.env.NODE_ENV;

// 判断当前运行环境是否开发环境
export function isDev() {
    return env === 'development';
};