<script setup lang="ts">
import { selectedKey } from './composables/SettingsDataComposable.ts'
import GeneralSettings from './components/GeneralSettings.vue'
import ThemeSettings from './components/ThemeSettings.vue'
import UpdateSettings from './components/UpdateSettings.vue'
import StorageSettings from './components/StorageSettings.vue'
import ShortcutSettings from './components/ShortcutSettings.vue'
import SettingsMenu from './components/SettingsMenu.vue'
import TitleBar from '../../components/TitleBar.vue'
import { computed, ref, watch } from 'vue'
import TagSettings from './components/TagSettings.vue'
import { animationEffect } from '../../components/effect/composables/AnimationComposable.ts'
import { currentLanguage } from '../../services/LanguageService.ts'
import MainWindowSettings from './components/MainWindowSettings.vue'
import { gsap } from 'gsap'

// 页面组件map
const componentMap: Record<string, any> = {
  general: GeneralSettings,
  mw: MainWindowSettings,
  themes: ThemeSettings,
  updater: UpdateSettings,
  storage: StorageSettings,
  shortcut: ShortcutSettings,
  tags: TagSettings,
}

const menuOptions = ['general', 'mw', 'tags', 'themes', 'updater', 'storage', 'shortcut']

// 根据 selectedKey 返回对应的组件
const currentComponent = computed(() => {
  return componentMap[selectedKey.value]
})

// GSAP 过渡相关
const contentWrapperRef = ref<HTMLElement | null>(null)

// 监听组件变化，执行 GSAP 过渡动画
watch(
  () => selectedKey.value,
  async (newKey, oldKey) => {
    if (!animationEffect.enabled || !contentWrapperRef.value) {
      return
    }

    // 获取动画时长
    const duration = animationEffect.duration / 1000 || 0.3

    const oldIndex = menuOptions.indexOf(oldKey)
    const newIndex = menuOptions.indexOf(newKey)

    // 向下切换（新索引 > 旧索引）：内容向上滑出，从下方滑入
    // 向上切换（新索引 < 旧索引）：内容向下滑出，从上方滑入
    const isDownward = newIndex > oldIndex

    // 实现上下推动的动画效果
    const wrapper = contentWrapperRef.value

    // 先重置位置
    gsap.set(wrapper, { y: 0, opacity: 1 })

    // 创建时间线
    const tl = gsap.timeline()
    const yIndex = 600
    // 当前内容向上滑出并淡出
    tl.to(wrapper, {
      y: isDownward ? -yIndex : yIndex,
      opacity: 0,
      duration: duration,
      ease: 'power2.in',
    })

    // 立即将内容移回原位但保持透明
    tl.set(wrapper, {
      y: isDownward ? yIndex : -yIndex,
      opacity: 0,
    })

    // 新内容从下方滑入并淡入
    tl.to(wrapper, {
      y: 0,
      opacity: 1,
      duration: duration,
      ease: 'power2.out',
    })
  },
  { flush: 'post' }
)
</script>

<template>
  <div class="settings-container">
    <titleBar :title="currentLanguage.pages.settings.title" :showCloseBtn="true" />
    <div class="settings-content">
      <!-- 左侧菜单 -->
      <SettingsMenu />
      <!-- 右侧内容 -->
      <div class="settings-form" ref="contentWrapperRef" :key="selectedKey">
        <transition name="slide-up" mode="out-in">
          <component :is="currentComponent" />
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.settings-content {
  display: flex;
  overflow: hidden;
  height: 100vh;
}

.settings-form {
  width: 75%;
  padding: 20px;
  overflow-y: auto;
  position: relative;
}

/* GSAP 过渡动画样式 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: none; /* 禁用 CSS 过渡，完全由 GSAP 控制 */
}

/*以下为子组件通用样式*/

:deep(.settings-section) {
  margin-bottom: 20px;
  overflow-y: auto;
}

:deep(.settings-section h2) {
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 500;
}

:deep(.form-item) {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 2px;
  justify-content: space-between;
}

:deep(.label) {
  margin-right: 16px;
  display: flex;
  align-items: center;
  gap: 5px;
}

:deep(.input-group) {
  width: 60%;
}
:deep(.select) {
  width: 60%;
}

:deep(.input-number) {
  width: 60%;
}

:deep(.line) {
  margin-bottom: 16px;
  padding: 0 2px;
}

:deep(.main-item) {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

:deep(.hint) {
  display: flex;
  font-size: 11px;
  opacity: 0.5;
  align-items: center;
  justify-content: flex-start;
  flex-direction: row;
  color: var(--theme-universal-text);
}

:deep(.hint-icon) {
  width: 2%;
  margin-right: 4px;
}

:deep(.hint-text) {
  max-width: calc(98% - 4px);
}

:deep(.hint-text-btn) {
  cursor: pointer;
}

:deep(.input-item) {
  padding: 0 2px;
  margin-bottom: 16px;
}

:deep(.n-divider--title-position-left) {
  margin: 10px 0 !important;
}

:deep(.refresh-icon) {
  width: 15px;
  height: 15px;
  opacity: 0.5;
}

:deep(.refresh-icon:hover) {
  opacity: 0.8;
}

:deep(.save-btn) {
  opacity: 0.5;
  cursor: pointer;
}

:deep(.save-btn:hover) {
  opacity: 0.8;
}
</style>
