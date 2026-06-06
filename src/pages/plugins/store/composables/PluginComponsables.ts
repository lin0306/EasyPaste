import { reactive, ref } from 'vue'
import { fetch } from '@tauri-apps/plugin-http'
import { isDev, isMac } from '@/data/SystemParams.ts'
import ClipboardDBService from '@/services/ClipboardDBService.ts'
import { error } from '@tauri-apps/plugin-log'
import { emit } from '@tauri-apps/api/event'
import { currentLanguage } from '@/services/LanguageService.ts'
import { open } from '@tauri-apps/plugin-dialog'
import { MessageApiInjection } from 'naive-ui/es/message/src/MessageProvider'
import { DialogApiInjection } from 'naive-ui/es/dialog/src/DialogProvider'
import {
  installPlugin,
  installPluginByLocal,
  uninstallPlugin,
  updatePlugin,
} from '@/pages/plugins/store/composables/file'

// 插件状态
type loadingState =
  | 'downloading'
  | 'unzipping'
  | 'loading'
  | 'uninstalling'
  | 'updating'
  | 'backingUp'
  | 'resetBackingUp'
  | 'reading'

export const tabValue = ref<string>('local')
export const pluginStore = ref<StorePlugin[]>([])
export const localPlugins = ref<LocalPlugin[]>([])
export const selectedPlugin = reactive({} as SelectPlugin)
export const loadingMap = ref<Map<string, loadingState>>(new Map<string, loadingState>())
export const storeListLoading = ref(false)
export const localListLoading = ref(false)

/**
 * 判断插件是否有更新
 * @param pluginId 插件id
 */
export const hasUpdate = (pluginId: string): boolean => {
  const localPlugin = localPlugins.value.find(l => l.plugin_id === pluginId)
  const storePlugin = pluginStore.value.find(p => p.id === pluginId)
  return !!(localPlugin && storePlugin && localPlugin.version !== storePlugin.version)
}

/**
 * 获取最新版本号
 * @param pluginId 插件id
 */
export const getLatestVersion = (pluginId: string): string | undefined => {
  const storePlugin = pluginStore.value.find(p => p.id === pluginId)
  return storePlugin?.version
}

/**
 * 获取本地版本号
 * @param pluginId 插件id
 */
export const getLocalVersion = (pluginId: string): string | undefined => {
  const localPlugin = localPlugins.value.find(l => l.plugin_id === pluginId)
  return localPlugin?.version
}

/**
 * 判断插件是否安装
 * @param pluginId 插件id
 */
export const isInstall = (pluginId: string): boolean => {
  if (localPlugins.value && localPlugins.value.length > 0) {
    return localPlugins.value.some(l => l.plugin_id === pluginId)
  }
  return false
}

/**
 * 获取本地插件
 * @param id 插件唯一id
 */
export const getLocalPlugin = (id: string): LocalPlugin | null => {
  const find = localPlugins.value.find(l => l.plugin_id === id)
  return find ? find : null
}

/**
 * 安装插件
 */
export const install = async (pluginId: string, message: MessageApiInjection): Promise<void> => {
  const plugin = pluginStore.value.find(p => p.id === pluginId)
  if (plugin) {
    try {
      if (plugin && plugin.downloadUrl) {
        await installPlugin(plugin, message)
      } else {
        message.error(currentLanguage.value.pages.pluginStore.installNotUrlHint)
      }
    } catch (e) {
      console.log('安装插件失败', e)
    } finally {
      loadingMap.value.delete(plugin.id)
    }
  }
}

/**
 * 卸载插件
 */
export const uninstall = async (pluginId: string, message: MessageApiInjection): Promise<void> => {
  const plugin = localPlugins.value.find(p => p.plugin_id === pluginId)
  if (plugin) {
    try {
      console.log('开始卸载插件', plugin.plugin_id)
      loadingMap.value.set(plugin.plugin_id, 'uninstalling')
      if (plugin.id && plugin.id > 0) {
        await uninstallPlugin(plugin, message)
      } else {
        message.error(currentLanguage.value.pages.pluginStore.notInstallHint)
        await loadLocalPlugins()
      }
    } catch (e) {
      console.error(e)
      message.error(currentLanguage.value.pages.pluginStore.uninstallFailedHint)
    } finally {
      loadingMap.value.delete(plugin.plugin_id)
    }
  }
}

/**
 * 插件更新
 */
export const update = async (pluginId: string, message: MessageApiInjection): Promise<void> => {
  try {
    if (pluginId) {
      loadingMap.value.set(pluginId, 'updating')
      const storePlugin = pluginStore.value.find(l => l.id === pluginId)
      const localPlugin = localPlugins.value.find(l => l.plugin_id === pluginId)
      if (storePlugin) {
        if (localPlugin) {
          if (storePlugin && storePlugin.downloadUrl) {
            console.log('开始更新插件', storePlugin, storePlugin.downloadUrl)
            await updatePlugin(localPlugin.id, storePlugin, message)
          } else {
            message.error(currentLanguage.value.pages.pluginStore.installNotUrlHint)
          }
        } else {
          // 本地没有安装插件，执行安装操作
          await install(pluginId, message)
        }
      } else {
        message.error(currentLanguage.value.pages.pluginStore.notPluginHint)
      }
    } else {
      message.error(currentLanguage.value.pages.pluginStore.notSelectPluginHint)
    }
  } catch (e) {
    console.error('插件更新失败', e)
    message.error(currentLanguage.value.pages.pluginStore.updateFailedHint)
  } finally {
    loadingMap.value.delete(pluginId)
  }
}

/**
 * 从本地文件安装插件
 */
export const installLocal = async (
  message: MessageApiInjection,
  dialog: DialogApiInjection
): Promise<void> => {
  try {
    loadingMap.value.set('local-file-install', 'reading')
    // 打开文件选择对话框
    const selected = await open({
      multiple: false,
      filters: [
        {
          name: 'Plugin Package',
          extensions: ['zip'],
        },
      ],
    })

    if (!selected) {
      console.log('用户取消了文件选择')
      return
    }

    console.log('选择的文件路径:', selected)
    const pluginId = await installPluginByLocal(selected as string, message, dialog)

    // 如果当前选中的是刚安装的插件，更新选中状态
    if (selectedPlugin.pluginId === pluginId) {
      const newlyInstalled = localPlugins.value.find(l => l.plugin_id === pluginId)
      if (newlyInstalled) {
        onSelectLocal(newlyInstalled)
      }
    }
  } catch (e) {
    console.error('本地文件安装失败:', e)
    error('本地文件安装失败' + e)
    message.error(currentLanguage.value.pages.pluginStore.localInstallFailedHint)
  } finally {
    loadingMap.value.delete('local-file-install')
  }
}

/**
 * 选择本地插件
 * @param plugin 本地插件
 */
export const onSelectLocal = (plugin: LocalPlugin): void => {
  selectedPlugin.id = plugin.id
  selectedPlugin.pluginId = plugin.plugin_id
  selectedPlugin.pluginName = plugin.plugin_name
  selectedPlugin.version = plugin.version
  selectedPlugin.platform = plugin.platform
  selectedPlugin.url = plugin.url
  selectedPlugin.description = plugin.description
  selectedPlugin.enable = plugin.enable
}

/**
 * 选择商店插件
 * @param plugin 商店插件
 */
export const onSelectStore = (plugin: StorePlugin): void => {
  const localPlugin = getLocalPlugin(plugin.id)
  selectedPlugin.id = localPlugin ? localPlugin.id : 1
  selectedPlugin.enable = localPlugin ? localPlugin.enable : 1
  selectedPlugin.pluginId = plugin.id
  selectedPlugin.pluginName = plugin.name
  selectedPlugin.url = plugin.downloadUrl
  selectedPlugin.version = plugin.version
  selectedPlugin.platform = plugin.platform
  selectedPlugin.description = plugin.description
}

/**
 * 清空选择的插件
 */
export const clearSelectPlugin = (): void => {
  selectedPlugin.id = null
  selectedPlugin.pluginId = ''
}

/**
 * 启用/禁用插件
 * @param pluginId 插件id
 * @param enable 启用/禁用
 */
export const togglePluginEnable = async (pluginId: string, enable: boolean): Promise<void> => {
  try {
    loadingMap.value.set(pluginId, 'loading')

    const plugin = localPlugins.value.find(l => l.plugin_id === pluginId)
    if (selectedPlugin.pluginId === pluginId) {
      selectedPlugin.enable = enable ? 1 : 0
    }
    localPlugins.value.forEach(l => {
      if (l.plugin_id === pluginId) {
        l.enable = enable ? 1 : 0
      }
    })
    if (plugin) {
      const db = await ClipboardDBService.getInstance()
      await db.togglePluginEnable(plugin.id, enable)
      // 发送消息加载或取消加载插件
      await loadLocalPlugins()
      await emit('toggle-plugin-enable', { pluginId: pluginId, enable: enable })
      console.log('插件启用/禁用成功', pluginId, enable)
    }
  } catch (e) {
    error('插件启用/禁用异常' + e)
  } finally {
    setTimeout(() => {
      loadingMap.value.delete(pluginId)
    }, 300)
  }
}

/**
 * 获取插件商店数据
 */
async function loadPluginStore(): Promise<void> {
  console.log('开始加载插件商店数据')
  try {
    storeListLoading.value = true
    const response = await fetch(
      'https://gh-proxy.com/https://raw.githubusercontent.com/lin0306/EasyPaste-Plugins/master/plugins-list.json',
      { method: 'GET' }
    )
    let data: StorePlugin[] = await response.json()
    if (!isDev) {
      data = data.filter(p => p.branch === 'GA')
    }
    console.log('插件商店数据', data)
    // 筛选出当前操作系统的插件
    if (isMac) {
      pluginStore.value = data.filter(p => p.platform === 'MacOS' || p.platform === 'General')
    } else {
      pluginStore.value = data.filter(p => p.platform === 'Windows' || p.platform === 'General')
    }
    // pluginStore.value = data
    console.log('插件商店数据：', pluginStore.value)
  } catch (error) {
    console.error('Error fetching JSON:', error)
  } finally {
    setTimeout(() => {
      storeListLoading.value = false
    }, 200)
  }
}

/**
 * 获取本地插件数据
 */
export async function loadLocalPlugins(): Promise<void> {
  try {
    console.log('获取本地插件数据')
    localListLoading.value = true
    const db = await ClipboardDBService.getInstance()
    const plugins = await db.getAllPlugins()
    console.log('本地插件数据：', plugins)
    localPlugins.value = plugins
  } catch (e) {
    error('获取本地插件数据异常' + e)
  } finally {
    localListLoading.value = false
  }
}

/**
 * 初始化插件数据
 */
export const initializePlugins = async (): Promise<void> => {
  try {
    // 获取本地插件数据
    await loadLocalPlugins()
    if (tabValue.value === 'local' && localPlugins.value && localPlugins.value.length > 0) {
      onSelectLocal(localPlugins.value[0])
      console.log(localPlugins.value, selectedPlugin)
    }
    // 获取插件商店数据
    await loadPluginStore()
    if (tabValue.value === 'store' && pluginStore.value && pluginStore.value.length > 0) {
      onSelectStore(pluginStore.value[0])
      console.log(pluginStore.value, selectedPlugin)
    }
  } catch (e) {
    await error('插件数据加载失败' + e)
  }
}
