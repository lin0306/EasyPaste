<script setup lang="ts">
import { NConfigProvider, NMessageProvider } from 'naive-ui'
import { computed, onMounted, onUnmounted } from 'vue'
import { error, info } from '@tauri-apps/plugin-log'
import { destroyLanguages, initializeLanguages } from './services/LanguageService.ts'
import { getPluginThemeOverrides, setupThemeListener } from './services/ThemeService.ts'
import {
  destroyAnimationEffect,
  initializeAnimationEffect,
} from './components/composables/AnimationComposable.ts'
// 代码高亮引入
import hljs from 'highlight.js/lib/core'
import { dateLocale, locale } from './utils/LanguageUtil.ts'

// 屏蔽鼠标右键菜单
document.oncontextmenu = function () {
  return false
}

/**
 * 定义全局组件主题色
 */
const theme = computed(() => getPluginThemeOverrides())

/**
 * 忽略浏览器默认的搜索快捷键
 */
async function handleKeyDown(event: KeyboardEvent): Promise<void> {
  // 忽略浏览器默认的搜索快捷键
  if (
    event.key.toLowerCase() === 'f' &&
    (event.ctrlKey || event.metaKey) &&
    !event.altKey &&
    !event.shiftKey
  ) {
    event.preventDefault()
    event.stopPropagation()
  }
  // 忽略浏览器f5刷新快捷键
  if (
    event.key.toLowerCase() === 'f5' &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey &&
    !event.shiftKey
  ) {
    event.preventDefault()
    event.stopPropagation()
  }
  // 检测 Ctrl + R 或 Cmd + R（macOS）
  if (
    ((event.ctrlKey && event.key.toLowerCase() === 'r') ||
      (event.metaKey && event.key.toLowerCase() === 'r')) &&
    !event.altKey &&
    !event.shiftKey
  ) {
    event.preventDefault()
    event.stopPropagation()
  }
  // 检测 Ctrl + Shift + R 或 Cmd + Shift + R（macOS）
  if (
    ((event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'r') ||
      (event.metaKey && event.shiftKey && event.key.toLowerCase() === 'r')) &&
    !event.altKey
  ) {
    event.preventDefault()
    event.stopPropagation()
  }
}

onBeforeMount(() => {
  initializeLanguages().catch(e => {
    error('语言初始化失败:' + e)
  })
})

// 应用启动时初始化数据库和剪贴板监听
onMounted(async () => {
  try {
    info('应用启动中...')
    // 初始化动画效果配置
    await initializeAnimationEffect()
    // 设置主题监听器
    setupThemeListener().catch(e => {
      error('主题监听器初始化失败:' + e)
    })
    info('应用初始化完成')
  } catch (er) {
    error('应用初始化失败:' + er)
  }
  // 增加键盘点击事件监听
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  // 销毁动画效果配置
  destroyAnimationEffect()
  // 销毁语言配置
  destroyLanguages()
  // 移除键盘点击时间监听
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <n-config-provider
    :theme-overrides="theme"
    :locale="locale"
    :date-locale="dateLocale"
    :hljs="hljs"
  >
    <n-message-provider>
      <router-view />
    </n-message-provider>
  </n-config-provider>
</template>

<style>
/* 全局样式 */
body {
  margin: 0;
  padding: 0;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: var(--theme-universal-background);
  color: var(--theme-universal-text);
  transition:
    background-color 0.3s,
    color 0.3s;
  overflow-y: hidden;
  -moz-user-select: none; /* Firefox私有属性 */
  -webkit-user-select: none; /* WebKit内核私有属性 */
  -ms-user-select: none; /* IE私有属性(IE10及以后) */
  -khtml-user-select: none; /* KHTML内核私有属性 */
  -o-user-select: none; /* Opera私有属性 */
  user-select: none; /* CSS3属性 */
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-tap-highlight-color: transparent;
  touch-action: none;
}

/*fix:折叠面板第一条没有垂直居中*/
.n-collapse .n-collapse-item:first-child {
  margin-top: 5px;
}

.n-collapse .n-collapse-item .n-collapse-item__content-wrapper .n-collapse-item__content-inner {
  padding-top: 0;
}
</style>
