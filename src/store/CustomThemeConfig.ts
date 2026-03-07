import {BaseDirectory, exists, readTextFile, writeTextFile} from "@tauri-apps/plugin-fs";

export const THEME_FILE_NAME = "customTheme.json";

// 自定义主题--默认为浅色主题
const customThemeConfig: ThemeConfig = {
    id: 'custom',
    name: '自定义主题',
    colors: {
        universal: {
            primary: 'rgba(90,90,90,1)',
            secondary: 'rgba(255,255,255,1)',
            background: 'rgb(248,248,248)',
            delete: 'rgb(255,102,102)',
            text: 'rgb(83,83,83)',
            textHint: 'rgba(51,51,51,0.6)',
            border: 'rgba(48,48,48,0.09)',
        },
        button: {
            normal: {
                backgroundColor: 'rgb(218,218,218)',
                disabledBackgroundColor: 'rgb(161,161,161)',
                hoverBackgroundColor: 'rgb(209,209,209)',
                textColor: 'rgb(92,92,92)',
                disabledTextColor: 'rgba(81,81,81,0.75)',
                hoverTextColor: 'rgba(51,51,51,1)',
            },
            primary: {
                backgroundColor: 'rgb(92,92,92)',
                disabledBackgroundColor: 'rgba(43,43,43,0.85)',
                hoverBackgroundColor: 'rgba(25,25,25,0.86)',
                textColor: 'rgb(218,218,218)',
                disabledTextColor: 'rgba(232,232,232,0.77)',
                hoverTextColor: 'rgba(255,255,255,1)',
            },
            error: {
                backgroundColor: 'rgb(253,132,132)',
                disabledBackgroundColor: 'rgb(255,140,140)',
                hoverBackgroundColor: 'rgb(255,102,102)',
                textColor: 'rgb(230,230,230)',
                disabledTextColor: 'rgba(232,232,232,0.77)',
                hoverTextColor: 'rgba(255,255,255,1)',
            }
        },
        select: {
            options: {
                optionColorPending: 'rgb(230,230,230)',
                optionColorActive: 'rgb(216,216,216)',
                optionColorActivePending: 'rgb(216,216,216)',
            }
        },
        titleBar: {
            backgroundColor: 'rgb(239,239,239)',
            btnHoverBackgroundColor: 'rgb(225,225,225)',
            closeBtnHoverBackgroundColor: 'rgb(248,196,196)',
        },
        menuBar: {
            background: 'rgba(248,248,248,1)',
            itemActive: 'rgb(216,216,216)',
            itemHover: 'rgba(240,240,240,1)',
        },
        customCard: {
            background: 'rgb(255,255,255)',
            backgroundHover: 'rgb(240,240,240)',
        },
        wavesurfer: {
            waveColor: 'rgba(104,104,104, 1)',
            cursorColor: 'rgb(220,220,220)',
            progressColor: 'rgb(166,166,166)',
        },
        editor: {
            backgroundColor: 'rgb(255,255,255)',
            lineNumberBackgroundColor: 'rgb(241,241,241)',
            lineNumberBackgroundColorActive: 'rgb(255,255,255)',
        },
    },
}

/**
 * 保存用户自定义主题配置
 */
export async function saveCustomTheme(themeColors: ThemeColor) {
    customThemeConfig.colors = themeColors;
    await writeTextFile(THEME_FILE_NAME, JSON.stringify(customThemeConfig), {
        baseDir: BaseDirectory.AppData,
    });
}

/**
 * 获取用户自定义主题配置
 */
export async function getCustomTheme(): Promise<ThemeConfig> {
    const userSettings = await readTextFile(THEME_FILE_NAME, {
        baseDir: BaseDirectory.AppData,
    })
    return JSON.parse(userSettings);
}

/**
 * 初始化自定义主题配置
 */
export async function initCustomTheme() {
    console.log("初始化用户自定义主题配置");
    if (window.location.pathname !== '/list') {
        console.log("不是主页面，直接从文件中获取自定义主题配置")
        return;
    }
    const settingsExist = await exists(THEME_FILE_NAME, {
        baseDir: BaseDirectory.AppData,
    });
    if (settingsExist) {
        // 用户配置文件存在
        const userSettings = await readTextFile(THEME_FILE_NAME, {
            baseDir: BaseDirectory.AppData,
        })
        const theme = JSON.parse(userSettings);
        const margeTheme = {...customThemeConfig, ...theme};
        await writeTextFile(THEME_FILE_NAME, JSON.stringify(margeTheme), {
            baseDir: BaseDirectory.AppData,
        });
        console.log("用户自定义主题配置初始化完成", margeTheme)
    } else {
        // 用户配置文件不存在
        await writeTextFile(THEME_FILE_NAME, JSON.stringify(customThemeConfig), {
            baseDir: BaseDirectory.AppData,
        });
    }
}