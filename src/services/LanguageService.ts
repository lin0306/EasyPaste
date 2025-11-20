import {emit, listen} from '@tauri-apps/api/event';
import {error, info} from '@tauri-apps/plugin-log';
import {ref} from 'vue';
import {chinese} from '../data/locales/zh.ts';
import {english} from '../data/locales/en.ts';
import {getLanguage, saveLanguage} from "../store/Settings.ts";
import {SETTINGS} from "../constants/UserSettingsConstant.ts";

export const languages: LanguageConfig[] = [
    chinese,
    english,
]

/**
 * 当前使用的语言id
 */
const currentLanguageId = ref<string>(SETTINGS.LANGUAGE.DEFAULT_LANGUAGE);
/**
 * 当前使用的语言配置
 */
export const currentLanguage = ref<LanguageConfig>(chinese);

/**
 * 初始化语言
 */
export async function initializeLanguage() {
    try {
        // 设置当前主题
        currentLanguageId.value = await getLanguage();

        // 查找并应用主题
        const language = languages.find(item => item.id === currentLanguageId.value);
        if (language) {
            currentLanguage.value = language;
        } else {
            // 如果找不到主题，使用默认主题
            currentLanguage.value = chinese;
        }
    } catch (err) {
        error('加载主题失败:' + err);
        // 使用默认语言
        currentLanguageId.value = SETTINGS.LANGUAGE.DEFAULT_LANGUAGE;
        currentLanguage.value = chinese;
    }
};

/**
 * 切换语言
 * @param languageId 语言ID
 */
export async function toggleLanguage(languageId: string) {
    try {
        // 查找主题
        const language = languages.find(item => item.id === languageId);
        if (!language) {
            error('找不到语言:' + language);
            return;
        }

        // 更新当前主题
        currentLanguageId.value = languageId;
        currentLanguage.value = language;

        // 保存主题设置
        await saveLanguage(languageId);

        // 发送主题变更事件，通知所有窗口
        await emit('language-changed', languageId);

        info('语言已切换为:' + languageId);
    } catch (err) {
        error('切换主题失败:' + err);
    }
};

/**
 * 监听语言变更事件
 */
export const setupLanguageListener = async () => {
    await listen<string>('language-changed', (event) => {
        // 确保不重复应用相同主题
        if (event.payload !== currentLanguageId.value) {
            const language = languages.find(item => item.id === event.payload);
            if (language) {
                currentLanguageId.value = event.payload;
                currentLanguage.value = language;
            }
        }
    });
};

// 获取托盘的语言
export function getTray(languageId: string) {
    const language = languages.find(item => item.id === languageId);
    if (!language) {
        return chinese.pages.tray;
    }
    return language.pages.tray;
}