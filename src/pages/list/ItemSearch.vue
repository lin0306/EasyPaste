<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { NButton, NIcon, NInput, NSpace, NTag } from 'naive-ui'
import { currentLanguage } from '../../services/LanguageService.ts'
import { themeColors } from '../../services/ThemeService.ts'
import TitleBar from '../../components/TitleBar.vue'
import { animationEffect } from '../../components/effect/composables/AnimationComposable.ts'
import {
  faCode,
  faFile,
  faFileLines,
  faFilter,
  faImage,
  faLink,
  faMagnifyingGlass,
  faTimes,
} from '@fortawesome/free-solid-svg-icons'
import { emit } from '@tauri-apps/api/event'
import { getCurrentWindow } from '@tauri-apps/api/window'

// 搜索状态
const searchText = ref('')
const selectTypes = ref<string[]>([])

// 可用的类型选项
const typeOptions = computed(() => [
  { key: 'text', label: currentLanguage.value.pages.itemSearch.typeText, icon: faFileLines },
  { key: 'code', label: currentLanguage.value.pages.itemSearch.typeCode, icon: faCode },
  { key: 'file', label: currentLanguage.value.pages.itemSearch.typeFile, icon: faFile },
  { key: 'image', label: currentLanguage.value.pages.itemSearch.typeImage, icon: faImage },
  { key: 'link', label: currentLanguage.value.pages.itemSearch.typeLink, icon: faLink },
])

/**
 * 切换类型选择
 */
const toggleType = (type: string) => {
  if (selectTypes.value.includes(type)) {
    selectTypes.value = selectTypes.value.filter(item => item !== type)
  } else {
    selectTypes.value.push(type)
  }
}

/**
 * 清空搜索内容
 */
const clearSearch = () => {
  searchText.value = ''
  selectTypes.value = []
}

/**
 * 执行搜索（关闭当前窗口并通知主窗口）
 */
const executeSearch = async () => {
  // 通过事件通知主窗口更新搜索条件
  await emit('search-update', {
    text: searchText.value,
    types: selectTypes.value,
  })
}

/**
 * 监听ESC键关闭窗口
 */
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    handleClose()
  }
}

/**
 * 关闭窗口
 */
const handleClose = async () => {
  await getCurrentWindow().close()
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
  // 自动聚焦到搜索框
  setTimeout(() => {
    const input = document.querySelector('#search-input input') as HTMLInputElement
    if (input) {
      input.focus()
    }
  }, 100)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div class="search-page-container">
    <TitleBar :title="currentLanguage.pages.itemSearch.title" showCloseBtn @close="handleClose" />

    <transition :css="animationEffect.enabled" appear name="search-content">
      <div class="search-content">
        <!-- 搜索输入区域 -->
        <div class="custom-card search-input-card">
          <n-input
            id="search-input"
            v-model:value="searchText"
            :placeholder="currentLanguage.pages.itemSearch.searchHint"
            clearable
            size="large"
            round
          >
            <template #prefix>
              <n-icon size="18" :color="themeColors.universal.textHint">
                <font-awesome-icon :icon="faMagnifyingGlass" />
              </n-icon>
            </template>
          </n-input>
        </div>

        <!-- 类型筛选区域 -->
        <div class="custom-card filter-card">
          <div class="filter-header">
            <n-icon size="16" :color="themeColors.universal.primary">
              <font-awesome-icon :icon="faFilter" />
            </n-icon>
            <span class="filter-title">{{ currentLanguage.pages.itemSearch.filterType }}</span>
          </div>

          <n-space class="type-tags" wrap :size="[8, 8]">
            <n-tag
              v-for="type in typeOptions"
              :key="type.key"
              :color="
                selectTypes.includes(type.key)
                  ? {
                      color: themeColors.universal.primary,
                      textColor: themeColors.universal.background,
                    }
                  : {
                      color: themeColors.universal.secondary,
                      textColor: themeColors.universal.text,
                    }
              "
              round
              size="medium"
              class="type-tag"
              @click="toggleType(type.key)"
            >
              <template #icon>
                <n-icon size="14">
                  <font-awesome-icon :icon="type.icon" />
                </n-icon>
              </template>
              {{ type.label }}
            </n-tag>
          </n-space>
        </div>

        <!-- 已选条件展示 -->
        <transition name="fade">
          <div v-if="searchText || selectTypes.length > 0" class="custom-card selected-filters">
            <div class="filter-summary">
              <span class="summary-label">
                {{ currentLanguage.pages.itemSearch.selectedFilters }}
              </span>

              <n-space wrap :size="[6, 6]" class="tags-container">
                <n-tag
                  v-if="searchText"
                  size="small"
                  closable
                  @close="searchText = ''"
                  class="keyword-tag"
                >
                  <span class="tag-text">
                    {{ currentLanguage.pages.itemSearch.keywordLabel }}{{ searchText }}
                  </span>
                </n-tag>
                <n-tag
                  v-for="typeKey in selectTypes"
                  :key="typeKey"
                  size="small"
                  closable
                  @close="toggleType(typeKey)"
                >
                  {{ typeOptions.find(t => t.key === typeKey)?.label }}
                </n-tag>
              </n-space>
            </div>
          </div>
        </transition>
        <!-- 占位元素，防止内容被固定按钮遮挡 -->
        <div class="button-spacer"></div>
      </div>
    </transition>

    <!-- 固定在底部的操作按钮区域 -->
    <div class="action-buttons-fixed">
      <n-button size="large" :bordered="false" @click="clearSearch">
        <template #icon>
          <n-icon>
            <font-awesome-icon :icon="faTimes" />
          </n-icon>
        </template>
        {{ currentLanguage.pages.itemSearch.clearSearchBtn }}
      </n-button>

      <n-button type="primary" size="large" :bordered="false" @click="executeSearch">
        <template #icon>
          <n-icon>
            <font-awesome-icon :icon="faMagnifyingGlass" />
          </n-icon>
        </template>
        {{ currentLanguage.pages.itemSearch.searchBtn }}
      </n-button>
    </div>
  </div>
</template>

<style scoped>
.search-page-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.search-content {
  flex: 1;
  padding: 24px 24px 65px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

/* 自定义卡片基础样式 */
.custom-card {
  background-color: var(--theme-universal-secondary);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

/* 搜索输入卡片 */
.search-input-card {
  padding: 16px;
}

.search-input-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.search-input-card :deep(.n-input) {
  background-color: var(--theme-universal-background);
  border: 2px solid var(--theme-universal-border);
  transition: all 0.3s ease;
}

.search-input-card :deep(.n-input:focus-within) {
  border-color: var(--theme-universal-primary);
  box-shadow: 0 0 0 3px rgba(var(--theme-universal-primary-rgb), 0.1);
}

.search-input-card :deep(.n-input__input) {
  color: var(--theme-universal-text);
  font-size: 16px;
}

/* 筛选卡片 */
.filter-card {
  padding: 16px;
}

.filter-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.filter-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--theme-universal-text);
}

.type-tags {
  display: flex;
  flex-wrap: wrap;
}

.type-tag {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 8px 16px;
  font-weight: 500;
}

.type-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.type-tag:active {
  transform: translateY(0);
}

/* 已选条件 */
.selected-filters {
  padding: 12px 16px;
}

.filter-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  min-width: 0;
}

.summary-label {
  font-size: 13px;
  color: var(--theme-universal-textHint);
  font-weight: 500;
  flex-shrink: 0;
}

.tags-container {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.keyword-tag {
  max-width: 200px;
}

.tag-text {
  display: inline-block;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}

/* 占位元素 */
.button-spacer {
  height: 1px;
  flex-shrink: 0;
}

/* 固定在底部的操作按钮 */
.action-buttons-fixed {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  background: linear-gradient(
    to top,
    var(--theme-universal-background) 0%,
    var(--theme-universal-background) 70%,
    transparent 100%
  );
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
  z-index: 100;
}

.action-buttons-fixed .n-button {
  flex: 1;
  height: 48px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.action-buttons-fixed .n-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-buttons-fixed .n-button:active {
  transform: translateY(0);
}

/* 动画效果 */
.search-content-enter-active,
.search-content-leave-active {
  transition: all var(--animation-duration, 0.3s) cubic-bezier(0.4, 0, 0.2, 1);
}

.search-content-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.search-content-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
