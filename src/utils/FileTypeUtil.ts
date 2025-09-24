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
        || filePath.toLowerCase().endsWith('.env')
        || filePath.toLowerCase().endsWith('.dockerignore')
        || filePath.toLowerCase().endsWith('.gitignore')
        || filePath.toLowerCase().endsWith('.conf')
        ;
}

/**
 * 判断文件是否是Markdown文件
 * @param filePath 文件路径
 */
export function isMarkdown(filePath: string) {
    return filePath.toLowerCase().endsWith('.md');
}

/**
 * 判断文件是否是RTF文件
 * @param filePath 文件路径
 */
export function isRTF(filePath: string) {
    return filePath.toLowerCase().endsWith('.rtf');
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