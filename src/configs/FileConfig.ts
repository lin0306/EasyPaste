import { BaseDirectory, create, exists, readFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { error, info } from "@tauri-apps/plugin-log";
import { uint8ArrayToString } from "../utils/strUtil";

let defaultSettings: Settings = {
    theme: "light",
    powerOnSelfStart: false,
    replaceGlobalHotkey: false,
    languages: "chinese",
    maxHistoryItems: 2000,
    maxStorageSize: 5000,
    dataRetentionDays: 30,
    maxItemSize: 50,
}
let defaultShortcutKeys = {
    search: {
        name: "搜索",
        key: [
            "ctrl",
            "f"
        ]
    },
    wakeUpRoutine: {
        name: "唤醒程序",
        key: [
            "meta",
            "c"
        ]
    }
}

let settingsCache: Settings | null = null;
let shortcutKeysCache: ShortcutKeys | null = null;

const userSettingsPath = "userSettings.json";
const userShortcutKeysPath = "userShortcutKeys.json";
const languageCachePathPath = "language.json";

/**
 * 加载用户设置
 * @returns 用户设置
 */
export async function getSettings(): Promise<Settings> {
    if (settingsCache) {
        return settingsCache;
    }
    await loadUserSettings();
    if (settingsCache === null) {
        throw new Error("用户设置加载失败");
    }
    return settingsCache;
}

/**
 * 更新主题
 * @param theme 主题
 */
export async function updateTheme(theme: string) {
    defaultSettings.theme = theme;
    await saveUserSettings(JSON.stringify(defaultSettings));
}

/**
 * 更新语言
 * @param language 语言
 */
export async function updateLanguage(language: string) {
    defaultSettings.languages = language;
    await saveUserSettings(JSON.stringify(defaultSettings));
}

/**
 * 加载用户快捷键
 * @returns 用户快捷键
 */
export async function getShortcutKeys(): Promise<ShortcutKeys> {
    if (shortcutKeysCache) {
        return shortcutKeysCache;
    }
    await loadUserShortcutKeys();
    if (shortcutKeysCache === null) {
        throw new Error('用户快捷键配置加载失败');
    }
    return shortcutKeysCache;
}

/**
 * 保存用户设置
 * @param userSettings 用户设置
 */
export async function saveUserSettings(userSettings: any): Promise<boolean> {
    try {
        await writeTextFile(userSettingsPath, userSettings, {
            baseDir: BaseDirectory.AppData,
        })
        return true;
    } catch (err: any) {
        error("用户配置保存失败" + err.message);
        return false;
    }
}

/**
 * 保存用户设置
 * @param userSettings 用户设置
 */
export async function updateUserSettings(userSettings: any): Promise<boolean> {
    try {
        const settings = { ...defaultSettings, ...userSettings };
        await writeTextFile(userSettingsPath, JSON.stringify(settings), {
            baseDir: BaseDirectory.AppData,
        })
        return true;
    } catch (err: any) {
        error("用户配置保存失败" + err.message);
        return false;
    }
}

/**
 * 保存语言缓存
 * @param tray 语言缓存，暂时只保存tray的语言
 * @returns 是否保存成功
 */
export async function saveLanguageCache(tray: any): Promise<boolean> {
    try {
        const exist = await exists(languageCachePathPath, {
            baseDir: BaseDirectory.AppData,
        })
        if (exist) {
            // 有找到语言文件，直接写入
            await writeTextFile(languageCachePathPath, JSON.stringify({ tray: tray }), {
                baseDir: BaseDirectory.AppData,
            })
        } else {
            // 没有找到语言文件，创建文件
            const file = await create(languageCachePathPath, { baseDir: BaseDirectory.AppData });
            await file.write(new TextEncoder().encode(JSON.stringify({ tray: tray })));
            await file.close();
        }
        return true;
    } catch (err: any) {
        error("语言配置保存失败" + err.message);
        return false;
    }
}

/**
 * 保存用户快捷键
 * @param userShortcutKeys 用户快捷键
 */
export async function saveUserShortcutKeys(userShortcutKeys: any): Promise<boolean> {
    try {
        await writeTextFile(userShortcutKeysPath, userShortcutKeys, {
            baseDir: BaseDirectory.AppData,
        })
        return true;
    } catch (err: any) {
        error("用户快捷键保存失败" + err.message);
        return false;
    }
}

/**
 * 加载用户设置
 */
async function loadUserSettings() {
    const userSettingsExists = await exists(userSettingsPath, {
        baseDir: BaseDirectory.AppData,
    })
    info('[渲染进程] 用户设置文件存在:' + JSON.stringify(userSettingsExists));
    if (!userSettingsExists) {
        info('[渲染进程] 用户设置文件不存在, 创建默认用户设置');
        saveUserSettings(JSON.stringify(defaultSettings));
        return defaultSettings;
    }
    const userSettings = await readFile(userSettingsPath, {
        baseDir: BaseDirectory.AppData,
    })
    // 转成字符串
    const userSettingsString = uint8ArrayToString(userSettings);
    // 如果有加新的配置，则合并数据
    const settings = { ...defaultSettings, ...JSON.parse(userSettingsString) };
    // 重新保存配置
    saveUserSettings(JSON.stringify(settings));
    info('[渲染进程] 加载用户设置:' + JSON.stringify(settings));
    settingsCache = settings;
}

/**
 * 加载用户快捷键
 */
async function loadUserShortcutKeys() {
    const userShortcutKeysExists = await exists(userShortcutKeysPath, {
        baseDir: BaseDirectory.AppData,
    })
    info('[渲染进程] 用户快捷键文件存在:' + userShortcutKeysExists);
    if (!userShortcutKeysExists) {
        info('[渲染进程] 用户快捷键文件不存在, 创建默认用户快捷键');
        saveUserShortcutKeys(JSON.stringify(defaultShortcutKeys));
        return defaultShortcutKeys;
    }
    const userShortcutKeys = await readFile(userShortcutKeysPath, {
        baseDir: BaseDirectory.AppData,
    })
    // 转成字符串
    const userShortcutKeysString = uint8ArrayToString(userShortcutKeys);
    // 如果有加新的快捷键，则合并数据
    const shortcutKeys = { ...defaultShortcutKeys, ...JSON.parse(userShortcutKeysString) };
    // 重新保存快捷键
    saveUserShortcutKeys(JSON.stringify(shortcutKeys));
    info('[渲染进程] 加载用户快捷键:' + JSON.stringify(shortcutKeys));
    shortcutKeysCache = shortcutKeys;
}
