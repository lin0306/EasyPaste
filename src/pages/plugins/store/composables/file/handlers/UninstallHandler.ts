import { BaseHandler } from '../BaseHandler'
import { PluginHandlerContext } from '@/pages/plugins/store/composables/file/types'

/**
 * 卸载处理器
 */
export class UninstallHandler extends BaseHandler {
  public async doHandle(context: PluginHandlerContext): Promise<void> {
    console.log(`正在删除[${context.plugin.id}]插件文件...`)
    super.deleteFolder(context)
    console.log(`[${context.plugin.id}]插件文件已删除，传递给下一个处理器...`)
    await this.handleNext(context)
  }
}
