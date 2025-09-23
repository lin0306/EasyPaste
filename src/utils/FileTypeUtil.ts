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