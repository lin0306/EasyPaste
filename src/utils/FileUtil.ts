import { copyFile, remove, stat } from '@tauri-apps/plugin-fs'
import { error, info } from '@tauri-apps/plugin-log'
import { isMac } from '../data/SystemParams.ts'

/**
 * 获取文件大小，单位：字节
 * @param filePath 文件路径
 */
export async function getFileSize(filePath: string): Promise<number> {
  const info = await stat(filePath)
  return info.size
}

/**
 * 将文件大小转换为可读格式
 * @param size 文件大小，单位：字节
 */
export function convertFileSize(size: number): string {
  if (size < 1024) {
    return size + 'B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + 'KB'
  } else if (size < 1024 * 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(2) + 'MB'
  } else {
    return (size / (1024 * 1024 * 1024)).toFixed(2) + 'GB'
  }
}

/**
 * 删除文件
 * @param filePath 文件路径
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    await remove(filePath)
    info('[文件系统] 删除文件成功,filePath:' + filePath)
  } catch (e) {
    error('[文件系统] 删除文件失败,filePath:' + filePath + ',err:' + e)
  }
}

/**
 * 移动文件
 * @param sourcePath 源文件路径
 * @param targetPath 目标文件路径
 */
export async function moveFile(sourcePath: string, targetPath: string): Promise<void> {
  // 移动文件
  try {
    await copyFile(sourcePath, targetPath)
    info('[文件系统] 移动复制成功,sourcePath:' + sourcePath + ',targetPath:' + targetPath)
    await deleteFile(sourcePath)
  } catch (err) {
    error(
      '[文件系统] 移动复制失败,sourcePath:' +
        sourcePath +
        ',targetPath:' +
        targetPath +
        ',err:' +
        err
    )
  }
}

/**
 * 删除文件夹
 * @param folder 文件夹路径
 */
export async function deleteFolder(folder: string): Promise<void> {
  try {
    await remove(folder, { recursive: true })
    info('[文件系统] 删除文件夹,folder:' + folder)
  } catch (err) {
    error('[文件系统] 删除文件夹失败,folder:' + folder + ',err:' + err)
  }
}

/**
 * 删除文件路径中的转义符
 * @param path 文件路径
 */
export function removeEscape(path: string): string {
  return isMac ? path : path.replace(/\\/g, '\\')
}
