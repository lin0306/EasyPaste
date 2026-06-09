import ClipboardDBService from '@/services/ClipboardDBService.ts'
import { loadPluginManifest } from '@/services/PluginService.ts'
import { BaseHandler } from '../BaseHandler'
import { PluginHandlerContext } from '@/pages/plugins/store/composables/file/types'

// 插件数据库处理器
export class DBHandler extends BaseHandler {
  public async doHandle(context: PluginHandlerContext): Promise<void> {
    console.log(`修改[${context.plugin.id}]插件数据库信息...`)
    switch (context.mode) {
      case 'install':
        await this.savePlugin(context)
        break
      case 'update':
        await this.updatePlugin(context)
        break
      case 'installLocal':
        if (context.pluginId) {
          await this.updatePlugin(context)
        } else {
          await this.savePlugin(context)
        }
        break
      case 'uninstall':
        await this.deletePlugin(context.pluginId, context.plugin)
        break
      default:
        console.error('无效的执行模式')
        context.success = false
        return
    }
    console.log(`[${context.plugin.id}]插件插件数据库信息修改完成，传递给下一个处理器...`)
  }

  /**
   * 保存插件
   * @param context 上下文
   */
  async savePlugin(context: PluginHandlerContext): Promise<void> {
    console.log(`正在保存[${context.plugin.id}]插件...`)
    const useLocationSet = await this.getUseLocations(context.plugin.id)
    const source = this.getSource(context.mode)
    console.log('插件来源', source)
    // 保存插件信息
    const db = await ClipboardDBService.getInstance()
    const pluginInfo = this.packPlugin(context.plugin, useLocationSet, source) as LocalPlugin
    pluginInfo.install_time = Date.now()
    console.log('即将入库的插件信息', pluginInfo)
    await db.addPlugin(pluginInfo)
    console.log(`[${context.plugin.id}]插件信息保存完成。`)
  }

  /**
   * 更新插件
   * @param context 上下文
   */
  async updatePlugin(context: PluginHandlerContext): Promise<void> {
    console.log(`正在更新[${context.plugin.id}]插件...`)
    const useLocationSet = await this.getUseLocations(context.plugin.id)
    const source = this.getSource(context.mode)
    // 保存插件信息
    const db = await ClipboardDBService.getInstance()
    const pluginInfo = this.packPlugin(context.plugin, useLocationSet, source) as LocalPlugin
    pluginInfo.id = context.pluginId
    console.log('即将入库的插件信息', pluginInfo)
    await db.updatePlugin(pluginInfo)
    console.log(`[${context.plugin.id}]插件更新完成。`)
  }

  /**
   * 删除插件
   * @param pluginId 插件id
   * @param plugin 插件信息
   */
  async deletePlugin(pluginId: number, plugin: StorePlugin): Promise<void> {
    console.log(`正在删除[${plugin.id}]插件...`)
    // 删除插件数据
    const db = await ClipboardDBService.getInstance()
    await db.removePlugin(pluginId)
    console.log(`[${plugin.id}]插件删除完成。`)
  }

  /**
   * 封装插件信息
   * @param plugin 插件信息
   * @param useLocationSet 可加载页面
   * @param source 插件来源
   */
  packPlugin(plugin: StorePlugin, useLocationSet: Set<string>, source: string) {
    return {
      plugin_id: plugin.id,
      plugin_name: plugin.name,
      version: plugin.version,
      use_location: JSON.stringify([...useLocationSet]),
      platform: plugin.platform,
      fileName: plugin.fileName,
      release_url: plugin.releaseUrl,
      url: plugin.downloadUrl,
      description: plugin.description,
      size: plugin.size,
      source: source,
    }
  }

  /**
   * 获取插件可加载页面
   * @param pluginId 插件id
   */
  async getUseLocations(pluginId: string) {
    const manifest = await loadPluginManifest(pluginId)
    if (!manifest) {
      throw new Error(`[${pluginId}]未找到插件配置文件`)
    }
    console.log(`加载[${pluginId}]插件`, manifest)
    const useLocationSet = new Set<string>()
    const features = manifest.features
    if (features) {
      for (let feature of features) {
        if (feature.page && feature.page !== 'plugins') {
          useLocationSet.add(feature.page)
        }
      }
    }
    console.log(`[${pluginId}]插件可加载页面`, useLocationSet)

    return useLocationSet
  }

  /**
   * 获取插件来源
   * @param mode 执行模式
   */
  getSource(mode: string) {
    switch (mode) {
      case 'install':
      case 'update':
        return 'network'
      case 'installLocal':
        return 'local'
      default:
        return 'network'
    }
  }
}
