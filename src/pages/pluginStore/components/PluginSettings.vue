<template>
  <n-modal
    :show="visible"
    :title="currentLanguage.pages.plugins[selectedPlugin.plugin_id]?.['settingsTitle'] || title"
    preset="card"
    style="width: 600px; max-width: 90vh"
    :mask-closable="false"
    :to="'body'"
    @update:show="v => $emit('update:visible', v)"
    @close="handleClose"
    :z-index="1000"
    :auto-focus="false"
  >
    <div class="plugin-settings-content">
      <div v-if="loading" class="loading-container">
        <n-spin size="large" />
      </div>
      <div v-else-if="error" class="error-container">
        <n-alert type="error" :title="currentLanguage.pages.pluginStore.settings.loadError">
          {{ error }}
        </n-alert>
      </div>
      <!-- 使用 v-if 控制容器渲染，确保每次打开都重新创建 DOM -->
      <div v-if="!loading && !error && visible" :id="containerId" class="settings-container"></div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from 'vue'
import { NAlert, NModal, NSpin, useMessage } from 'naive-ui'
import { convertFileSrc } from '@tauri-apps/api/core'
import { getPluginCSSPath, getPluginJSPath } from '../../../services/PluginService.ts'
import { currentLanguage } from '../../../services/LanguageService.ts'
import { selectedPlugin } from '../composables/PluginComponsables.ts'

const props = defineProps<{
  visible: boolean
  pluginId: string
  title: string
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const message = useMessage()
const loading = ref(false)
const error = ref('')
const containerId = ref(`plugin-settings-container-${Date.now()}`)

// 清理函数：销毁 Vue 实例并移除资源
function cleanupPlugin(pluginId: string) {
  // 1. 销毁容器中的 Vue 实例
  const oldContainer =
    document.getElementById('plugin-settings-container') ||
    document.querySelector('[id^="plugin-settings-container-"]')
  if (oldContainer) {
    const app = (oldContainer as any).__vue_app__
    if (app && typeof app.unmount === 'function') {
      app.unmount()
    }
    // 清空 DOM
    oldContainer.innerHTML = ''
  }

  // 2. 移除旧的脚本和样式（强制下次重新加载执行）
  document.querySelectorAll(`[data-plugin="${pluginId}"]`).forEach(el => {
    console.log('移除旧资源:', el)
    el.remove()
  })

  // 3. 清理全局样式（如果有）
  const oldStyle = document.getElementById('ocr-plugin-styles')
  if (oldStyle) {
    oldStyle.remove()
  }
}

// 加载插件设置组件
async function loadPluginSettings(pluginId: string) {
  if (!pluginId) return

  loading.value = true
  error.value = ''

  try {
    // 先清理旧的
    cleanupPlugin(pluginId)

    // 等待 DOM 更新
    await nextTick()

    // 加载 CSS
    const cssPath = await getPluginCSSPath(pluginId)
    const cssLink = document.createElement('link')
    cssLink.rel = 'stylesheet'
    cssLink.type = 'text/css'
    cssLink.setAttribute('data-plugin', pluginId)
    cssLink.setAttribute('source', 'third-plugin')
    cssLink.href = convertFileSrc(cssPath)
    document.head.appendChild(cssLink)

    // 加载 JS（模块脚本）
    const jsPath = await getPluginJSPath(pluginId)
    const script = document.createElement('script')
    script.type = 'module'
    script.setAttribute('data-plugin', pluginId)
    script.setAttribute('source', 'third-plugin')
    // 添加时间戳避免缓存
    script.src = convertFileSrc(jsPath) + '?t=' + Date.now()

    // 等待脚本加载完成
    await new Promise<void>((resolve, reject) => {
      script.onload = () => {
        console.log('插件脚本加载完成:', pluginId)
        resolve()
      }
      script.onerror = e => {
        console.error('插件脚本加载失败:', e)
        reject(new Error('Script load failed'))
      }
      document.head.appendChild(script)
    })

    // 再等待一下确保 Vue 应用已挂载
    await nextTick()
  } catch (e) {
    console.error('加载插件设置失败:', e)
    error.value = currentLanguage.value.pages.pluginStore.settings.loadFailed
    message.error(currentLanguage.value.pages.pluginStore.settings.loadFailed)
  } finally {
    loading.value = false
  }
}

// 关闭处理
function handleClose() {
  emit('update:visible', false)
  // 延迟清理，确保关闭动画完成
  setTimeout(() => {
    if (props.pluginId) {
      // cleanupPlugin(props.pluginId)
    }
  }, 1000)
}

// 监听插件设置弹窗显示
watch(
  () => props.visible,
  visible => {
    if (visible && props.pluginId) {
      // 生成新的容器 ID，确保 DOM 重新创建
      containerId.value = `plugin-settings-container-${Date.now()}`
      loadPluginSettings(props.pluginId)
    }
  },
  { immediate: false }
)

// 组件卸载时清理
onUnmounted(() => {
  if (props.pluginId) {
    cleanupPlugin(props.pluginId)
  }
})
</script>

<style scoped>
:deep(.n-modal-container) {
  z-index: 1000 !important;
}
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.error-container {
  padding: 20px;
}

.settings-container {
  max-height: 400px;
  overflow-y: auto;
}

.plugin-settings-content {
  /* 不设置 overflow，避免裁剪下拉菜单 */
}
</style>
