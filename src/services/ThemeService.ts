import {emit, listen} from '@tauri-apps/api/event';
import {error, info} from '@tauri-apps/plugin-log';
import {ref} from 'vue';
import {updateTheme} from './FileService.ts';
import {ThemeConfig, ThemeConfigColors} from '../types/Themes.ts';
import {lightTheme} from '../data/themes/light.ts';
import {darkTheme} from '../data/themes/dark.ts';
import {blueTheme} from '../data/themes/blue.ts';
import {pinkTheme} from '../data/themes/pink.ts';
import {getTheme} from "../store/Settings.ts";

// 所有可用主题
export const themes: ThemeConfig[] = [
    lightTheme,
    darkTheme,
    blueTheme,
    pinkTheme,
];


// 创建一个全局的主题状态管理
const currentThemeId = ref<string>(lightTheme.id);
const themeColors = ref<ThemeConfigColors>(lightTheme.colors);

// 主题上下文
export function useTheme() {
    // 初始化主题
    const initializeTheme = async () => {
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
            currentThemeId.value = lightTheme.id;
            themeColors.value = lightTheme.colors;
            applyThemeToDOM(lightTheme.colors);
        }
    };

    // 将主题应用到DOM
    const applyThemeToDOM = (colors: ThemeConfigColors) => {
        const root = document.documentElement;

        // 将主题颜色应用到CSS变量
        Object.entries(colors).forEach(([key, value]) => {
            root.style.setProperty(`--theme-${key}`, value as string);
        });
    };

    // 切换主题
    const toggleTheme = async (themeId: string) => {
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
            await updateTheme(themeId);

            // 发送主题变更事件，通知所有窗口
            await emit('theme-changed', themeId);

            info('主题已切换为:' + themeId);
        } catch (er) {
            error('切换主题失败:' + er);
        }
    };

    // 监听主题变更事件
    const setupThemeListener = async () => {
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
    };

    // 返回主题相关方法和状态
    return {
        currentThemeId,
        themeColors,
        initializeTheme,
        toggleTheme,
        setupThemeListener,
    };
}