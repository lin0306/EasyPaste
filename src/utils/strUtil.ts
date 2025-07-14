import { isMac } from "../data/SystemParams";

/**
 * Uint8Array转字符串
 */
export function uint8ArrayToString(fileData: Uint8Array) {
    const decoder = new TextDecoder("utf-8");
    return decoder.decode(fileData);
}

export function filePathConverFileName(filePath: string) {
    // windows是斜杠
    const strArr = filePath.split("\\");
    if (isMac) {
        // mac是反斜杠
        return filePath.split("/").pop() || filePath;
    }
    if (strArr) {
        return strArr[strArr.length - 1];
    }
    return filePath;
}