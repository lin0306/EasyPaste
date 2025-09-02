import {readFile} from '@tauri-apps/plugin-fs';
import {error} from '@tauri-apps/plugin-log';

/**
 * 常见图片格式的MIME类型映射
 */
const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'webp': 'image/webp',
    'svg': 'image/svg+xml'
};

/**
 * 读取图片文件并转换为base64格式
 * @param filePath 图片文件路径
 * @returns base64格式的图片数据
 */
export async function readImageAsBase64(filePath: string): Promise<string> {
    try {

        // 使用Tauri的fs插件读取文件
        const imageData = await readFile(filePath);

        // 将二进制数据转换为base64
        const base64Data = convertToBase64(imageData);

        // 根据文件扩展名确定MIME类型
        const mimeType = getMimeTypeFromPath(filePath);

        // 返回完整的base64图片数据
        return `data:${mimeType};base64,${base64Data}`;
    } catch (err) {
        error('读取图片文件失败:' + err);
        throw err;
    }
}

/**
 * 判断文件是否是图片
 * @param { string } filePath - 文件路径
 * @returns { boolean } -是否是图片
 */
export function isImage(filePath: string): boolean {
    if (filePath.includes(".")) {
        const suffix = filePath.toLowerCase().split('.').pop() || '';
        return !!mimeTypes[suffix];
    }
    return false;
}

/**
 * 根据文件路径获取MIME类型
 * @param { string } filePath 文件路径
 * @returns  { string } MIME类型
 */
function getMimeTypeFromPath(filePath: string): string {
    const suffix = filePath.toLowerCase().split('.').pop() || '';

    return mimeTypes[suffix] || 'application/octet-stream';
}

/**
 * 二进制数据转换成base64数据
 * @param arrayBuffer 二进制数据
 */
function convertToBase64(arrayBuffer: any) {
    let binary = '';
    const bytes = new Uint8Array(arrayBuffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

/**
 * 判断文件是否是Word文件
 * @param filePath 文件路径
 */
export function isWord(filePath: string) {
    return filePath.toLowerCase().endsWith('.doc')
        || filePath.toLowerCase().endsWith('.docx')
        || filePath.toLowerCase().endsWith('.dotx')
        || filePath.toLowerCase().endsWith('.dotm')
        ;
}

/**
 * 判断文件是否是excel文件
 * @param filePath 文件路径
 */
export function isExcel(filePath: string) {
    return filePath.toLowerCase().endsWith('.xlsx')
        || filePath.toLowerCase().endsWith('.xls')
        || filePath.toLowerCase().endsWith('.xlsm')
        || filePath.toLowerCase().endsWith('.xlsb')
        ;
}

/**
 * 判断文件是否是ppt文件
 * @param filePath 文件路径
 */
export function isPPT(filePath: string) {
    return filePath.toLowerCase().endsWith('.pptx')
        || filePath.toLowerCase().endsWith('.ppt')
        || filePath.toLowerCase().endsWith('.potx')
        || filePath.toLowerCase().endsWith('.potm')
        || filePath.toLowerCase().endsWith('.pptm')
        || filePath.toLowerCase().endsWith('.ppsx')
        || filePath.toLowerCase().endsWith('.ppsm')
        ;
}

/**
 * 判断文件是否是pdf文件
 * @param filePath 文件路径
 */
export function isPDF(filePath: string) {
    return filePath.toLowerCase().endsWith('.pdf')
        || filePath.toLowerCase().endsWith('.pdfa')
        || filePath.toLowerCase().endsWith('.pdfx')
        || filePath.toLowerCase().endsWith('.pdfua')
        ;
}

/**
 * 判断文件是否是文本文件
 * @param filePath 文件路径
 */
export function isTXT(filePath: string) {
    return filePath.toLowerCase().endsWith('.txt')
        || filePath.toLowerCase().endsWith('.text')
        || filePath.toLowerCase().endsWith('.log')
        || filePath.toLowerCase().endsWith('.csv')
        || filePath.toLowerCase().endsWith('.tsv')
        || filePath.toLowerCase().endsWith('.md')
        || filePath.toLowerCase().endsWith('.rtf')
        ;
}

/**
 * 判断文件是否是音频文件
 * @param filePath 文件路径
 */
export function isAudio(filePath: string) {
    return filePath.toLowerCase().endsWith('.mp3')
        || filePath.toLowerCase().endsWith('.wav')
        || filePath.toLowerCase().endsWith('.aac')
        || filePath.toLowerCase().endsWith('.flac')
        || filePath.toLowerCase().endsWith('.ogg')
        || filePath.toLowerCase().endsWith('.wma')
        ;
}

/**
 * 判断文件是否是视频文件
 * @param filePath 文件路径
 */
export function isVideo(filePath: string) {
    return filePath.toLowerCase().endsWith('.mp4')
        || filePath.toLowerCase().endsWith('.avi')
        || filePath.toLowerCase().endsWith('.mkv')
        || filePath.toLowerCase().endsWith('.mov')
        || filePath.toLowerCase().endsWith('.wmv')
        || filePath.toLowerCase().endsWith('.flv')
        ;
}

/**
 * 判断文件是否是压缩文件
 * @param filePath 文件路径
 */
export function isPackage(filePath: string) {
    return filePath.toLowerCase().endsWith('.zip')
        || filePath.toLowerCase().endsWith('.rar')
        || filePath.toLowerCase().endsWith('.7z')
        || filePath.toLowerCase().endsWith('.tar')
        || filePath.toLowerCase().endsWith('.gz')
        ;
}