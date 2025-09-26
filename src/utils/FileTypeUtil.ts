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

/**
 * 判断文件是否是程序
 * @param filePath
 */
export function isProgram(filePath: string) {
    return filePath.toLowerCase().endsWith('.exe')
        || filePath.toLowerCase().endsWith('.msi')
        || filePath.toLowerCase().endsWith('.app')
    ;
}