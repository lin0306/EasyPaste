import { BaseHandler } from '../BaseHandler'
import { emit } from '@tauri-apps/api/event'
import { PluginHandlerContext } from '@/pages/plugins/store/composables/file/types'

// 事件处理器
export class EventHandler extends BaseHandler {
  public async doHandle(context: PluginHandlerContext): Promise<void> {
    console.log(`[${context.plugin.id}]插件事件通知...`)
    switch (context.mode) {
      case 'install':
        await emit('install-plugin', { pluginId: context.plugin.id })
        break
      case 'installLocal':
      case 'update':
        if (context.times === 0) {
          await emit('uninstall-plugin', { pluginId: context.plugin.id })
          context.times++
        } else {
          await emit('install-plugin', { pluginId: context.plugin.id })
        }
        break
      case 'uninstall':
        await emit('uninstall-plugin', { pluginId: context.plugin.id })
        break
      default:
        console.error('无效的执行模式')
        context.success = false
        return
    }
    console.log(`[${context.plugin.id}]插件事件通知完成，传递给下一个处理器...`)
  }
}
