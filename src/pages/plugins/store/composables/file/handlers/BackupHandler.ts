import { loadingMap } from '@/pages/plugins/store/composables/PluginComponsables.ts'
import { BaseHandler } from '../BaseHandler'
import { renameFolder } from '@/utils/FileUtil.ts'
import { PluginHandlerContext } from '@/pages/plugins/store/composables/file/types'

/**
 * 备份处理器
 */
export class BackupHandler extends BaseHandler {
  public async doHandle(context: PluginHandlerContext): Promise<void> {
    loadingMap.value.set(context.plugin.id, 'backingUp')
    console.log(`正在备份[${context.plugin.id}]插件...`)
    if (context.localFolderPath) {
      renameFolder(context.localFolderPath, context.localFolderPath + '_back')
    }
    console.log(`[${context.plugin.id}]插件已备份，传递给下一个处理器...`)
  }
}
