<template>
  <div class="default-layout">
    <TitleBar
      :title="titleText"
      :show-close-btn="showCloseBtn"
      :show-hide-btn="showHideBtn"
      :show-fixed-btn="showFixedBtn"
      :show-minimize-btn="showMinimizeBtn"
      :show-update-icon="showUpdateIcon"
    />
    <div class="layout-content">
      <router-view v-slot="{ Component }">
        <component :is="Component" @update-title-config="handleUpdateTitleConfig" />
      </router-view>
    </div>
  </div>
</template>

<script lang="ts" setup>
import TitleBar from '../components/TitleBar.vue'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { currentLanguage } from '@/services/LanguageService'

// 根据路由配置动态获取 TitleBar 属性
const route = useRoute()

// 动态配置（可以被子组件覆盖）
const dynamicConfig = ref<Partial<TitleBarConfig>>({})

interface TitleBarConfig {
  title?: string
  showCloseBtn?: boolean
  showHideBtn?: boolean
  showFixedBtn?: boolean
  showMinimizeBtn?: boolean
  showUpdateIcon?: boolean
}

// 处理子组件更新配置
const handleUpdateTitleConfig = (config: Partial<TitleBarConfig>) => {
  dynamicConfig.value = config
}

// 根据路由路径获取标题
const getTitleByPath = (path: string): string => {
  const pathMap: Record<string, string> = {
    list: currentLanguage.value.pages.list?.title || '剪贴板列表',
    'item-editor': currentLanguage.value.pages.itemEditor?.title || '编辑项目',
    'item-search': currentLanguage.value.pages.itemSearch?.title || '搜索',
    settings: currentLanguage.value.pages.settings?.title || '设置',
    'theme-editor': currentLanguage.value.pages.themeEditor?.title || '主题编辑器',
    tags: currentLanguage.value.pages.tags?.title || '标签管理',
    about: currentLanguage.value.pages.about?.title || '关于',
    updater: currentLanguage.value.pages.update?.title || '更新',
    preview: currentLanguage.value.pages.preview?.title || '预览',
    'plugin-view': currentLanguage.value.pages.pluginView?.title || '插件预览',
    'plugin-store': currentLanguage.value.pages.pluginStore?.title || '插件商店',
  }
  return pathMap[path] || 'EasyPaste'
}

// 合并路由配置和动态配置
const titleText = computed<string>(() => {
  // 优先使用动态配置的 title
  if (dynamicConfig.value.title) {
    return dynamicConfig.value.title
  }

  // 根据路由路径获取标题
  const path = route.path.replace('/', '')
  return getTitleByPath(path)
})

const showCloseBtn = computed<boolean>(() => {
  const dynamic = dynamicConfig.value.showCloseBtn
  const meta = route.meta.showCloseBtn as boolean | undefined
  return dynamic !== undefined ? dynamic : meta !== undefined ? meta : true
})

const showHideBtn = computed<boolean>(() => {
  const dynamic = dynamicConfig.value.showHideBtn
  const meta = route.meta.showHideBtn as boolean | undefined
  return dynamic !== undefined ? dynamic : meta !== undefined ? meta : false
})

const showFixedBtn = computed<boolean>(() => {
  const dynamic = dynamicConfig.value.showFixedBtn
  const meta = route.meta.showFixedBtn as boolean | undefined
  return dynamic !== undefined ? dynamic : meta !== undefined ? meta : false
})

const showMinimizeBtn = computed<boolean>(() => {
  const dynamic = dynamicConfig.value.showMinimizeBtn
  const meta = route.meta.showMinimizeBtn as boolean | undefined
  return dynamic !== undefined ? dynamic : meta !== undefined ? meta : false
})

const showUpdateIcon = computed<boolean>(() => {
  const dynamic = dynamicConfig.value.showUpdateIcon
  const meta = route.meta.showUpdateIcon as boolean | undefined
  return dynamic !== undefined ? dynamic : meta !== undefined ? meta : false
})
</script>

<style scoped>
.default-layout {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-content {
  flex: 1;
  overflow: hidden;
}
</style>
