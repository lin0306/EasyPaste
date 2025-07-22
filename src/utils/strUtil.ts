import {isMac} from "../data/SystemParams";
import markdownIt from 'markdown-it'
const md = markdownIt()

/**
 * Uint8Array转字符串
 * @param fileData 文件数据
 */
export function uint8ArrayToString(fileData: Uint8Array) {
    const decoder = new TextDecoder("utf-8");
    return decoder.decode(fileData);
}

/**
 * 文件路径转文件名
 * @param filePath 文件路径
 * @return 文件名
 */
export function filePathConvertFileName(filePath: string): string {
    // windows是斜杠
    const strArr = filePath.split("\\");
    if (isMac) {
        // mac是反斜杠
        return filePath.split("/").pop() || filePath;
    }
    return strArr.pop() || filePath;
}

/**
 * 将文本转换成markdown数据
 * @param content 文本数据
 */
export function covertMarkdown(content: string) {
    return md.render(content);
}