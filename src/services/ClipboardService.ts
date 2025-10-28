import {listen} from '@tauri-apps/api/event';
import {error, info} from '@tauri-apps/plugin-log';
import {clipboardListenStore} from '../store/CopyStatus';
import ClipboardDBService from './ClipboardDBService';
import {invoke} from '@tauri-apps/api/core';
import {ref} from "vue";
import {isCodeText} from "../utils/CodeUtil.ts";

// 剪贴板内容缓存
export const dataMap = ref<Map<{ type: string; content: string; file_path: string }, number>>(new Map());

/**
 * 初始化剪贴板监听服务
 */
export async function initClipboardListener() {
    // 监听剪贴板内容变化事件
    const unListen = await listen('clipboard-change', async (event) => {
        const payload: any = event.payload;
        const data = {type: payload.type, content: payload.content, file_path: payload.file_path};
        if (dataMap.value.get(data)) {
            info("触发重复复制，忽略本次内容：" + payload);
            return;
        }
        dataMap.value.set(data, Date.now());
        const clipboardListen = clipboardListenStore();
        try {
            clipboardListen.coping();

            const db = await ClipboardDBService.getInstance();
            if (payload.type === 'text') {
                // 处理文本内容
                const content = payload.content;
                if (content) {
                    await db.saveClipboardItem(content, (isCodeText(content) ? 'code' : 'text'));
                }
            } else if (payload.type === 'file') {
                const fileName = payload.file_path;
                if (fileName) {
                    // 直接将文件路径保存到数据库
                    await db.saveClipboardItem(fileName, 'file');
                }
            }
            dataMap.value.delete(data);
            info("剪贴板内容保存完成");
            // 延迟10毫秒，让数据先入库完成
            setTimeout(async () => {
                const latestItem = await db.getLatestItem();
                if (latestItem) {
                    clipboardListen.setItem(latestItem[0]);
                }
                clipboardListen.success();
                info("剪贴板内容保存完成，更新复制状态");
            }, 10);
        } catch (er) {
            error('处理剪贴板事件失败:' + er);
            clipboardListen.error();
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
    if (item.type === 'text' || item.type === 'code') {
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
