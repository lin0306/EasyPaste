<template>
  <div v-if="showSearchBox" ref="searchBoxRef" key="search" class="search-container">
    <!-- 搜索框 -->
    <n-input
      id="search-input"
      key="search-input"
      v-model:value="searchFilters.content"
      :placeholder="currentLanguage.pages.list.searchHint"
      clearable
      size="small"
      @input="loadClipboardItems(true)"
    >
      <template #prefix>
        <n-icon size="16">
          <font-awesome-icon :icon="faMagnifyingGlass" />
        </n-icon>
      </template>
    </n-input>
    <!-- 类型选择 -->
    <n-space class="type-list">
      <n-tag :color="hasSelect('text')" round size="small" @click="selectType('text')">
        {{ currentLanguage.pages.list.typeText }}
      </n-tag>
      <n-tag :color="hasSelect('code')" round size="small" @click="selectType('code')">
        {{ currentLanguage.pages.list.typeCode }}
      </n-tag>
      <n-tag :color="hasSelect('file')" round size="small" @click="selectType('file')">
        {{ currentLanguage.pages.list.typeFile }}
      </n-tag>
      <n-tag :color="hasSelect('image')" round size="small" @click="selectType('image')">
        {{ currentLanguage.pages.list.typeImage }}
      </n-tag>
      <n-tag :color="hasSelect('link')" round size="small" @click="selectType('link')">
        {{ currentLanguage.pages.list.typeLink }}
      </n-tag>
    </n-space>
  </div>
</template>

<script lang="ts" setup>
import { NIcon, NInput } from 'naive-ui'
import {
  loadClipboardItems,
  searchFilters,
  showSearchBox,
} from '../composables/ClipboardDataComposable.ts'
import { animationEffect } from '../../../components/effect/composables/AnimationComposable.ts'
import { currentLanguage } from '../../../services/LanguageService.ts'
import { themeColors } from '../../../services/ThemeService.ts'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { ref, watch } from 'vue'
import { gsap } from 'gsap'

const searchBoxRef = ref<HTMLElement | null>(null)

// 监听 showSearchBox 变化，执行 GSAP 动画
watch(
  () => showSearchBox.value,
  (newValue) => {
    if (!animationEffect.enabled || !searchBoxRef.value) {
      return
    }

    const duration = animationEffect.duration / 1000 || 0.3

    if (newValue) {
      // 显示时执行淡入+下滑动画
      gsap.fromTo(searchBoxRef.value,
        {
          opacity: 0,
          y: -75,
        },
        {
          opacity: 1,
          y: 0,
          duration: duration,
          ease: 'power2.out',
        }
      )
    } else {
      // 隐藏时执行淡出+上滑动画
      gsap.to(searchBoxRef.value, {
        opacity: 0,
        y: -75,
        duration: duration,
        ease: 'power2.in',
      })
    }
  },
  { flush: 'post' }
)

const hasSelect = (type: string) => {
  if (searchFilters.selectTypes) {
    if (searchFilters.selectTypes.includes(type)) {
      return {
        color: themeColors.value.universal.primary,
        textColor: themeColors.value.universal.background,
      }
    }
  }
}

/**
 * 根据数据类型类型筛选数据
 * @param type 数据类型
 */
const selectType = async (type: string) => {
  if (searchFilters.selectTypes) {
    if (searchFilters.selectTypes.includes(type)) {
      searchFilters.selectTypes = searchFilters.selectTypes.filter(item => item !== type)
    } else {
      searchFilters.selectTypes.push(type)
    }
    loadClipboardItems(true)
  }
}
</script>

<style scoped>
.search-container {
  z-index: 100;
  height: 55px;
  width: 95%;
  margin-bottom: 4px;
  background-color: var(--theme-universal-secondary);
  border-radius: 0 0 8px 8px;
  box-shadow: 0 2px 8px var(--theme-universal-border);
  padding: 8px;
  overflow: hidden;
  top: 55px;
  position: fixed;
  will-change: transform, opacity;
}

.search-container .n-input {
  border-radius: 4px;
  border: 1px solid var(--theme-universal-border);
  background-color: var(--theme-universal-background);
}

.search-container .n-input__input {
  color: var(--theme-universal-textHint);
}

.type-list {
  width: 100%;
  height: 20px;
  padding: 2px;
  margin-top: 3px;
  gap: 6px !important;
}
</style>
