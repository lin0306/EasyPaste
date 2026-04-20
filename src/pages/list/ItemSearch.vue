<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive } from 'vue'
import {
  NButton,
  NDatePicker,
  NIcon,
  NInput,
  NInputNumber,
  NSelect,
  NSpace,
  NSwitch,
  NTag,
} from 'naive-ui'
import { currentLanguage } from '../../services/LanguageService.ts'
import { themeColors } from '../../services/ThemeService.ts'
import TitleBar from '../../components/TitleBar.vue'
import { animationEffect } from '../../components/effect/composables/AnimationComposable.ts'
import {
  faCalendarAlt,
  faCode,
  faFile,
  faFileLines,
  faFilter,
  faImage,
  faLink,
  faMagnifyingGlass,
  faSortAmountDown,
  faSortAmountUp,
  faTimes,
} from '@fortawesome/free-solid-svg-icons'
import { emit } from '@tauri-apps/api/event'
import { getCurrentWindow } from '@tauri-apps/api/window'

// 搜索状态
const searchText = ref('')
const selectTypes = ref<string[]>([])

// 高级搜索选项（使用 reactive 统一管理）
const searchFilters = reactive<SearchFilters>({
  showAdvancedOptions: false,
  excludeText: '', // 排除关键词
  minLength: null as number | null, // 最小长度
  maxLength: null as number | null, // 最大长度
  startDate: null as number | null, // 开始日期
  endDate: null as number | null, // 结束日期
  exactMatch: false, // 精确匹配
  sortValue: 'time-desc', // 排序值：time-desc, time-asc, length-desc, length-asc
})

// 从 sortValue 解析出排序字段和方向
const sortField = computed(() => searchFilters.sortValue.split('-')[0] as 'time' | 'length')
const sortOrder = computed(() => searchFilters.sortValue.split('-')[1] as 'desc' | 'asc')

// 可用的类型选项
const typeOptions = computed(() => [
  { key: 'text', label: currentLanguage.value.pages.itemSearch.typeText, icon: faFileLines },
  { key: 'code', label: currentLanguage.value.pages.itemSearch.typeCode, icon: faCode },
  { key: 'file', label: currentLanguage.value.pages.itemSearch.typeFile, icon: faFile },
  { key: 'image', label: currentLanguage.value.pages.itemSearch.typeImage, icon: faImage },
  { key: 'link', label: currentLanguage.value.pages.itemSearch.typeLink, icon: faLink },
])

// 排序选项
const sortOptions = computed(() => [
  {
    label: `${currentLanguage.value.pages.itemSearch.sortByTime} (${currentLanguage.value.pages.itemSearch.sortDesc})`,
    value: 'time-desc',
  },
  {
    label: `${currentLanguage.value.pages.itemSearch.sortByTime} (${currentLanguage.value.pages.itemSearch.sortAsc})`,
    value: 'time-asc',
  },
  {
    label: `${currentLanguage.value.pages.itemSearch.sortByLength} (${currentLanguage.value.pages.itemSearch.sortDesc})`,
    value: 'length-desc',
  },
  {
    label: `${currentLanguage.value.pages.itemSearch.sortByLength} (${currentLanguage.value.pages.itemSearch.sortAsc})`,
    value: 'length-asc',
  },
])

// 判断是否有激活的过滤器
const hasActiveFilters = computed(() => {
  return (
    searchText.value ||
    selectTypes.value.length > 0 ||
    searchFilters.excludeText ||
    searchFilters.minLength !== null ||
    searchFilters.maxLength !== null ||
    searchFilters.startDate ||
    searchFilters.endDate ||
    searchFilters.exactMatch ||
    searchFilters.sortValue !== 'time-desc'
  )
})

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
 * 清空所有搜索条件
 */
const clearSearch = async () => {
  searchText.value = ''
  selectTypes.value = []
  searchFilters.excludeText = ''
  searchFilters.minLength = null
  searchFilters.maxLength = null
  searchFilters.startDate = null
  searchFilters.endDate = null
  searchFilters.exactMatch = false
  searchFilters.sortValue = 'time-desc'

  // 发送重置搜索消息
  await searchReset()
}

/**
 * 执行搜索（关闭当前窗口并通知主窗口）
 */
const executeSearch = async () => {
  // 通过事件通知主窗口更新搜索条件
  await emit('search-update', {
    text: searchText.value,
    types: selectTypes.value,
    excludeText: searchFilters.excludeText || undefined,
    minLength: searchFilters.minLength || undefined,
    maxLength: searchFilters.maxLength || undefined,
    startDate: searchFilters.startDate || undefined,
    endDate: searchFilters.endDate || undefined,
    exactMatch: searchFilters.exactMatch,
    sortField: sortField.value,
    sortOrder: sortOrder.value,
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
 * 重置搜索
 */
async function searchReset() {
  // 发送重置搜索消息
  await emit('search-update', {
    text: '',
    types: [],
    excludeText: undefined,
    minLength: undefined,
    maxLength: undefined,
    startDate: undefined,
    endDate: undefined,
    exactMatch: false,
    sortField: 'time',
    sortOrder: 'desc',
  })
}

/**
 * 关闭窗口
 */
const handleClose = async () => {
  await searchReset()

  await getCurrentWindow().close()
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(async () => {
  await searchReset()
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div class="search-page-container">
    <TitleBar :title="currentLanguage.pages.itemSearch.title" showCloseBtn @close="handleClose" />
    <n-scrollbar style="max-height: calc(100vh)">
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
              autofocus
            >
              <template #prefix>
                <n-icon size="18" :color="themeColors.universal.textHint">
                  <font-awesome-icon :icon="faMagnifyingGlass" />
                </n-icon>
              </template>
            </n-input>

            <!-- 精确匹配开关 -->
            <div class="exact-match-toggle">
              <n-switch v-model:value="searchFilters.exactMatch" size="small" />
              <span class="toggle-label">{{ currentLanguage.pages.itemSearch.exactMatch }}</span>
            </div>
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

          <!-- 高级选项展开/收起按钮 -->
          <div
            class="advanced-toggle"
            @click="searchFilters.showAdvancedOptions = !searchFilters.showAdvancedOptions"
          >
            <span>{{ currentLanguage.pages.itemSearch.advancedOptions }}</span>
            <div class="advanced-toggle-actions">
              <n-icon :class="{ 'rotate-icon': searchFilters.showAdvancedOptions }">
                <font-awesome-icon :icon="faSortAmountDown" />
              </n-icon>
            </div>
          </div>

          <!-- 高级搜索选项 -->
          <transition name="slide-down">
            <div v-if="searchFilters.showAdvancedOptions" class="advanced-options">
              <!-- 排除关键词 -->
              <div class="custom-card advanced-item">
                <div class="advanced-item-header">
                  <n-icon size="14" :color="themeColors.universal.textHint">
                    <font-awesome-icon :icon="faTimes" />
                  </n-icon>
                  <span>{{ currentLanguage.pages.itemSearch.excludeKeywords }}</span>
                </div>
                <n-input
                  v-model:value="searchFilters.excludeText"
                  :placeholder="currentLanguage.pages.itemSearch.excludeKeywordsPlaceholder"
                  clearable
                  size="medium"
                />
              </div>

              <!-- 内容长度范围 -->
              <div class="custom-card advanced-item">
                <div class="advanced-item-header">
                  <n-icon size="14" :color="themeColors.universal.textHint">
                    <font-awesome-icon :icon="faFileLines" />
                  </n-icon>
                  <span>{{ currentLanguage.pages.itemSearch.contentLength }}</span>
                </div>
                <div class="range-inputs">
                  <n-input-number
                    v-model:value="searchFilters.minLength"
                    :placeholder="currentLanguage.pages.itemSearch.minLength"
                    :min="0"
                    :max="9999999"
                    size="medium"
                    style="flex: 1"
                  />
                  <span class="range-separator">~</span>
                  <n-input-number
                    v-model:value="searchFilters.maxLength"
                    :placeholder="currentLanguage.pages.itemSearch.maxLength"
                    :min="0"
                    :max="9999999"
                    size="medium"
                    style="flex: 1"
                  />
                </div>
              </div>

              <!-- 时间范围 -->
              <div class="custom-card advanced-item">
                <div class="advanced-item-header">
                  <n-icon size="14" :color="themeColors.universal.textHint">
                    <font-awesome-icon :icon="faCalendarAlt" />
                  </n-icon>
                  <span>{{ currentLanguage.pages.itemSearch.timeRange }}</span>
                </div>
                <div class="date-range">
                  <n-date-picker
                    v-model:value="searchFilters.startDate"
                    type="datetime"
                    :placeholder="currentLanguage.pages.itemSearch.startDate"
                    size="medium"
                    style="flex: 1"
                    clearable
                  />
                  <span class="range-separator">~</span>
                  <n-date-picker
                    v-model:value="searchFilters.endDate"
                    type="datetime"
                    :placeholder="currentLanguage.pages.itemSearch.endDate"
                    size="medium"
                    style="flex: 1"
                    clearable
                  />
                </div>
              </div>

              <!-- 排序方式 -->
              <div class="custom-card advanced-item">
                <div class="advanced-item-header">
                  <n-icon size="14" :color="themeColors.universal.textHint">
                    <font-awesome-icon :icon="faSortAmountUp" />
                  </n-icon>
                  <span>{{ currentLanguage.pages.itemSearch.sortOrder }}</span>
                </div>
                <n-select
                  v-model:value="searchFilters.sortValue"
                  :options="sortOptions"
                  size="medium"
                />
              </div>
            </div>
          </transition>

          <!-- 占位元素，防止内容被固定按钮遮挡 -->
          <div class="button-spacer"></div>
        </div>
      </transition>
    </n-scrollbar>
    <!-- 固定在底部的已选条件展示 -->
    <transition name="slide-up">
      <div v-if="hasActiveFilters" class="selected-filters-fixed">
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
                {{ currentLanguage.pages.itemSearch.keywordLabel }}: {{ searchText }}
              </span>
            </n-tag>
            <n-tag
              v-if="searchFilters.excludeText"
              size="small"
              closable
              @close="searchFilters.excludeText = ''"
              class="exclude-tag"
            >
              <span class="tag-text">
                {{ currentLanguage.pages.itemSearch.excludeLabel }}: {{ searchFilters.excludeText }}
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
            <n-tag
              v-if="searchFilters.minLength !== null || searchFilters.maxLength !== null"
              size="small"
              closable
              @close="
                () => {
                  searchFilters.minLength = null
                  searchFilters.maxLength = null
                }
              "
            >
              {{ currentLanguage.pages.itemSearch.lengthLabel }}:
              {{ searchFilters.minLength || 0 }}~{{ searchFilters.maxLength || '∞' }}
            </n-tag>
            <n-tag
              v-if="searchFilters.startDate || searchFilters.endDate"
              size="small"
              closable
              @close="
                () => {
                  searchFilters.startDate = null
                  searchFilters.endDate = null
                }
              "
            >
              {{ currentLanguage.pages.itemSearch.timeLabel }}
            </n-tag>
            <n-tag
              v-if="searchFilters.exactMatch"
              size="small"
              closable
              @close="searchFilters.exactMatch = false"
            >
              {{ currentLanguage.pages.itemSearch.exactMatch }}
            </n-tag>
            <n-tag
              v-if="searchFilters.sortValue !== 'time-desc'"
              size="small"
              closable
              @close="searchFilters.sortValue = 'time-desc'"
            >
              {{ sortOptions.find(s => s.value === searchFilters.sortValue)?.label }}
            </n-tag>
          </n-space>
        </div>
      </div>
    </transition>

    <!-- 固定在底部的操作按钮区域 -->
    <div class="action-buttons-fixed" :class="{ 'has-filters': hasActiveFilters }">
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
  padding: 24px 24px 200px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
}

/* 自定义卡片基础样式 */
.custom-card {
  background-color: var(--theme-universal-secondary);
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--theme-universal-border);
  transition: all 0.3s ease;
}

/* 搜索输入卡片 */
.search-input-card {
  padding: 16px;
  position: relative;
}

.search-input-card:hover {
  box-shadow: 0 6px 16px var(--theme-universal-border);
  transform: translateY(-2px);
}

.search-input-card :deep(.n-input) {
  background-color: var(--theme-universal-background);
  border: 2px solid var(--theme-universal-border);
  transition: all 0.3s ease;
}

.search-input-card :deep(.n-input:focus-within) {
  border-color: var(--theme-universal-primary);
  box-shadow: 0 0 0 3px rgba(var(--theme-universal-border), 0.1);
}

.search-input-card :deep(.n-input__input) {
  color: var(--theme-universal-text);
  font-size: 16px;
}

/* 精确匹配开关 */
.exact-match-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding-left: 4px;
}

.toggle-label {
  font-size: 13px;
  color: var(--theme-universal-textHint);
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

/* 高级选项展开按钮 */
.advanced-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background-color: var(--theme-universal-secondary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  color: var(--theme-universal-text);
}

.advanced-toggle:hover {
  background-color: var(--theme-universal-border);
  transform: translateY(-1px);
}

.advanced-toggle-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rotate-icon {
  transition: transform 0.3s ease;
  transform: rotate(180deg);
}

/* 高级选项容器 */
.advanced-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.advanced-item {
  padding: 14px 16px;
}

.advanced-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--theme-universal-text);
}

.range-inputs,
.date-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.range-separator {
  color: var(--theme-universal-textHint);
  font-weight: 500;
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

.keyword-tag,
.exclude-tag {
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

.exclude-tag {
  border: 1px solid var(--theme-universal-delete) !important;
  color: var(--theme-universal-delete) !important;
}

/* 占位元素 */
.button-spacer {
  height: 1px;
  flex-shrink: 0;
}

/* 固定在底部的已选条件 */
.selected-filters-fixed {
  position: fixed;
  bottom: 80px;
  left: 0;
  right: 0;
  padding: 12px 24px;
  background-color: var(--theme-universal-background);
  border-top: 1px solid var(--theme-universal-border);
  box-shadow: 0 -2px 8px var(--theme-universal-border);
  z-index: 99;
  max-height: 120px;
  overflow-y: auto;
}

.selected-filters-fixed .filter-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  min-width: 0;
}

.selected-filters-fixed .summary-label {
  font-size: 13px;
  color: var(--theme-universal-textHint);
  font-weight: 500;
  flex-shrink: 0;
}

.selected-filters-fixed .tags-container {
  flex: 1;
  min-width: 0;
  overflow: hidden;
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
  background-color: var(--theme-universal-background);
  box-shadow: 0 -4px 12px var(--theme-universal-border);
  z-index: 100;
  transition: box-shadow 0.3s ease;
}

/* 当有激活的筛选条件时，隐藏操作按钮的顶部阴影 */
.action-buttons-fixed.has-filters {
  box-shadow: none;
}

.action-buttons-fixed .n-button {
  flex: 1;
  height: 48px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px var(--theme-universal-border);
}

.action-buttons-fixed .n-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--theme-universal-border);
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

/* 向上滑出动画 */
.slide-up-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.slide-up-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.slide-up-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

.slide-down-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-20px);
  max-height: 0;
}

.slide-down-enter-to {
  opacity: 1;
  transform: translateY(0);
  max-height: 600px;
}

.slide-down-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 600px;
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}
</style>
