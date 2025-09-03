import {BaseDirectory, create, exists, writeTextFile} from "@tauri-apps/plugin-fs";
import {error} from "@tauri-apps/plugin-log";

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
