import { listen } from '@tauri-apps/api/event';
import { writeImage, writeText } from '@tauri-apps/plugin-clipboard-manager';
import { readFile } from '@tauri-apps/plugin-fs';
import { error, info } from '@tauri-apps/plugin-log';
import { clipboardListenStore } from '../store/copyStatus';
import ClipboardDB from '../utils/db';

/**
 * 初始化剪贴板监听服务
 */
export async function initClipboardListener() {
  // 监听剪贴板内容变化事件
  const unListen = await listen('clipboard-change', async (event) => {
    info('剪贴板内容发生变化');
    const clipboardListen = clipboardListenStore();
    try {
      clipboardListen.coping();
      const payload: any = event.payload;
      info('剪贴板内容变化事件:' + payload);

      if (payload.type === 'text') {
        // 处理文本内容
        const content = payload.content;
        if (content) {
          info('检测到新的剪贴板文本内容');
          const db = await ClipboardDB.getInstance();
          const result = await db.saveClipboardItem(content, 'text');
          info("文本内容保存到数据库：" + result);
        }
      } else if (payload.type === 'image') {
        // 处理图片内容 - 现在直接接收文件路径
        const fileName = payload.file_name;
        const filePath = payload.file_path;

        if (filePath) {
          info('检测到新的剪贴板图片内容，文件已保存到:' + filePath);

          // 直接将文件路径保存到数据库
          const db = await ClipboardDB.getInstance();
          await db.saveClipboardItem(fileName, 'image', filePath);
        }
      }
    } catch (er: any) {
      error('处理剪贴板事件失败:' + er.message);
    } finally {
      clipboardListen.success();
    }
  });

  info('剪贴板监听服务已启动');
  return unListen;
}

/**
 * 将内容写入剪贴板
 */
export async function copyToClipboard(content: string, type: string) {
  if (type === 'text') {
    try {
      await writeText(content);
      return true;
    } catch (er: any) {
      error('文字写入剪贴板失败:' + er.message);
      return false;
    }
  }
  if (type === 'image') {
    try {
      const file = await readFile(content);
      await writeImage(file);
      return true;
    } catch (er: any) {
      error('图片写入剪贴板失败:' + er.message);
      return false;
    }
  }
}