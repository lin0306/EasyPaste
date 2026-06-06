// 2. 解压压缩文件处理器
import { invoke } from '@tauri-apps/api/core'
import { loadingMap } from '@/pages/plugins/store/composables/PluginComponsables.ts'
import { BaseHandler } from '../BaseHandler'
import { PluginHandlerContext } from '@/pages/plugins/store/composables/file/types'

/**
 * 解压文件处理器
 */
export class ExtractHandler extends BaseHandler {
  public async doHandle(context: PluginHandlerContext): Promise<void> {
    loadingMap.value.set(context.plugin.id, 'unzipping')
    console.log(`正在解压[${context.plugin.id}]插件...`)
    // 先删除旧插件信息
    super.deleteFolder(context)
    // 文件解压
    try {
      // 解压文件并获取解压结果
      let unzipResult = await invoke<boolean>('unzip_file', {
        path: context.localZipPath,
        folderPath: context.localFolderPath,
      })
      if (!unzipResult) {
        super.deleteFolder(context)
        context.success = false
      }
    } catch (error) {
      console.error(`[${context.plugin.id}]插件解压异常:`, error)
      super.deleteFolder(context)
      context.success = false
    } finally {
      if (context.mode !== 'installLocal') {
        // 不管解压成功还是失败，都删除压缩文件
        super.deleteZipFile(context)
        console.log('插件压缩包删除完成')
      }
    }
    console.log(`[${context.plugin.id}]插件解压完成，传递给下一个处理器...`)
  }
}