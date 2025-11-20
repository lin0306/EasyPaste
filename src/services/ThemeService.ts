import {emit, listen} from '@tauri-apps/api/event';
import {error, info} from '@tauri-apps/plugin-log';
import {ref} from 'vue';
import {lightTheme} from '../data/themes/light.ts';
import {darkTheme} from '../data/themes/dark.ts';
import {blueTheme} from '../data/themes/blue.ts';
import {pinkTheme} from '../data/themes/pink.ts';
import {getTheme, saveTheme} from "../store/Settings.ts";
import {SETTINGS} from "../constants/UserSettingsConstant.ts";

// 所有可用主题
export const themes: ThemeConfig[] = [
    lightTheme,
    darkTheme,
    blueTheme,
    pinkTheme,
];


/**
 * 当前使用的主题id
 */
export const currentThemeId = ref<string>(SETTINGS.THEME.DEFAULT_THEME);
/**
 * 当前使用的主题配置
 */
export const themeColors = ref<ThemeConfigColors>(lightTheme.colors);

// 初始化主题
export async function initializeTheme() {
    try {
        // 设置当前主题
        currentThemeId.value = await getTheme();

        // 查找并应用主题
        const theme = themes.find(item => item.id === currentThemeId.value);
        if (theme) {
            themeColors.value = theme.colors;
            applyThemeToDOM(theme.colors);
        } else {
            // 如果找不到主题，使用默认主题
            themeColors.value = lightTheme.colors;
            applyThemeToDOM(lightTheme.colors);
        }
    } catch (err) {
        error('加载主题失败:' + err);
        // 使用默认主题
        currentThemeId.value = SETTINGS.THEME.DEFAULT_THEME;
        themeColors.value = lightTheme.colors;
        applyThemeToDOM(lightTheme.colors);
    }
}

// 将主题应用到DOM
export function applyThemeToDOM(colors: ThemeConfigColors, suffix: string = '') {
    const root = document.documentElement;

    // 将主题颜色应用到CSS变量
    Object.entries(colors).forEach(([key, value]) => {
        // 判断值是否是字符串
        if (typeof value === 'string') {
            if (suffix) {
                root.style.setProperty(`--theme-${suffix}-${key}`, value as string);
            } else {
                root.style.setProperty(`--theme-${key}`, value as string);
            }
        } else {
            // 递归处理嵌套对象
            applyThemeToDOM(value, suffix ? (suffix + '-' + key) : key);
        }
    });
}

/**
 * 切换主题
 * @param themeId
 */
export async function toggleTheme(themeId: string) {
    try {
        // 查找主题
        const theme = themes.find(item => item.id === themeId);
        if (!theme) {
            error('找不到主题:' + themeId);
            return;
        }

        // 更新当前主题
        currentThemeId.value = themeId;
        themeColors.value = theme.colors;

        // 应用主题到DOM
        applyThemeToDOM(theme.colors);

        // 保存主题设置
        await saveTheme(themeId);

        // 发送主题变更事件，通知所有窗口
        await emit('theme-changed', themeId);

        info('主题已切换为:' + themeId);
    } catch (er) {
        error('切换主题失败:' + er);
    }
}

/**
 * 监听主题变更事件
 */
export async function setupThemeListener() {
    await listen<string>('theme-changed', (event) => {
        // 确保不重复应用相同主题
        if (event.payload !== currentThemeId.value) {
            const theme = themes.find(item => item.id === event.payload);
            if (theme) {
                currentThemeId.value = event.payload;
                themeColors.value = theme.colors;
                applyThemeToDOM(theme.colors);
            }
        }
    });
}