import { WebviewWindow } from '@tauri-apps/api/webviewWindow'
import { WebViewWindowOptions } from '../types/Window'
import { emit } from '@tauri-apps/api/event'
import { currentLanguage, loadPageLanguage } from './LanguageService.ts'
import { invoke } from '@tauri-apps/api/core'
import { isDev } from '../data/SystemParams.ts'

// 创建窗口参数配置
export const windowConfig: WebViewWindowOptions = {
  label: '',
  title: '',
  url: '',
  width: 500,
  height: 500,
  minWidth: undefined,
  minHeight: undefined,
  maxWidth: undefined,
  maxHeight: undefined,
  x: undefined,
  y: undefined,
  center: true,
  maximized: false,
  decorations: false,
  alwaysOnTop: false,
  dragDropEnabled: false,
  visible: true,
  focus: true,
  resizable: true,
  skipTaskbar: false,
  fullscreen: false,
  contentProtected: false,
  preventOverflow: true,
  incognito: true,
  // parent: 'list', // 确保窗口始终置于列表窗口之上
  openDevTools: true,
}

/**
 * 创建新窗口
 * @param options 窗口参数
 */
export async function createWin(options: WebViewWindowOptions): Promise<void> {
  console.log('-=-=-=-=-=开始创建窗口')

  const args: WebViewWindowOptions = Object.assign({}, windowConfig, options)
  // 拆分出来 openDevTools
  const { openDevTools, ...obj } = args
  // 判断窗口是否存在
  const existWin = await WebviewWindow.getByLabel(args.label)
  if (existWin) {
    // 窗口存在，直接聚焦
    await existWin.show()
    await existWin.setFocus()
    if (isDev && openDevTools) {
      setTimeout(async () => {
        await invoke('open_dev_tool', { windowName: args.label })
      }, 200)
    }
    return
  }
  // 创建窗口对象
  const win = new WebviewWindow(args.label, obj)

  // 窗口创建完毕/失败
  await win.once('tauri://created', async () => {
    console.log('执行窗口创建')
    // 是否主窗口
    if (args.label.indexOf('list') > -1) {
      // ...
    }

    // 是否最大化
    if (args.maximized) {
      console.log('窗口默认最大化')
      await win.maximize()
    }

    if (isDev && openDevTools) {
      setTimeout(async () => {
        await invoke('open_dev_tool', { windowName: args.label })
      }, 200)
    }
  })

  await win.once('tauri://error', async error => {
    console.log('窗口创建异常', error)
  })
}

/**
 * 打开设置窗口
 */
export async function openSettingsWindow(): Promise<void> {
  await loadPageLanguage('settings')
  await createWin({
    label: 'settings',
    title: currentLanguage.value.pages.settings.title,
    url: '/settings',
    width: 650,
    height: 500,
    minWidth: 650,
    minHeight: 500,
  })
}

/**
 * 打开标签窗口
 */
export async function openTagsWindow(): Promise<void> {
  await loadPageLanguage('tags')
  await createWin({
    label: 'tags',
    title: currentLanguage.value.pages.tags.title,
    url: '/tags',
    width: 650,
    height: 500,
    minWidth: 650,
    minHeight: 500,
  })
}

/**
 * 打开关于窗口
 */
export async function openAboutWindow(): Promise<void> {
  await loadPageLanguage('about')
  await createWin({
    label: 'about',
    title: currentLanguage.value.pages.about.title,
    url: '/about',
    width: 350,
    height: 270,
    resizable: false,
  })
}

/**
 * 打开更新窗口
 */
export async function openUpdaterWindow(): Promise<void> {
  await loadPageLanguage('update')
  await createWin({
    label: 'updater',
    title: currentLanguage.value.pages.update.title,
    url: '/updater',
    width: 600,
    height: 500,
    resizable: false,
  })
}

/**
 * 文件预览
 */
export async function openPreviewWindow(filePath: string, isFolder: boolean): Promise<void> {
  const existWin = await WebviewWindow.getByLabel('preview')
  if (existWin) {
    await emit('reload-preview', { filePath: filePath, isFolder: isFolder })
  } else {
    await loadPageLanguage('preview')
    await createWin({
      label: 'preview',
      title: currentLanguage.value.pages.preview.title,
      url: '/preview?filePath=' + encodeURIComponent(filePath) + '&isFolder=' + isFolder,
      width: 600,
      height: 500,
      resizable: true,
      visible: true,
    })
  }
}

/**
 * 打开文本编辑窗口
 */
export async function openItemEditWindow(itemId: number): Promise<void> {
  const existWin = await WebviewWindow.getByLabel('itemEditor')
  if (existWin) {
    await emit('reload-editor', { itemId: itemId })
  } else {
    await loadPageLanguage('itemEditor')
    await createWin({
      label: 'itemEditor',
      title: currentLanguage.value.pages.itemEditor.title,
      url: '/itemEditor?itemId=' + itemId,
      width: 600,
      height: 500,
      resizable: true,
      visible: true,
    })
  }
}

/**
 * 打开插件商店窗口
 */
export async function openPluginStoreWindow(): Promise<void> {
  await loadPageLanguage('pluginStore')
  await createWin({
    label: 'pluginStore',
    title: currentLanguage.value.pages.pluginStore.title,
    url: '/plugin-store',
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
  })
}

/**
 * 打开主题编辑器窗口
 */
export async function openThemeEditorWindow(): Promise<void> {
  await loadPageLanguage('themeEditor')
  await createWin({
    label: 'themeEditor',
    title: currentLanguage.value.pages.themeEditor.title,
    url: '/theme-editor',
    width: 1000,
    height: 700,
    minWidth: 1000,
    minHeight: 700,
  })
}

/**
 * 打开高级搜索窗口
 */
export async function openSearchWindow(): Promise<void> {
  await loadPageLanguage('itemSearch')
  await createWin({
    label: 'itemSearch',
    title: currentLanguage.value.pages.itemSearch.title,
    url: '/item-search',
    width: 600,
    height: 600,
    minWidth: 600,
    minHeight: 600,
  })
}
