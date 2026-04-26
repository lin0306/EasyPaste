import { loadPluginManifest } from '../../../services/PluginService.ts'
import { currentLanguage, loadPluginLanguage } from '../../../services/LanguageService.ts'
import { WebviewWindow } from '@tauri-apps/api/webviewWindow'
import { emit, listen, UnlistenFn } from '@tauri-apps/api/event'
import { createWin } from '../../../services/WindowService.ts'
import { imageContextMenus, textContextMenus } from './WindowComposable.ts'
import { error, info } from '@tauri-apps/plugin-log'
import ClipboardDBService from '../../../services/ClipboardDBService.ts'
import { invoke } from '@tauri-apps/api/core'
import { copyToClipboard } from '../../../services/ClipboardService.ts'

const loadedPluginSet: Set<string> = new Set<string>()

async function initPlugins(): Promise<void> {
  const db = await ClipboardDBService.getInstance()
  const plugins: LocalPlugin[] = await db.searchPlugins(undefined, 'list', true)
  console.log('加载列表页面所有插件', plugins)
  if (plugins && plugins.length > 0) {
    for (const p of plugins) {
      await loadPlugin(p.plugin_id)
    }
  }
}

/**
 * 注册右键菜单
 * @param pluginId 插件ID
 * @param menu 菜单配置
 * @param menuArray 菜单数组引用
 */
function registerContextMenu(
  pluginId: string,
  menu: any,
  menuArray: typeof imageContextMenus
): void {
  console.log(currentLanguage.value.pages.plugins[pluginId])
  // 设置点击事件处理
  const clickFun = async (params: Map<string, any>) => {
    console.log('触发自定义右键菜单点击事件', params)

    // 设置传参
    let str = ''
    for (let [k, v] of params) {
      str += `${k}=${v}&`
    }
    console.log('插件参数', str)

    // 根据 click_fun 类型处理
    if (menu.click_fun && menu.click_fun.type === 'openWindow') {
      // 打开窗口模式
      const existWin = await WebviewWindow.getByLabel('pluginView')
      if (existWin) {
        const obj = Object.fromEntries(params)
        await emit('reload-' + menu.menuId, obj)
        await existWin.show()
        await existWin.setFocus()
      } else {
        await createWin({
          label: 'pluginView',
          title: currentLanguage.value.pages.preview.title,
          url: '/plugin-view?pluginId=' + pluginId + '&' + str,
          width: menu.click_fun.width,
          height: menu.click_fun.height,
          resizable: true,
          visible: true,
        })
      }
    } else if (menu.click_fun && menu.click_fun.type === 'invoke') {
      // 调用插件命令模式 - 插件自行处理逻辑
      try {
        const result = (await invoke('invoke_external_plugin', {
          pluginId: pluginId,
          pluginName: pluginId + '_plugin.exe',
          cmd: menu.click_fun.cmd,
          payload: JSON.stringify(Object.fromEntries(params)),
        })) as string

        console.log('插件调用结果:', result)
        const response = JSON.parse(result)
        // 插件返回的是嵌套结构: { result: '{"action": "...", ...}' }
        const actionResult = response.result ? JSON.parse(response.result) : {}

        console.log('插件 action 结果:', actionResult)

        // 如果插件返回 action = 'openWindow'，则打开窗口
        if (actionResult.action === 'openWindow') {
          const existWin = await WebviewWindow.getByLabel('pluginView')
          if (existWin) {
            const obj = Object.fromEntries(params)
            await emit('reload-' + menu.menuId, obj)
            await existWin.show()
            await existWin.setFocus()
          } else {
            await createWin({
              label: 'pluginView',
              title: actionResult.title || currentLanguage.value.pages.preview.title,
              url: '/plugin-view?pluginId=' + pluginId + '&' + str + '&' + actionResult.url,
              width: actionResult.width || 800,
              height: actionResult.height || 600,
              resizable: true,
              visible: true,
            })
          }
        } else if (actionResult.action === 'copyToClipboard') {
          // 插件要求复制到剪贴板
          await copyToClipboard({ content: actionResult.text, type: 'text' } as ClipboardItem)
          // 可以在这里添加提示
          console.debug('已复制到剪贴板:', actionResult.text)
        }
        // 其他情况插件自行处理，不打开窗口
      } catch (e) {
        console.error('插件调用失败:', e)
        error('插件调用失败: ' + e)
      }
    }
  }

  // 添加到对应菜单数组
  menuArray.value.push({
    pluginId: pluginId,
    labelCode: menu.labelCode,
    label: menu.menuId,
    params: menu.click_fun?.params || [],
    onClick: clickFun,
  })
}

/**
 * 加载插件
 * @param pluginId 插件ID
 */
async function loadPlugin(pluginId: string): Promise<void> {
  if (loadedPluginSet.has(pluginId)) {
    console.log('插件已加载，不再重复加载', pluginId)
    return;
  }
  console.log('加载插件', pluginId)

  const manifestJson = await loadPluginManifest(pluginId)
  console.log('加载' + pluginId, manifestJson)
  const features = manifestJson.features
  if (features) {
    for (let feature of features) {
      if (feature.page && feature.page === 'list') {
        if (feature.type && feature.type === 'contextMenu') {
          // 图片右键菜单
          if (feature.location === 'image') {
            if (feature.menus && feature.menus.length > 0) {
              for (let menu of feature.menus) {
                console.log('加载 ' + pluginId + ' 图片右键菜单', menu)
                registerContextMenu(pluginId, menu, imageContextMenus)
              }
            }
          }
          // 文本右键菜单
          if (feature.location === 'text') {
            if (feature.menus && feature.menus.length > 0) {
              for (let menu of feature.menus) {
                console.log('加载 ' + pluginId + ' 文本右键菜单', menu)
                registerContextMenu(pluginId, menu, textContextMenus)
              }
            }
          }
        }
      }
    }
  }
  loadedPluginSet.add(pluginId)
}

/**
 * 移除插件
 * @param pluginId 插件ID
 */
async function removePlugin(pluginId: string): Promise<void> {
  if (!loadedPluginSet.has(pluginId)) {
    console.log('插件已移除，不再重复移除', pluginId)
    return
  }
  const manifestJson = await loadPluginManifest(pluginId)
  console.log('加载' + pluginId, manifestJson)
  const features = manifestJson.features
  if (features) {
    for (let feature of features) {
      if (feature.page && feature.page === 'list') {
        if (feature.type && feature.type === 'contextMenu') {
          // 移除图片右键菜单
          if (feature.location === 'image') {
            if (feature.menus && feature.menus.length > 0) {
              for (let menu of feature.menus) {
                console.log('删除 ' + pluginId + ' 图片右键菜单', menu)
                if (menu.click_fun) {
                  imageContextMenus.value = imageContextMenus.value.filter(
                    item => item.label !== menu.menuId
                  )
                }
              }
            }
          }
          // 移除文本右键菜单
          if (feature.location === 'text') {
            if (feature.menus && feature.menus.length > 0) {
              for (let menu of feature.menus) {
                console.log('删除 ' + pluginId + ' 文本右键菜单', menu)
                if (menu.click_fun) {
                  textContextMenus.value = textContextMenus.value.filter(
                    item => item.label !== menu.menuId
                  )
                }
              }
            }
          }
        }
      }
    }
  }
  loadedPluginSet.delete(pluginId)
}

/**
 * 初始化插件安装监听器
 */
let installPluginListener: any = null

function initInstallPluginListener(): Promise<UnlistenFn> {
  return listen('install-plugin', async (event: any) => {
    console.log('安装插件', event)
    const pluginId = event.payload.pluginId
    await loadPlugin(pluginId)
    // 后端载入插件的语言
    await invoke('load_plugin_locales', { pluginId: pluginId })
    // 前端获取插件的语言
    await loadPluginLanguage()
  })
}

/**
 * 初始化插件卸载监听器
 */
let uninstallPluginListener: any = null

function initUninstallPluginListener(): Promise<UnlistenFn> {
  return listen('uninstall-plugin', async (event: any) => {
    console.log('卸载插件', event)
    const pluginId = event.payload.pluginId
    await removePlugin(pluginId)
  })
}

let togglePluginEnableListener: any = null
function initTogglePluginEnableListener(): Promise<UnlistenFn> {
  return listen('toggle-plugin-enable', async (event: any) => {
    console.log('卸载插件', event)
    const pluginId = event.payload.pluginId
    const enable = event.payload.enable
    if (enable) {
      await loadPlugin(pluginId)
    } else {
      await removePlugin(pluginId)
    }
  })
}

export const initializePlugins = async (): Promise<void> => {
  try {
    await initPlugins()
    // 添加插件安装事件监听
    installPluginListener = await initInstallPluginListener()
    // 添加插件卸载事件监听
    uninstallPluginListener = await initUninstallPluginListener()
    // 添加插件启用禁用事件监听
    togglePluginEnableListener = await initTogglePluginEnableListener()
    info('插件加载完成')
  } catch (e) {
    error('插件加载失败')
  }
}

export const destroyPlugins = async (): Promise<void> => {
  // 移除插件安装事件监听
  await installPluginListener?.()
  // 移除插件卸载事件监听
  await uninstallPluginListener?.()
  // 移除插件启用禁用事件监听
  await togglePluginEnableListener?.()
}
