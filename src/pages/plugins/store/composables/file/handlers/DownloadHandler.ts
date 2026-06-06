import { invoke } from '@tauri-apps/api/core'
import { loadingMap } from '@/pages/plugins/store/composables/PluginComponsables.ts'
import { BaseHandler } from '../BaseHandler'
import { PluginHandlerContext } from '@/pages/plugins/store/composables/file/types'

/**
 * 下载处理器
 */
export class DownloadHandler extends BaseHandler {
  public async doHandle(context: PluginHandlerContext): Promise<void> {
    loadingMap.value.set(context.plugin.id, 'downloading')
    console.log(`正在下载[${context.plugin.id}]插件...`)
    // 文件下载
    try {
      // 删除已存在的文件
      super.deleteZipFile(context)
      // 下载文件并获取下载结果
      if (
        !(await invoke<boolean>('download_file', {
          url: context.plugin.downloadUrl,
          path: context.localZipPath,
        }))
      ) {
        context.success = false
      }
    } catch (error) {
      console.error(`[${context.plugin.id}]插件下载异常:`, error)
      super.deleteZipFile(context)
      context.success = false
    }
    console.log(`[${context.plugin.id}]插件下载完成，传递给下一个处理器...`)
  }
}
