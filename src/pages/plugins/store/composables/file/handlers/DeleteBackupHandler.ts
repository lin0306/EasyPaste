import { BaseHandler } from '../BaseHandler'
import { deleteFolder } from '@/utils/FileUtil.ts'
import { PluginHandlerContext } from '@/pages/plugins/store/composables/file/types'

/**
 * 备份处理器
 */
export class DeleteBackupHandler extends BaseHandler {
  public async doHandle(context: PluginHandlerContext): Promise<void> {
    console.log(`正在删除[${context.plugin.id}]插件的备份...`)
    if (context.localFolderPath) {
      deleteFolder(context.localFolderPath + '_back')
    }
    console.log(`[${context.plugin.id}]插件备份已删除，传递给下一个处理器...`)
  }
}
