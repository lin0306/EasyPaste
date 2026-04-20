<template>
  <transition :css="animationEffect.enabled" appear name="search">
    <div v-if="searchBoxState.visible" key="search" class="search-container">
      <!-- 搜索框 -->
      <n-input
        id="search-input"
        key="search-input"
        v-model:value="searchBoxState.text"
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
        <n-tag
          :color="
            searchBoxState.selectTypes.includes('text')
              ? {
                  color: themeColors.universal.primary,
                  textColor: themeColors.universal.background,
                }
              : {}
          "
          round
          size="small"
          @click="selectType('text')"
        >
          {{ currentLanguage.pages.list.typeText }}
        </n-tag>
        <n-tag
          :color="
            searchBoxState.selectTypes.includes('code')
              ? {
                  color: themeColors.universal.primary,
                  textColor: themeColors.universal.background,
                }
              : {}
          "
          round
          size="small"
          @click="selectType('code')"
        >
          {{ currentLanguage.pages.list.typeCode }}
        </n-tag>
        <n-tag
          :color="
            searchBoxState.selectTypes.includes('file')
              ? {
                  color: themeColors.universal.primary,
                  textColor: themeColors.universal.background,
                }
              : {}
          "
          round
          size="small"
          @click="selectType('file')"
        >
          {{ currentLanguage.pages.list.typeFile }}
        </n-tag>
        <n-tag
          :color="
            searchBoxState.selectTypes.includes('image')
              ? {
                  color: themeColors.universal.primary,
                  textColor: themeColors.universal.background,
                }
              : {}
          "
          round
          size="small"
          @click="selectType('image')"
        >
          {{ currentLanguage.pages.list.typeImage }}
        </n-tag>
        <n-tag
          :color="
            searchBoxState.selectTypes.includes('link')
              ? {
                  color: themeColors.universal.primary,
                  textColor: themeColors.universal.background,
                }
              : {}
          "
          round
          size="small"
          @click="selectType('link')"
        >
          {{ currentLanguage.pages.list.typeLink }}
        </n-tag>
      </n-space>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { NIcon, NInput } from 'naive-ui'
import { loadClipboardItems, searchBoxState } from '../composables/ClipboardDataComposable.ts'
import { animationEffect } from '../../../components/effect/composables/AnimationComposable.ts'
import { currentLanguage } from '../../../services/LanguageService.ts'
import { themeColors } from '../../../services/ThemeService.ts'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'

/**
 * 根据数据类型类型筛选数据
 * @param type 数据类型
 */
const selectType = async (type: string) => {
  if (searchBoxState.selectTypes.includes(type)) {
    searchBoxState.selectTypes = searchBoxState.selectTypes.filter(item => item !== type)
  } else {
    searchBoxState.selectTypes.push(type)
  }
  loadClipboardItems(true)
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

.search-enter-active,
.search-leave-active {
  transition: all var(--animation-duration, 0.3s) ease;
}

.search-enter-from,
.search-leave-to {
  opacity: 0;
  transform: translateY(-75px);
}

.search-enter-to,
.search-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
