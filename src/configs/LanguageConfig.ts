import { emit, listen } from '@tauri-apps/api/event';
import { error, info } from '@tauri-apps/plugin-log';
import { dateEnUS, dateZhCN, enUS, zhCN } from 'naive-ui';
import { ref } from 'vue';
import { getSettings, updateLanguage } from './FileConfig';
import { LanguageConfig } from '../types/language';
import { chinesePageConfig } from '../data/locales/zh';
import { englishPageConfig } from '../data/locales/en';

// 简体中文配置
export const chinese: LanguageConfig = {
    id: 'chinese',
    name: '简体中文',
    locale: zhCN,
    dateLocale: dateZhCN,
    pages: chinesePageConfig,
}

// 英文配置
export const english: LanguageConfig = {
    id: 'english',
    name: 'English',
    locale: enUS,
    dateLocale: dateEnUS,
    pages: englishPageConfig
}

export const languages: LanguageConfig[] = [
    chinese,
    english,
]

// 创建一个全局的主题状态管理
const currentLanguageId = ref<string>(chinese.id);
const currentLanguage = ref<LanguageConfig>(chinese);

// 主题上下文
export function useLanguage() {
    // 初始化主题
    const initializeLanguage = async () => {
        try {
            // 从用户设置中获取主题
            const settings = await getSettings();

            // 设置当前主题
            currentLanguageId.value = settings.languages;

            // 查找并应用主题
            const language = languages.find(item => item.id === settings.languages);
            if (language) {
                currentLanguage.value = language;
            } else {
                // 如果找不到主题，使用默认主题
                currentLanguage.value = chinese;
            }
        } catch (err: any) {
            error('加载主题失败:' + err.message);
            // 使用默认语言
            currentLanguageId.value = chinese.id;
            currentLanguage.value = chinese;
        }
    };

    // 切换主题
    const toggleLanguage = async (languageId: string) => {
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
            await updateLanguage(languageId);

            // 发送主题变更事件，通知所有窗口
            await emit('language-changed', languageId);

            info('语言已切换为:' + languageId);
        } catch (err: any) {
            error('切换主题失败:' + err.message);
        }
    };

    // 监听主题变更事件
    const setupLanguageListener = async () => {
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

    // 返回主题相关方法和状态
    return {
        currentLanguageId,
        currentLanguage,
        initializeLanguage,
        toggleLanguage,
        setupLanguageListener,
    };
}

// 获取托盘的语言
export function getTray(languageId: string) {
    const language = languages.find(item => item.id === languageId);
    if (!language) {
        return chinese.pages.tray;
    }
    return language.pages.tray;
}