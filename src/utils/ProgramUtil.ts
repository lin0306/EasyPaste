import {programMimeTypes} from "../constants/FileTypeConstatnts.ts";

/**
 * 判断文件是否是程序
 * @param filePath
 */
export function isProgram(filePath: string) {
    const suffix = filePath.toLowerCase().split('.').pop() || '';
    return programMimeTypes[suffix] !== undefined;
}