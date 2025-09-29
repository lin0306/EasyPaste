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