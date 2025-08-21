import { BaseDirectory, create, exists, readFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { error, info } from "@tauri-apps/plugin-log";
import { uint8ArrayToString } from "../utils/strUtil.ts";

let defaultSettings: Settings = {
    theme: "light",
    powerOnSelfStart: false,
    replaceGlobalHotkey: false,
    languages: "chinese",
    maxHistoryItems: 2000,
    dataRetentionDays: 30,
    autoCheckUpdate: true,
    updateMode: "timing",
    autoCheckUpdateInterval: 1,
    enableTag: true,
    bindTagBtnShowLocation: 'top-right',
    autoHideWindow: false,
    alwaysOnTop: true,
    newVersionAlertMode: 'toast'
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
            "alt",
            "c"
        ]
    }
}

const userSettingsPath = "userSettings.json";
const userShortcutKeysPath = "userShortcutKeys.json";
const languageCachePathPath = "language.json";

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
 * 保存用户设置
 * @param userSettings 用户设置
 */
export async function saveUserSettings(userSettings: string): Promise<boolean> {
    try {
        await writeTextFile(userSettingsPath, userSettings, {
            baseDir: BaseDirectory.AppData,
        });
        return true;
    } catch (err) {
        error("用户配置保存失败" + err);
        return false;
    }
}

/**
 * 保存用户设置
 * @param userSettings 用户设置
 */
export async function updateUserSettings(userSettings: Settings): Promise<boolean> {
    try {
        const settings = { ...defaultSettings, ...userSettings };
        await writeTextFile(userSettingsPath, JSON.stringify(settings), {
            baseDir: BaseDirectory.AppData,
        });
        return true;
    } catch (err) {
        error("用户配置保存失败" + err);
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
    } catch (err) {
        error("语言配置保存失败" + err);
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
        });
        return true;
    } catch (err) {
        error("用户快捷键保存失败" + err);
        return false;
    }
}

/**
 * 加载用户设置
 */
export async function getSettings(): Promise<Settings> {
    const userSettingsExists = await exists(userSettingsPath, {
        baseDir: BaseDirectory.AppData,
    })
    if (!userSettingsExists) {
        info('[渲染进程] 用户设置文件不存在, 创建默认用户设置');
        await saveUserSettings(JSON.stringify(defaultSettings));
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
    await saveUserSettings(JSON.stringify(settings));
    return settings;
}

/**
 * 加载用户快捷键
 */
export async function getShortcutKeys(): Promise<ShortcutKeys> {
    const userShortcutKeysExists = await exists(userShortcutKeysPath, {
        baseDir: BaseDirectory.AppData,
    })
    if (!userShortcutKeysExists) {
        info('[渲染进程] 用户快捷键文件不存在, 创建默认用户快捷键');
        await saveUserShortcutKeys(JSON.stringify(defaultShortcutKeys));
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
    await saveUserShortcutKeys(JSON.stringify(shortcutKeys));

    return shortcutKeys;
}
