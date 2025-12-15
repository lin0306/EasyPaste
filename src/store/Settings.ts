import {load} from "@tauri-apps/plugin-store";
import {info} from "@tauri-apps/plugin-log";
import {SETTINGS} from "../constants/UserSettingsConstant.ts";
import {BaseDirectory, exists, readFile} from "@tauri-apps/plugin-fs";
import {SETTINGS_KEYS} from "../constants/KeysConstants.ts";
import {utf8Decoder} from "../constants/PublicConstants.ts";

export const SETTINGS_FILE_NAME = "settings.json";
const defaultSettings: Settings = {
    theme: SETTINGS.THEME.DEFAULT_THEME,
    powerOnSelfStart: false,
    replaceGlobalHotkey: false,
    languages: SETTINGS.LANGUAGE.DEFAULT_LANGUAGE,
    maxHistoryItems: 2000,
    dataRetentionDays: 30,
    autoCheckUpdate: true,
    updateMode: SETTINGS.UPDATER.CHECK_MODE.TIMING,
    autoCheckUpdateInterval: 1,
    enableTag: true,
    bindTagBtnShowLocation: SETTINGS.TAG.BIND_TAG_LOCATION.TOP_RIGHT,
    autoHideWindow: false,
    alwaysOnTop: true,
    newVersionAlertMode: SETTINGS.UPDATER.HINT_MODE.TOAST,
    enableAnimationEffects: true,
    animationDuration: 350,
    animationSpeedLevel: SETTINGS.THEME.ANIMATION.SPEED.NORMAL.key,
    autoGoToLatestData: true,
    tagListLocation: SETTINGS.TAG.TAG_LIST_LOCATION.TOP_LEFT,
    displayThumbnailImage: true,
    imageBasePath: '',
}

/**
 * 保存主题
 * @param theme 主题
 */
export async function saveTheme(theme: String) {
    info("保存主题: " + theme);
    const settings = await load(SETTINGS_FILE_NAME, {autoSave: true});
    await settings.set(SETTINGS_KEYS.THEME, theme);
}

/**
 * 获取主题
 */
export async function getTheme(): Promise<string> {
    const store = await load(SETTINGS_FILE_NAME, {autoSave: true});
    return await store.get<string>(SETTINGS_KEYS.THEME) || defaultSettings.theme;
}

/**
 * 保存语言
 * @param language 语言
 */
export async function saveLanguage(language: String) {
    info("保存语言: " + language);
    const settings = await load(SETTINGS_FILE_NAME, {autoSave: true});
    await settings.set(SETTINGS_KEYS.LANGUAGES, language);
}

/**
 * 获取语言
 */
export async function getLanguage(): Promise<string> {
    const store = await load(SETTINGS_FILE_NAME, {autoSave: true});
    return await store.get<string>(SETTINGS_KEYS.LANGUAGES) || defaultSettings.languages;
}

/**
 * 保存开机自启参数
 * @param powerOnSelfStart 是否开机自启
 */
export async function savePowerOnSelfStart(powerOnSelfStart: boolean) {
    info("保存开机自启: " + powerOnSelfStart);
    const settings = await load(SETTINGS_FILE_NAME, {autoSave: true});
    await settings.set(SETTINGS_KEYS.POWER_ON_SELF_START, powerOnSelfStart);
}

/**
 * 获取开机自启参数
 */
export async function getPowerOnSelfStart(): Promise<boolean> {
    const store = await load(SETTINGS_FILE_NAME, {autoSave: true});
    return await store.get<boolean>(SETTINGS_KEYS.POWER_ON_SELF_START) || defaultSettings.powerOnSelfStart;
}

/**
 * 获取是否替换全局热键
 * @param replaceGlobalHotkey 是否替换全局热键
 */
export async function saveReplaceGlobalHotkey(replaceGlobalHotkey: boolean) {
    info("保存是否替换全局热键: " + replaceGlobalHotkey);
    const settings = await load(SETTINGS_FILE_NAME, {autoSave: true});
    await settings.set(SETTINGS_KEYS.REPLACE_GLOBAL_HOTKEY, replaceGlobalHotkey);
}

/**
 * 获取是否替换全局热键
 */
export async function getReplaceGlobalHotkey(): Promise<boolean> {
    const store = await load(SETTINGS_FILE_NAME, {autoSave: true});
    return await store.get<boolean>(SETTINGS_KEYS.REPLACE_GLOBAL_HOTKEY) || defaultSettings.replaceGlobalHotkey;
}

/**
 * 保存最大历史记录项
 * @param maxHistoryItems 最大历史记录项
 */
export async function saveMaxHistoryItems(maxHistoryItems: number) {
    info("保存最大历史记录项: " + maxHistoryItems);
    const settings = await load(SETTINGS_FILE_NAME, {autoSave: true});
    await settings.set(SETTINGS_KEYS.MAX_HISTORY_ITEMS, maxHistoryItems);
}

/**
 * 获取最大历史记录项
 */
export async function getMaxHistoryItems(): Promise<number> {
    const store = await load(SETTINGS_FILE_NAME, {autoSave: true});
    return await store.get<number>(SETTINGS_KEYS.MAX_HISTORY_ITEMS) || defaultSettings.maxHistoryItems;
}

/**
 * 保存数据保留天数
 * @param dataRetentionDays 数据保留天数
 */
export async function saveDataRetentionDays(dataRetentionDays: number) {
    info("保存数据保留天数: " + dataRetentionDays);
    const settings = await load(SETTINGS_FILE_NAME, {autoSave: true});
    await settings.set(SETTINGS_KEYS.DATA_RETENTION_DAYS, dataRetentionDays);
}

/**
 * 获取数据保留天数
 */
export async function getDataRetentionDays(): Promise<number> {
    const store = await load(SETTINGS_FILE_NAME, {autoSave: true});
    return await store.get<number>(SETTINGS_KEYS.DATA_RETENTION_DAYS) || defaultSettings.dataRetentionDays;
}

/**
 * 保存自动检查更新
 * @param autoCheckUpdate 是否自动检查更新
 */
export async function saveAutoCheckUpdate(autoCheckUpdate: boolean) {
    info("保存自动检查更新: " + autoCheckUpdate);
    const settings = await load(SETTINGS_FILE_NAME, {autoSave: true});
    await settings.set(SETTINGS_KEYS.AUTO_CHECK_UPDATE, autoCheckUpdate);
}

/**
 * 获取自动检查更新
 */
export async function getAutoCheckUpdate(): Promise<boolean> {
    const store = await load(SETTINGS_FILE_NAME, {autoSave: true});
    return await store.get<boolean>(SETTINGS_KEYS.AUTO_CHECK_UPDATE) || defaultSettings.autoCheckUpdate;
}

/**
 * 保存更新模式
 * @param updateMode 更新模式
 */
export async function saveUpdateMode(updateMode: string) {
    info("保存更新模式: " + updateMode);
    const settings = await load(SETTINGS_FILE_NAME, {autoSave: true});
    await settings.set(SETTINGS_KEYS.UPDATE_MODE, updateMode);
}

/**
 * 获取更新模式
 */
export async function getUpdateMode(): Promise<string> {
    const store = await load(SETTINGS_FILE_NAME, {autoSave: true});
    return await store.get<string>(SETTINGS_KEYS.UPDATE_MODE) || defaultSettings.updateMode;
}

/**
 * 保存自动检查更新间隔
 * @param autoCheckUpdateInterval 自动检查更新间隔
 */
export async function saveAutoCheckUpdateInterval(autoCheckUpdateInterval: number) {
    info("保存自动检查更新间隔: " + autoCheckUpdateInterval);
    const settings = await load(SETTINGS_FILE_NAME, {autoSave: true});
    await settings.set(SETTINGS_KEYS.AUTO_CHECK_UPDATE_INTERVAL, autoCheckUpdateInterval);
}

/**
 * 获取自动检查更新间隔
 */
export async function getAutoCheckUpdateInterval(): Promise<number> {
    const store = await load(SETTINGS_FILE_NAME, {autoSave: true});
    return await store.get<number>(SETTINGS_KEYS.AUTO_CHECK_UPDATE_INTERVAL) || defaultSettings.autoCheckUpdateInterval;
}

/**
 * 保存是否启用标签
 * @param enableTag 是否启用标签
 */
export async function saveEnableTag(enableTag: boolean) {
    info("保存是否启用标签: " + enableTag);
    const settings = await load(SETTINGS_FILE_NAME, {autoSave: true});
    await settings.set(SETTINGS_KEYS.ENABLE_TAG, enableTag);
}

/**
 * 获取是否启用标签
 */
export async function getEnableTag(): Promise<boolean> {
    const store = await load(SETTINGS_FILE_NAME, {autoSave: true});
    return await store.get<boolean>(SETTINGS_KEYS.ENABLE_TAG) || defaultSettings.enableTag;
}

/**
 * 保存标签按钮显示位置
 * @param bindTagBtnShowLocation 标签按钮显示位置
 */
export async function saveBindTagBtnShowLocation(bindTagBtnShowLocation: string) {
    info("保存标签按钮显示位置: " + bindTagBtnShowLocation);
    const settings = await load(SETTINGS_FILE_NAME, {autoSave: true});
    await settings.set(SETTINGS_KEYS.BIND_TAG_BTN_SHOW_LOCATION, bindTagBtnShowLocation);
}

/**
 * 获取标签按钮显示位置
 */
export async function getBindTagBtnShowLocation(): Promise<string> {
    const store = await load(SETTINGS_FILE_NAME, {autoSave: true});
    return await store.get<string>(SETTINGS_KEYS.BIND_TAG_BTN_SHOW_LOCATION) || defaultSettings.bindTagBtnShowLocation;
}

/**
 * 保存自动隐藏窗口
 * @param autoHideWindow 自动隐藏窗口
 */
export async function saveAutoHideWindow(autoHideWindow: boolean) {
    info("保存自动隐藏窗口: " + autoHideWindow);
    const settings = await load(SETTINGS_FILE_NAME, {autoSave: true});
    await settings.set(SETTINGS_KEYS.AUTO_HIDE_WINDOW, autoHideWindow);
}

/**
 * 获取自动隐藏窗口
 */
export async function getAutoHideWindow(): Promise<boolean> {
    const store = await load(SETTINGS_FILE_NAME, {autoSave: true});
    return await store.get<boolean>(SETTINGS_KEYS.AUTO_HIDE_WINDOW) || defaultSettings.autoHideWindow;
}

/**
 * 保存窗口是否始终置顶参数
 * @param alwaysOnTop 窗口是否始终置顶
 */
export async function saveAlwaysOnTop(alwaysOnTop: boolean) {
    info("保存窗口是否始终置顶: " + alwaysOnTop);
    const settings = await load(SETTINGS_FILE_NAME, {autoSave: true});
    await settings.set(SETTINGS_KEYS.ALWAYS_ON_TOP, alwaysOnTop);
}

/**
 * 获取窗口是否始终置顶参数
 */
export async function getAlwaysOnTop(): Promise<boolean> {
    const store = await load(SETTINGS_FILE_NAME, {autoSave: true});
    return await store.get<boolean>(SETTINGS_KEYS.ALWAYS_ON_TOP) || defaultSettings.alwaysOnTop;
}

/**
 * 保存有新版本提示方式
 * @param newVersionAlertMode 有新版本提示方式
 */
export async function saveNewVersionAlertMode(newVersionAlertMode: string) {
    info("保存有新版本提示方式: " + newVersionAlertMode);
    const settings = await load(SETTINGS_FILE_NAME, {autoSave: true});
    await settings.set(SETTINGS_KEYS.NEW_VERSION_ALERT_MODE, newVersionAlertMode);
}

/**
 * 获取有新版本提示方式
 */
export async function getNewVersionAlertMode(): Promise<string> {
    const store = await load(SETTINGS_FILE_NAME, {autoSave: true});
    return await store.get<string>(SETTINGS_KEYS.NEW_VERSION_ALERT_MODE) || defaultSettings.newVersionAlertMode;
}

/**
 * 保存是否启用动画效果
 * @param enableAnimationEffects 是否启用页面切换动画
 */
export async function saveEnableAnimationEffects(enableAnimationEffects: boolean) {
    info("保存启用动画效果: " + enableAnimationEffects);
    const settings = await load(SETTINGS_FILE_NAME, {autoSave: true});
    await settings.set(SETTINGS_KEYS.ENABLE_ANIMATION_EFFECTS, enableAnimationEffects);
}

/**
 * 获取启用页面切换动画
 */
export async function getEnableAnimationEffects(): Promise<boolean> {
    const store = await load(SETTINGS_FILE_NAME, {autoSave: true});
    return await store.get<boolean>(SETTINGS_KEYS.ENABLE_ANIMATION_EFFECTS) || defaultSettings.enableAnimationEffects;
}

/**
 * 保存动画持续时间
 * @param animationDuration 动画持续时间（毫秒）
 */
export async function saveAnimationDuration(animationDuration: number) {
    info("保存动画持续时间: " + animationDuration);
    const settings = await load(SETTINGS_FILE_NAME, {autoSave: true});
    await settings.set(SETTINGS_KEYS.ANIMATION_DURATION, animationDuration);
}

/**
 * 获取页面切换动画持续时间
 */
export async function getAnimationDuration(): Promise<number> {
    const store = await load(SETTINGS_FILE_NAME, {autoSave: true});
    return await store.get<number>(SETTINGS_KEYS.ANIMATION_DURATION) || defaultSettings.animationDuration;
}

/**
 * 保存页面动画速度级别
 * @param animationSpeedLevel 页面动画速度级别
 */
export async function saveAnimationSpeedLevel(animationSpeedLevel: string) {
    info("保存页面动画速度级别: " + animationSpeedLevel);
    const settings = await load(SETTINGS_FILE_NAME, {autoSave: true});
    await settings.set(SETTINGS_KEYS.ANIMATION_SPEED_LEVEL, animationSpeedLevel);
}

/**
 * 获取页面切换动画缓动函数
 */
export async function getAnimationSpeedLevel(): Promise<string> {
    const store = await load(SETTINGS_FILE_NAME, {autoSave: true});
    return await store.get<string>(SETTINGS_KEYS.ANIMATION_SPEED_LEVEL) || defaultSettings.animationSpeedLevel;
}

/**
 * 保存是否自动跳转到最新数据
 * @param autoGoToLatestData 是否自动跳转到最新数据
 */
export async function saveAutoGoToLatestData(autoGoToLatestData: boolean) {
    info("保存是否自动跳转到最新数据: " + autoGoToLatestData);
    const settings = await load(SETTINGS_FILE_NAME, {autoSave: true});
    await settings.set(SETTINGS_KEYS.AUTO_GO_TO_LATEST_DATA, autoGoToLatestData);
}

/**
 * 获取是否自动跳转到最新数据
 */
export async function getAutoGoToLatestData(): Promise<boolean> {
    const store = await load(SETTINGS_FILE_NAME, {autoSave: true});
    return await store.get<boolean>(SETTINGS_KEYS.AUTO_GO_TO_LATEST_DATA) || defaultSettings.autoGoToLatestData;
}

/**
 * 保存标签列表位置
 * @param tagListLocation 是否自动跳转到最新数据
 */
export async function saveTagListLocation(tagListLocation: string) {
    info("保存标签列表位置: " + tagListLocation);
    const settings = await load(SETTINGS_FILE_NAME, {autoSave: true});
    await settings.set(SETTINGS_KEYS.TAG_LIST_LOCATION, tagListLocation);
}

/**
 * 获取标签列表位置
 */
export async function getTagListLocation(): Promise<string> {
    const store = await load(SETTINGS_FILE_NAME, {autoSave: true});
    return await store.get<string>(SETTINGS_KEYS.TAG_LIST_LOCATION) || defaultSettings.tagListLocation;
}

/**
 * 保存是否显示图片缩略图
 * @param displayThumbnailImage 是否显示图片缩略图
 */
export async function saveDisplayThumbnailImage(displayThumbnailImage: boolean) {
    info("保存标签列表位置: " + displayThumbnailImage);
    const settings = await load(SETTINGS_FILE_NAME, {autoSave: true});
    await settings.set(SETTINGS_KEYS.DISPLAY_THUMBNAIL_IMAGE, displayThumbnailImage);
}

/**
 * 获取是否显示图片缩略图
 */
export async function getDisplayThumbnailImage(): Promise<boolean> {
    const store = await load(SETTINGS_FILE_NAME, {autoSave: true});
    return await store.get<boolean>(SETTINGS_KEYS.DISPLAY_THUMBNAIL_IMAGE) || defaultSettings.displayThumbnailImage;
}

/**
 * 保存图片存储位置
 * @param imageBasePath 图片存储位置
 */
export async function saveImageBasePath(imageBasePath: string) {
    info("保存图片存储位置: " + imageBasePath);
    const settings = await load(SETTINGS_FILE_NAME, {autoSave: true});
    await settings.set(SETTINGS_KEYS.IMAGE_BASE_PATH, imageBasePath);
}

/**
 * 获取图片存储位置
 */
export async function getImageBasePath(): Promise<string> {
    const store = await load(SETTINGS_FILE_NAME, {autoSave: true});
    return await store.get<string>(SETTINGS_KEYS.IMAGE_BASE_PATH) || '';
}

/**
 * 初始化用户配置
 */
export async function initSettings() {
    const settingsExist = await exists(SETTINGS_FILE_NAME, {
        baseDir: BaseDirectory.AppData,
    });
    if (settingsExist) {
        const settings = await load(SETTINGS_FILE_NAME, {autoSave: true});
        // 用户配置文件存在
        const userSettings = await readFile(SETTINGS_FILE_NAME, {
            baseDir: BaseDirectory.AppData,
        })
        // 转成字符串
        const userSettingsString = utf8Decoder.decode(userSettings);
        if (!userSettingsString.includes(SETTINGS_KEYS.THEME)) {
            await settings.set(SETTINGS_KEYS.THEME, defaultSettings.theme);
        }
        if (!userSettingsString.includes(SETTINGS_KEYS.POWER_ON_SELF_START)) {
            await settings.set(SETTINGS_KEYS.POWER_ON_SELF_START, defaultSettings.powerOnSelfStart);
        }
        if (!userSettingsString.includes(SETTINGS_KEYS.REPLACE_GLOBAL_HOTKEY)) {
            await settings.set(SETTINGS_KEYS.REPLACE_GLOBAL_HOTKEY, defaultSettings.replaceGlobalHotkey);
        }
        if (!userSettingsString.includes(SETTINGS_KEYS.LANGUAGES)) {
            await settings.set(SETTINGS_KEYS.LANGUAGES, defaultSettings.languages);
        }
        if (!userSettingsString.includes(SETTINGS_KEYS.MAX_HISTORY_ITEMS)) {
            await settings.set(SETTINGS_KEYS.MAX_HISTORY_ITEMS, defaultSettings.maxHistoryItems);
        }
        if (!userSettingsString.includes(SETTINGS_KEYS.DATA_RETENTION_DAYS)) {
            await settings.set(SETTINGS_KEYS.DATA_RETENTION_DAYS, defaultSettings.dataRetentionDays);
        }
        if (!userSettingsString.includes(SETTINGS_KEYS.AUTO_CHECK_UPDATE)) {
            await settings.set(SETTINGS_KEYS.AUTO_CHECK_UPDATE, defaultSettings.autoCheckUpdate);
        }
        if (!userSettingsString.includes(SETTINGS_KEYS.UPDATE_MODE)) {
            await settings.set(SETTINGS_KEYS.UPDATE_MODE, defaultSettings.updateMode);
        }
        if (!userSettingsString.includes(SETTINGS_KEYS.AUTO_CHECK_UPDATE_INTERVAL)) {
            await settings.set(SETTINGS_KEYS.AUTO_CHECK_UPDATE_INTERVAL, defaultSettings.autoCheckUpdateInterval);
        }
        if (!userSettingsString.includes(SETTINGS_KEYS.ENABLE_TAG)) {
            await settings.set(SETTINGS_KEYS.ENABLE_TAG, defaultSettings.enableTag);
        }
        if (!userSettingsString.includes(SETTINGS_KEYS.BIND_TAG_BTN_SHOW_LOCATION)) {
            await settings.set(SETTINGS_KEYS.BIND_TAG_BTN_SHOW_LOCATION, defaultSettings.bindTagBtnShowLocation);
        }
        if (!userSettingsString.includes(SETTINGS_KEYS.AUTO_HIDE_WINDOW)) {
            await settings.set(SETTINGS_KEYS.AUTO_HIDE_WINDOW, defaultSettings.autoHideWindow);
        }
        if (!userSettingsString.includes(SETTINGS_KEYS.ALWAYS_ON_TOP)) {
            await settings.set(SETTINGS_KEYS.ALWAYS_ON_TOP, defaultSettings.alwaysOnTop);
        }
        if (!userSettingsString.includes(SETTINGS_KEYS.NEW_VERSION_ALERT_MODE)) {
            await settings.set(SETTINGS_KEYS.NEW_VERSION_ALERT_MODE, defaultSettings.newVersionAlertMode);
        }
        if (!userSettingsString.includes(SETTINGS_KEYS.ENABLE_ANIMATION_EFFECTS)) {
            await settings.set(SETTINGS_KEYS.ENABLE_ANIMATION_EFFECTS, defaultSettings.enableAnimationEffects);
        }
        if (!userSettingsString.includes(SETTINGS_KEYS.ANIMATION_DURATION)) {
            await settings.set(SETTINGS_KEYS.ANIMATION_DURATION, defaultSettings.animationDuration);
        }
        if (!userSettingsString.includes(SETTINGS_KEYS.ANIMATION_SPEED_LEVEL)) {
            await settings.set(SETTINGS_KEYS.ANIMATION_SPEED_LEVEL, defaultSettings.animationSpeedLevel);
        }
        if (!userSettingsString.includes(SETTINGS_KEYS.AUTO_GO_TO_LATEST_DATA)) {
            await settings.set(SETTINGS_KEYS.AUTO_GO_TO_LATEST_DATA, defaultSettings.autoGoToLatestData);
        }
        if (!userSettingsString.includes(SETTINGS_KEYS.TAG_LIST_LOCATION)) {
            await settings.set(SETTINGS_KEYS.TAG_LIST_LOCATION, defaultSettings.tagListLocation);
        }
        if (!userSettingsString.includes(SETTINGS_KEYS.DISPLAY_THUMBNAIL_IMAGE)) {
            await settings.set(SETTINGS_KEYS.DISPLAY_THUMBNAIL_IMAGE, defaultSettings.displayThumbnailImage);
        }
        if (!userSettingsString.includes(SETTINGS_KEYS.IMAGE_BASE_PATH)) {
            await settings.set(SETTINGS_KEYS.IMAGE_BASE_PATH, defaultSettings.imageBasePath);
        }
        await settings.save();
    } else {
        // 用户配置文件不存在
        const settings = await load(SETTINGS_FILE_NAME, {autoSave: true});

        await settings.set(SETTINGS_KEYS.THEME, defaultSettings.theme);
        await settings.set(SETTINGS_KEYS.POWER_ON_SELF_START, defaultSettings.powerOnSelfStart);
        await settings.set(SETTINGS_KEYS.REPLACE_GLOBAL_HOTKEY, defaultSettings.replaceGlobalHotkey);
        await settings.set(SETTINGS_KEYS.LANGUAGES, defaultSettings.languages);
        await settings.set(SETTINGS_KEYS.MAX_HISTORY_ITEMS, defaultSettings.maxHistoryItems);
        await settings.set(SETTINGS_KEYS.DATA_RETENTION_DAYS, defaultSettings.dataRetentionDays);
        await settings.set(SETTINGS_KEYS.AUTO_CHECK_UPDATE, defaultSettings.autoCheckUpdate);
        await settings.set(SETTINGS_KEYS.UPDATE_MODE, defaultSettings.updateMode);
        await settings.set(SETTINGS_KEYS.AUTO_CHECK_UPDATE_INTERVAL, defaultSettings.autoCheckUpdateInterval);
        await settings.set(SETTINGS_KEYS.ENABLE_TAG, defaultSettings.enableTag);
        await settings.set(SETTINGS_KEYS.BIND_TAG_BTN_SHOW_LOCATION, defaultSettings.bindTagBtnShowLocation);
        await settings.set(SETTINGS_KEYS.AUTO_HIDE_WINDOW, defaultSettings.autoHideWindow);
        await settings.set(SETTINGS_KEYS.ALWAYS_ON_TOP, defaultSettings.alwaysOnTop);
        await settings.set(SETTINGS_KEYS.NEW_VERSION_ALERT_MODE, defaultSettings.newVersionAlertMode);
        await settings.set(SETTINGS_KEYS.ENABLE_ANIMATION_EFFECTS, defaultSettings.enableAnimationEffects);
        await settings.set(SETTINGS_KEYS.ANIMATION_DURATION, defaultSettings.animationDuration);
        await settings.set(SETTINGS_KEYS.ANIMATION_SPEED_LEVEL, defaultSettings.animationSpeedLevel);
        await settings.set(SETTINGS_KEYS.ANIMATION_SPEED_LEVEL, defaultSettings.autoGoToLatestData);
        await settings.set(SETTINGS_KEYS.TAG_LIST_LOCATION, defaultSettings.tagListLocation);
        await settings.set(SETTINGS_KEYS.DISPLAY_THUMBNAIL_IMAGE, defaultSettings.displayThumbnailImage);
        await settings.set(SETTINGS_KEYS.IMAGE_BASE_PATH, defaultSettings.imageBasePath);

        await settings.save();
    }
}