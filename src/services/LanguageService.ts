import { listen } from '@tauri-apps/api/event'
import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'

export const languages: LanguageConfig[] = []

/**
 * 当前使用的语言配置
 */
export const currentLanguage = ref<LanguageConfig>({
  id: '',
  locale: '',
  pages: {
    settings: {},
    list: {},
    tags: {},
    about: {},
    update: {},
    tray: {},
    preview: {},
    pluginStore: {},
    plugins: {},
  },
} as LanguageConfig)

let updateAutoGoToLatestDataListener: any = null

/**
 * 加载语言
 */
async function loadLanguage() {
  // 获取当前语言的 UI 语言
  currentLanguage.value.locale = await invoke<string>('get_ui_locale')
  // 获取页面语言
  const window = getCurrentWindow()
  const label = window.label
  const pageLocaleStr = await invoke<string>('get_page_locale', { page: label })
  currentLanguage.value.pages[label] = JSON.parse(pageLocaleStr)
}

/**
 * 初始化语言
 */
export async function initializeLanguages() {
  console.log('初始化语言配置...')
  // 加载语言包
  await loadLanguage()

  // 添加语言变更事件监听
  updateAutoGoToLatestDataListener = await listen<string>('language-changed', async event => {
    // 确保不重复应用相同语言
    if (event.payload !== currentLanguage.value.id) {
      await loadLanguage()
    }
  })
}

/**
 * 销毁语言
 */
export function destroyLanguages() {
  updateAutoGoToLatestDataListener?.()
}
