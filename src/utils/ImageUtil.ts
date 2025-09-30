import {imageMimeTypes} from "../constants/FileTypeConstatnts.ts";

/**
 * 判断文件是否是图片
 * @param { string } filePath - 文件路径
 * @returns { boolean } -是否是图片
 */
export function isImage(filePath: string): boolean {
    if (filePath.includes(".")) {
        const suffix = filePath.toLowerCase().split('.').pop() || '';
        return !!imageMimeTypes[suffix];
    }
    return false;
}

/**
 * 根据文件路径获取MIME类型
 * @param { string } filePath 文件路径
 * @returns  { string } MIME类型
 */
export function getType(filePath: string): string {
    const suffix = filePath.toLowerCase().split('.').pop() || '';

    return imageMimeTypes[suffix] || 'application/octet-stream';
}