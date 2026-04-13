import { reactive, ref } from 'vue'
import { loadPluginManifest } from '../../../services/PluginService.ts'
import { dirname, join } from '@tauri-apps/api/path'
import { exists, mkdir, writeFile } from '@tauri-apps/plugin-fs'
import { deleteFolder } from '../../../utils/FileUtil.ts'
import { fetch } from '@tauri-apps/plugin-http'
import { isMac } from '../../../data/SystemParams.ts'
import ClipboardDBService from '../../../services/ClipboardDBService.ts'
import { MessageApiInjection } from 'naive-ui/es/message/src/MessageProvider'
import { BlobReader, BlobWriter, ZipReader } from '@zip.js/zip.js'
import { error } from '@tauri-apps/plugin-log'
import { emit } from '@tauri-apps/api/event'
import { currentLanguage, loadPluginLanguage } from '../../../services/LanguageService.ts'
import { getPluginPath } from '../../../store/Settings.ts'
import { invoke } from '@tauri-apps/api/core'

// 插件状态
type loadingState = 'downloading' | 'unzipping' | 'loading' | 'uninstalling' | 'updating'

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
 * 安装插件文件
 * @param plugin 插件信息
 * @param pluginFolderPath 插件安装目录
 * @param message 消息框架
 */
async function installPlugin(
  plugin: StorePlugin,
  pluginFolderPath: string,
  message: MessageApiInjection
) {
  try {
    // 下载并解压文件
    await installPluginFile(plugin.downloadUrl, pluginFolderPath, plugin.id)
    // 保存插件信息
    await savePluginInfo(plugin)
    return true
  } catch (error) {
    console.error('下载失败:', error)
    message.error(currentLanguage.value.pages.pluginStore.installFailedHint)
    deleteFolder(pluginFolderPath)
    loadingMap.value.delete(plugin.id)
    return false
  }
}

/**
 * 安装插件
 */
export const install = async (pluginId: string, message: MessageApiInjection): Promise<void> => {
  const plugin = pluginStore.value.find(p => p.id === pluginId)
  if (plugin) {
    try {
      console.log('开始安装插件', plugin)
      loadingMap.value.set(plugin.id, 'downloading')
      const configDir = await getPluginPath()
      const pluginFolderPath = await join(configDir, plugin.id)
      // 删除已安装的插件
      if (await exists(pluginFolderPath)) {
        await deleteFolder(pluginFolderPath)
      }
      console.log('插件安装目录', pluginFolderPath)
      console.log('开始下载文件', plugin, plugin.downloadUrl)
      if (plugin && plugin.downloadUrl) {
        if (!(await installPlugin(plugin, pluginFolderPath, message))) {
          console.log('安装失败', pluginId)
          return
        }
        console.log('安装成功', pluginId)
        loadingMap.value.set(plugin.id, 'loading')
        // 重新加载插件
        await loadLocalPlugins()
        // 后端载入插件的语言
        await invoke('load_plugin_locales', { pluginId: pluginId })
        // 前端获取插件的语言
        await loadPluginLanguage()

        // 如果当前选中的插件是刚安装的，更新选中状态以触发设置按钮检查
        if (selectedPlugin.pluginId === pluginId) {
          const newlyInstalled = localPlugins.value.find(l => l.plugin_id === pluginId)
          if (newlyInstalled) {
            onSelectLocal(newlyInstalled)
          }
        }
        // 保存插件配置
        message.success(
          currentLanguage.value.pages.pluginStore.installSuccessHint.replace(
            '${pluginName}',
            plugin.name
          )
        )
        await emit('install-plugin', { pluginId: pluginId })
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
 * 安装插件文件
 * @param url 插件下载地址
 * @param pluginFolderPath 插件安装目录
 */
async function installPluginFile(
  url: string,
  pluginFolderPath: string,
  pluginId: string
): Promise<void> {
  // 文件下载
  const response = await fetch(url, { method: 'GET' })
  console.log('文件下载完成，开始解压文件', response)
  loadingMap.value.set(pluginId, 'unzipping')
  await mkdir(pluginFolderPath, { recursive: true })
  console.log('文件保存目录', pluginFolderPath)
  // 文件解压
  const blob = await response.blob()
  const reader = new ZipReader(new BlobReader(blob))
  const entries = await reader.getEntries()
  let processedFiles = 0

  for (const entry of entries) {
    // 移除根目录前缀
    let relativePath = entry.filename
    console.log('原始文件名', entry.filename)
    console.log('解压文件', entry.filename, '保存路径', relativePath)
    if (!relativePath || relativePath === '/' || relativePath === '\\') {
      console.log('是根目录，跳过', entry.filename)
      continue
    }

    if (!entry.directory) {
      console.log('是文件，生成文件')
      const data = await entry.getData(new BlobWriter())
      const targetPath = await join(pluginFolderPath, relativePath)
      console.log('保存文件', targetPath)

      const parentDir = await dirname(targetPath)
      await mkdir(parentDir, { recursive: true })

      await writeFile(targetPath, new Uint8Array(await data.arrayBuffer()))
      console.log('文件保存完成', targetPath)
    } else if (relativePath !== '') {
      console.log('是目录，生成目录')
      // 处理子目录
      const targetPath = await join(pluginFolderPath, relativePath)
      await mkdir(targetPath, { recursive: true })
      console.log('目录保存完成', targetPath)
    }

    processedFiles++
  }

  await reader.close()
  console.log('文件解压完成，已处理文件数', processedFiles)
}

/**
 * 保存插件信息
 * @param value 插件信息
 */
async function savePluginInfo(value: StorePlugin): Promise<void> {
  const useLocationSet = await getUseLocations(value.id)
  // 保存插件信息
  const db = await ClipboardDBService.getInstance()
  await db.addPlugin({
    id: 0,
    enable: 1,
    plugin_id: value.id,
    plugin_name: value.name,
    version: value.version,
    use_location: JSON.stringify([...useLocationSet]),
    platform: value.platform,
    url: value.downloadUrl,
    description: value.description,
    install_time: Date.now(),
  })
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
        await emit('uninstall-plugin', { pluginId: plugin.plugin_id })
        // 删除插件数据
        const db = await ClipboardDBService.getInstance()
        await db.removePlugin(plugin.id)
        // 删除插件文件夹
        const configDir = await getPluginPath()
        const pluginFolderPath = await join(configDir, `${plugin.plugin_id}`)
        await deleteFolder(pluginFolderPath)
        // 重新加载插件
        await loadLocalPlugins()
        message.success(currentLanguage.value.pages.pluginStore.uninstallSuccessHint)
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
  if (pluginId) {
    loadingMap.value.set(pluginId, 'updating')
    const storePlugin = pluginStore.value.find(l => l.id === pluginId)
    const localPlugin = localPlugins.value.find(l => l.plugin_id === pluginId)
    if (storePlugin) {
      if (localPlugin) {
        if (storePlugin && storePlugin.downloadUrl) {
          try {
            console.log('开始更新插件', storePlugin, storePlugin.downloadUrl)
            loadingMap.value.set(storePlugin.id, 'uninstalling')
            const configDir = await getPluginPath()
            const pluginFolderPath = await join(configDir, selectedPlugin.pluginId)
            console.log('插件安装目录', pluginFolderPath)
            // 卸载插件
            try {
              await emit('uninstall-plugin', { pluginId: pluginId })
              await deleteFolder(pluginFolderPath)
            } catch (e) {
              error('插件卸载失败' + e)
              console.log('插件卸载失败', e)
              message.error(currentLanguage.value.pages.pluginStore.updateUnInstallFailedHint)
              return
            }
            loadingMap.value.set(storePlugin.id, 'downloading')
            // 安装插件
            try {
              console.log('开始下载文件', storePlugin, storePlugin.downloadUrl)
              // 下载并解压文件
              await installPluginFile(storePlugin.downloadUrl, pluginFolderPath, storePlugin.id)
              // 保存插件信息
              await updatePluginInfo(localPlugin.id, storePlugin)
              console.log('安装成功', pluginId)

              loadingMap.value.set(storePlugin.id, 'loading')
              // 后端载入插件的语言
              await invoke('load_plugin_locales', { pluginId: pluginId })
              // 前端获取插件的语言
              await loadPluginLanguage()
              // 重新加载插件
              await loadLocalPlugins()
              await emit('install-plugin', { pluginId: pluginId })
              // 保存插件配置
              message.success(
                currentLanguage.value.pages.pluginStore.updateSuccessHint.replace(
                  '${pluginName}',
                  storePlugin.name
                )
              )
            } catch (e) {
              error('插件安装失败' + e)
              await deleteFolder(pluginFolderPath)
              const db = await ClipboardDBService.getInstance()
              await db.removePlugin(localPlugin.id)
              message.error(currentLanguage.value.pages.pluginStore.updateFailedHint)
              await loadLocalPlugins()
            }
          } finally {
            loadingMap.value.delete(storePlugin.id)
          }
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
    loadingMap.value.delete(pluginId)
  } else {
    message.error(currentLanguage.value.pages.pluginStore.notSelectPluginHint)
  }
}

/**
 * 获取插件可加载页面
 * @param pluginId 插件id
 */
async function getUseLocations(pluginId: string) {
  const manifest = await loadPluginManifest(pluginId)
  if (!manifest) {
    throw new Error('未找到插件配置文件')
  }
  console.log('加载' + pluginId, manifest)
  const useLocationSet = new Set<string>()
  const features = manifest.features
  if (features) {
    for (let feature of features) {
      if (feature.page && feature.page !== 'plugins') {
        useLocationSet.add(feature.page)
      }
    }
  }
  console.log('插件可加载页面', useLocationSet, JSON.stringify([...useLocationSet]))

  return useLocationSet
}

/**
 * 保存插件信息
 * @param id 插件id
 * @param value 插件信息
 */
async function updatePluginInfo(id: number, value: StorePlugin): Promise<void> {
  if (id) {
    const useLocationSet = await getUseLocations(value.id)
    // 保存插件信息
    const db = await ClipboardDBService.getInstance()
    await db.updatePlugin({
      id: id,
      plugin_id: value.id,
      plugin_name: value.name,
      version: value.version,
      use_location: JSON.stringify(useLocationSet),
      platform: value.platform,
      url: value.downloadUrl,
      description: value.description,
      enable: 1,
      install_time: 0,
    })
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
      await db.togglePluginEnable(plugin.id, enable ? 1 : 0)
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
      'https://gh.llkk.cc/https://raw.githubusercontent.com/lin0306/EasyPaste-Plugins/master/plugins-list.json',
      { method: 'GET' }
    )
    const data: StorePlugin[] = await response.json()
    // 暂时保留后续测试可用
    // data.push(
    //     {
    //         id: "ocr1",
    //         name: "OCR1",
    //         version: "0.0.1",
    //         description: "Windows OCR插件，暂时只支持纯简体中文的图片进行OCR，如果图片中存在除中文以外的其他字符，可能会出现识别错误的情况，这一版的OCR插件识别速度快，但是图片解析能力弱",
    //         platform: "General",
    //         downloadUrl: "https://gh-proxy.com/https://github.com/lin0306/EasyPaste-Plugins/releases/download/ocr-0.0.1/ocr.zip",
    //         size: 265955
    //     }
    // )
    // data.push(
    //     {
    //         id: "ocr2",
    //         name: "OCR2",
    //         version: "0.0.1",
    //         description: "Windows OCR插件，暂时只支持纯简体中文的图片进行OCR，如果图片中存在除中文以外的其他字符，可能会出现识别错误的情况，这一版的OCR插件识别速度快，但是图片解析能力弱",
    //         platform: "Mac",
    //         downloadUrl: "https://gh-proxy.com/https://github.com/lin0306/EasyPaste-Plugins/releases/download/ocr-0.0.1/ocr.zip",
    //         size: 265955
    //     }
    // )
    console.log('插件商店数据', data)
    // 筛选出当前操作系统的插件
    if (isMac) {
      pluginStore.value = data.filter(p => p.platform === 'Mac' || p.platform === 'General')
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
async function loadLocalPlugins(): Promise<void> {
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
