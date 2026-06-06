import { BaseHandler } from '../BaseHandler'
import { invoke } from '@tauri-apps/api/core'
import { loadPluginLanguage } from '@/services/LanguageService.ts'
import {
  loadingMap,
  loadLocalPlugins,
  localPlugins,
  onSelectLocal,
  selectedPlugin,
} from '@/pages/plugins/store/composables/PluginComponsables.ts'
import { PluginHandlerContext } from '@/pages/plugins/store/composables/file/types'

// 加载器处理器
export class LoadingHandler extends BaseHandler {
  public async doHandle(context: PluginHandlerContext): Promise<void> {
    console.log(`正在加载[${context.plugin.id}]插件...`)
    switch (context.mode) {
      case 'install':
      case 'installLocal':
        await this.handleInstall(context)
        break
      case 'update':
        await this.handleUpdate(context)
        break
      case 'uninstall':
        await this.handleUninstall()
        break
      default:
        console.error('无效的执行模式')
        context.success = false
    }
    console.log(`[${context.plugin.id}]插件加载完成，传递给下一个处理器...`)
  }

  /**
   * 卸载处理
   */
  private async handleUninstall() {
    // 重新加载插件
    await loadLocalPlugins()
  }

  /**
   * 更新处理
   * @param context 上下文
   */
  private async handleUpdate(context: PluginHandlerContext) {
    loadingMap.value.set(context.plugin.id, 'loading')
    // 后端载入插件的语言
    await invoke('load_plugin_locales', { pluginId: context.plugin.id })
    // 前端获取插件的语言
    await loadPluginLanguage()
    // 重新加载插件
    await loadLocalPlugins()

    // 如果当前选中的插件是刚安装的，更新选中状态以触发设置按钮检查
    if (selectedPlugin.pluginId === context.plugin.id) {
      const newlyInstalled = localPlugins.value.find(l => l.plugin_id === context.plugin.id)
      if (newlyInstalled) {
        onSelectLocal(newlyInstalled)
      }
    }
  }

  /**
   * 安装处理
   * @param context 上下文
   */
  private async handleInstall(context: PluginHandlerContext) {
    loadingMap.value.set(context.plugin.id, 'loading')
    // 重新加载插件
    await loadLocalPlugins()
    // 后端载入插件的语言
    await invoke('load_plugin_locales', { pluginId: context.plugin.id })
    // 前端获取插件的语言
    await loadPluginLanguage()

    // 如果当前选中的插件是刚安装的，更新选中状态以触发设置按钮检查
    if (selectedPlugin.pluginId === context.plugin.id) {
      const newlyInstalled = localPlugins.value.find(l => l.plugin_id === context.plugin.id)
      if (newlyInstalled) {
        onSelectLocal(newlyInstalled)
      }
    }
  }
}
