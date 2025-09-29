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
export function getType(filePath: string): string {
    const suffix = filePath.toLowerCase().split('.').pop() || '';

    return mimeTypes[suffix] || 'application/octet-stream';
}