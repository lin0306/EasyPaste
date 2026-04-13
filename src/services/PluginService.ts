import { readTextFile } from '@tauri-apps/plugin-fs'
import { path } from '@tauri-apps/api'
import { getPluginPath } from '../store/Settings.ts'
import { listen } from '@tauri-apps/api/event'
import { getPluginThemeOverrides } from './ThemeService.ts'

/**
 * 获取插件JS路径
 * @param pluginId 插件id
 */
export async function getPluginJSPath(pluginId: string): Promise<string> {
  const pluginsDir = await getPluginPath()
  return await path.join(pluginsDir, pluginId, pluginId + '.bundle.js')
}

/**
 * 获取插件CSS路径
 * @param pluginId 插件id
 */
export async function getPluginCSSPath(pluginId: string): Promise<string> {
  const pluginsDir = await getPluginPath()
  return await path.join(pluginsDir, pluginId, pluginId + '.css')
}

/**
 * 加载插件的manifest.json
 * @param pluginId 插件id
 */
export async function loadPluginManifest(pluginId: string): Promise<any> {
  const pluginsDir = await getPluginPath()
  const manifestPath = await path.join(pluginsDir, pluginId, 'manifest.json')
  console.log('manifestPath: ', manifestPath)
  const manifest = await readTextFile(manifestPath)
  return JSON.parse(manifest)
}

/**
 * 创建插件应用（用于插件入口文件）
 * 自动处理主题切换，插件无需手动监听
 * @param container 容器元素
 * @param component 插件组件
 * @returns 应用实例和清理函数
 */
export function createPluginVueApp(
  container: HTMLElement,
  component: any
): { app: any; cleanup: () => void } {
  console.log('[createPluginVueApp] 创建插件应用')
  // @ts-ignore
  const { createApp, h, ref, onMounted, onUnmounted } = window.Vue
  // @ts-ignore
  const { NConfigProvider, NMessageProvider } = window.naive
  // 从 window 获取 Font Awesome Icon 组件
  // @ts-ignore
  const FontAwesomeIcon = window.FontAwesomeIcon

  // 创建响应式的主题覆盖配置
  const themeOverrides = ref(getPluginThemeOverrides())
  let changedThemeListener: any | null = null

  // 主题切换监听
  const handleThemeChange = () => {
    console.log('[createPluginVueApp] 收到主题变化事件')
    themeOverrides.value = getPluginThemeOverrides()
    console.log('[createPluginVueApp] 主题已更新:', themeOverrides.value)
  }

  // 创建包装组件
  const WrapperComponent = {
    setup() {
      onMounted(() => {
        console.log('[createPluginVueApp] 开始监听主题变化事件')
        changedThemeListener = listen('easy-paste-theme-changed', handleThemeChange)
      })

      onUnmounted(() => {
        changedThemeListener?.()
        console.log('[createPluginVueApp] 停止监听主题变化事件')
      })

      return () =>
        h(NConfigProvider, { themeOverrides: themeOverrides.value }, () =>
          h(NMessageProvider, null, () => h(component))
        )
    },
  }

  // 检查是否已有 Vue 应用，有则先卸载
  const existingApp = (container as any).__vue_app__
  if (existingApp) {
    console.log('发现已有应用，先卸载')
    existingApp.unmount()
    delete (container as any).__vue_app__
  }

  const app = createApp(WrapperComponent)

  // 全局注册 Font Awesome Icon 组件供插件使用
  if (FontAwesomeIcon) {
    console.log('[createPluginVueApp] 注册 Font Awesome Icon 组件')
    app.component('font-awesome-icon', FontAwesomeIcon)
  }

  app.mount(container)

  // 保存应用实例到 DOM
  ;(container as any).__vue_app__ = app

  console.log('插件应用挂载成功:', container.id || 'unknown')

  return {
    app,
    cleanup: () => {
      changedThemeListener?.()
      app.unmount()
      delete (container as any).__vue_app__
    },
  }
}
