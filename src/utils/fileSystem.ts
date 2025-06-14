import { BaseDirectory, readFile, remove } from '@tauri-apps/plugin-fs';
import { error, info } from '@tauri-apps/plugin-log';

/**
 * 文件系统工具类
 * 用于处理文件系统相关操作，如读取图片等
 */
export default class FileSystem {
    private static instance: FileSystem | null = null;

    /**
     * 获取FileSystem实例（单例模式）
     * @returns FileSystem实例
     */
    public static async getInstance(): Promise<FileSystem> {
        if (!FileSystem.instance) {
            FileSystem.instance = new FileSystem();
        }
        return FileSystem.instance;
    }

    /**
     * 读取图片文件并转换为base64格式
     * @param filePath 图片文件路径
     * @returns base64格式的图片数据
     */
    public async readImageAsBase64(filePath: string): Promise<string> {
        try {

            // 使用Tauri的fs插件读取文件
            const imageData = await readFile(filePath);

            // 将二进制数据转换为base64
            var base64Data = this.convertToBase64(imageData);

            // 根据文件扩展名确定MIME类型
            const mimeType = this.getMimeTypeFromPath(filePath);

            // 返回完整的base64图片数据
            return `data:${mimeType};base64,${base64Data}`;
        } catch (err: any) {
            error('读取图片文件失败:' + err.message);
            throw err;
        }
    }

    /**
     * 删除图片存储文件夹
     */
    public async removeImageFolder() {
        try {
            await remove('images', {
                baseDir: BaseDirectory.AppLocalData,
                recursive: true,
            });
        } catch (err: any) {
            error('删除图片存储文件夹失败:' + err.message);
        }
    }

    /**
     * 删除图片文件
     * @param filePath 图片路径
     */
    public async removeImageFile(filePath: string) {
        try {
            info("删除文件：" + filePath);
            await remove(filePath);
        } catch (err: any) {
            error('删除文件失败:' + err.message);
        }
    }

    /**
     * 根据文件路径获取MIME类型
     * @param filePath 文件路径
     * @returns MIME类型
     */
    private getMimeTypeFromPath(filePath: string): string {
        const extension = filePath.toLowerCase().split('.').pop() || '';

        // 常见图片格式的MIME类型映射
        const mimeTypes: Record<string, string> = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'bmp': 'image/bmp',
            'webp': 'image/webp',
            'svg': 'image/svg+xml'
        };

        return mimeTypes[extension] || 'application/octet-stream';
    }

    // 二进制数据转换成base64数据
    private convertToBase64(arrayBuffer: any) {
        let binary = '';
        const bytes = new Uint8Array(arrayBuffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
}