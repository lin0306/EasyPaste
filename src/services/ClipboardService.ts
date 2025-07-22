import {listen} from '@tauri-apps/api/event';
import {error, info} from '@tauri-apps/plugin-log';
import {clipboardListenStore} from '../store/copyStatus';
import ClipboardDBService from './ClipboardDBService';
import {invoke} from '@tauri-apps/api/core';

/**
 * 初始化剪贴板监听服务
 */
export async function initClipboardListener() {
    // 监听剪贴板内容变化事件
    const unListen = await listen('clipboard-change', async (event) => {
        const clipboardListen = clipboardListenStore();
        try {
            clipboardListen.coping();
            const payload: any = event.payload;

            if (payload.type === 'text') {
                // 处理文本内容
                const content = payload.content;
                if (content) {
                    const db = await ClipboardDBService.getInstance();
                    await db.saveClipboardItem(content, 'text');
                }
            } else if (payload.type === 'file') {
                const fileName = payload.file_path;
                if (fileName) {
                    // 直接将文件路径保存到数据库
                    const db = await ClipboardDBService.getInstance();
                    await db.saveClipboardItem(fileName, 'file');
                }
            }
        } catch (er) {
            error('处理剪贴板事件失败:' + er);
        } finally {
            clipboardListen.success();
        }
    });

    info('剪贴板监听服务已启动');
    return unListen;
}

/**
 * 将内容写入剪贴板
 * @param item 剪贴板内容对象
 */
export async function copyToClipboard(item: ClipboardItem) {
    if (item.type === 'text') {
        // 调用后端接口
        return await invoke('write_to_clipboard', {content: item.content, format: 'text'});
    } else {
        // 调用后端接口
        return await invoke('write_to_clipboard', {content: item.file_path, format: 'files'});
    }
}

/**
 * 文件写入剪贴板
 * @param filePaths 文件路径列表
 */
export async function copyFileToClipboard(filePaths: Array<string>) {
    // 调用后端接口
    return await invoke('write_to_clipboard', {content: JSON.stringify(filePaths), format: 'files'});
}
