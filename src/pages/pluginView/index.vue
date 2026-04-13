<script setup lang="ts">
import { currentLanguage, initializePluginLanguage } from '../../services/LanguageService.ts'
import TitleBar from '../../components/TitleBar.vue'
import { onMounted, ref } from 'vue'
import {
  getPluginCSSPath,
  getPluginJSPath,
  loadPluginManifest,
} from '../../services/PluginService.ts'
import { convertFileSrc } from '@tauri-apps/api/core'
import { exists } from '@tauri-apps/plugin-fs'

const pluginId = ref('')
const pageId = ref('')
const viewPageTitleCode = ref('')

/**
 * 加载插件样式
 */
const loadPluginCss = async (): Promise<void> => {
  // 加载css样式
  const cssPluginPath = await getPluginCSSPath(pluginId.value)
  console.log('cssPluginPath:', cssPluginPath)
  if (await exists(cssPluginPath)) {
    console.log('加载' + pluginId.value + '样式')
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.type = 'text/css'
    link.setAttribute('data-plugin', pluginId.value)
    // @ts-ignore
    link.source = 'third-plugin'
    const cssPathUrl = convertFileSrc(cssPluginPath)
    console.log('cssPathUrl: ', cssPathUrl)
    link.href = cssPathUrl
    document.head.appendChild(link)
  }
}

/**
 * 加载插件脚本
 */
const loadPluginJs = async (): Promise<void> => {
  // 加载js脚本
  const jsPluginPath = await getPluginJSPath(pluginId.value)
  console.log('jsPluginPath:', jsPluginPath)
  if (await exists(jsPluginPath)) {
    console.log('加载' + pluginId.value + '脚本')
    const script = document.createElement('script')
    script.type = 'module'
    // @ts-ignore
    script.source = 'third-plugin'
    const jsPathUrl = convertFileSrc(jsPluginPath)
    console.log('jsPathUrl: ', jsPathUrl)
    script.src = jsPathUrl
    document.head.appendChild(script)
  }
}

/**
 * 清空插件依赖
 */
const clearPlugin = (): void => {
  // 删除所有三方引入
  const scripts = document.querySelectorAll('script')
  scripts.forEach(script => {
    // @ts-ignore
    if (script.source && script.source.includes('third-plugin')) {
      script.remove()
    }
  })
}

/**
 * 加载插件页面
 */
const loadPluginUI = async (): Promise<void> => {
  clearPlugin()
  await loadPluginCss()
  await loadPluginJs()

  // 加载容器组件
  const element = document.getElementById('plugin-container')
  if (element) {
    // 清空插件页面
    element.innerHTML = ''
    // 加载插件页面
    const pluginElement = document.createElement(`${pluginId.value}-plugin-ui`)
    element.appendChild(pluginElement)
  }
}

const loadManifest = async (): Promise<void> => {
  const manifestJson = await loadPluginManifest(pluginId.value)
  console.log('加载' + pluginId.value, manifestJson)
  const features = manifestJson.features
  if (features) {
    for (let feature of features) {
      if (feature.page && feature.page === 'view-page') {
        viewPageTitleCode.value = feature.labelCode
        console.log('viewPageTitleCode:', viewPageTitleCode.value)
      }
    }
  }
}

onMounted(async () => {
  const searchParams = new URLSearchParams(window.location.search)
  pluginId.value = <string>searchParams.get('pluginId')
  pageId.value = <string>searchParams.get('pageId')

  await initializePluginLanguage()

  await loadManifest()

  // 加载插件页面
  await loadPluginUI()
})
</script>

<template>
  <TitleBar
    :title="currentLanguage.pages.plugins?.[pluginId]?.[viewPageTitleCode] || currentLanguage.pages.pluginView.title"
    :show-close-btn="true"
    :dev-tool="`pluginView`"
  />
  <div id="plugin-container"></div>
</template>

<style scoped>
#plugin-container {
  width: 100%;
  height: 100%;
}
</style>
