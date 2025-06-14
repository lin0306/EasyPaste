/**
 * Uint8Array转字符串
 */
export function uint8ArrayToString(fileData: Uint8Array) {
    const decoder = new TextDecoder("utf-8");
    return decoder.decode(fileData);
}