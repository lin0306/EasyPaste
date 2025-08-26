import {BaseDirectory, create, exists, writeTextFile} from "@tauri-apps/plugin-fs";
import {error} from "@tauri-apps/plugin-log";
import {fillSettingsData} from "../store/Settings.ts";
import {fillKeyData} from "../store/ShortcutKeys.ts";

const languageCachePathPath = "language.json";

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
            await writeTextFile(languageCachePathPath, JSON.stringify({tray: tray}), {
                baseDir: BaseDirectory.AppData,
            })
        } else {
            // 没有找到语言文件，创建文件
            const file = await create(languageCachePathPath, {baseDir: BaseDirectory.AppData});
            await file.write(new TextEncoder().encode(JSON.stringify({tray: tray})));
            await file.close();
        }
        return true;
    } catch (err) {
        error("语言配置保存失败" + err);
        return false;
    }
}

/**
 * 填充数据
 * todo 旧版本到新版本过渡，修改用户配置保存模式，后续这段代码也会删除
 * @deprecated
 */
export async function fillData(toggleLanguage: any, toggleTheme: any) {
    await fillSettingsData(toggleLanguage, toggleTheme);
    await fillKeyData();
}
