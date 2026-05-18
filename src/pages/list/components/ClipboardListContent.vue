<template>
  <div
    key="clipboard-container"
    ref="listContainerRef"
    :class="{ 'clipboard-container-search': showSearchBox }"
    class="clipboard-container"
  >
    <n-infinite-scroll
      v-if="clipboardItems && clipboardItems.length > 0"
      :distance="9"
      @load="loadMoreItems"
    >
      <!-- 内容列表 -->
      <div ref="itemsWrapperRef">
        <ClipboardItem
          v-for="(item, index) in clipboardItems"
          :key="item.id"
          :ref="el => setItemRef(el, item.id)"
          :index="index"
          :item="item"
          @custom-event="handleChildContextMenu"
        />
      </div>
      <!-- 最底部内容展示 -->
      <div v-if="scrollState.isLoading" class="loading-indicator">
        <n-spin :description="currentLanguage.pages.list.dataLoading" />
      </div>
      <div v-if="!scrollState.hasMore" class="no-more-indicator">
        {{ currentLanguage.pages.list.allLoaded }}
      </div>
    </n-infinite-scroll>
    <!-- 无数据展示 -->
    <n-empty v-else :description="currentLanguage.pages.list.empty" class="empty" />
  </div>
  <!-- 右键菜单 -->
  <context-menu
    ref="contextMenuRef"
    :file-path="contextMenuState.filePath"
    :index="contextMenuState.index"
    :item="contextMenuState.item"
    :menu-type="contextMenuState.menuType"
  />
</template>

<script lang="ts" setup>
import { NEmpty, NInfiniteScroll, NSpin } from 'naive-ui'
import ClipboardItem from './ClipboardItem.vue'
import {
  clipboardItems,
  loadMoreItems,
  scrollState,
  showSearchBox,
} from '../composables/ClipboardDataComposable.ts'
import { animationEffect } from '../../../components/effect/composables/AnimationComposable.ts'
import { reactive, ref, watch } from 'vue'
import ContextMenu from './ContextMenu.vue'
import { currentLanguage } from '../../../services/LanguageService.ts'
import { gsap } from 'gsap'

/**
 * 右键菜单信息
 */
const contextMenuState = reactive({
  menuType: '',
  item: {} as ClipboardItem,
  filePath: '',
  index: 0,
})

/**
 * 右键菜单信息
 */
const contextMenuRef = ref()

// 列表容器引用
const listContainerRef = ref<HTMLElement | null>(null)
const itemsWrapperRef = ref<HTMLElement | null>(null)
const itemRefsMap = new Map<number, any>()

// 设置子组件引用
const setItemRef = (el: any, itemId: number) => {
  if (el) {
    itemRefsMap.set(itemId, el)
  }
}

// 监听剪贴板项目变化，执行 GSAP 动画
watch(
  () => clipboardItems.value,
  (newItems, oldItems) => {
    if (!animationEffect.enabled || !itemsWrapperRef.value) {
      return
    }

    const duration = animationEffect.duration / 1000 || 0.3

    // 如果是新增项目（oldItems 为空或新列表更长）
    if (!oldItems || newItems.length > oldItems.length) {
      // 找出新增的项目
      const newItemIds = newItems.map(item => item.id)
      const oldItemIds = oldItems ? oldItems.map(item => item.id) : []
      const addedIds = newItemIds.filter(id => !oldItemIds.includes(id))

      // 为新增的项目执行进入动画
      addedIds.forEach((itemId, index) => {
        const element = itemRefsMap.get(itemId)?.$el
        if (element) {
          gsap.fromTo(element,
            {
              opacity: 0,
              x: 100,
            },
            {
              opacity: 1,
              x: 0,
              duration: duration,
              delay: index * 0.05,
              ease: 'power2.out',
            }
          )
        }
      })
    }

    // 如果是删除项目（新列表更短）
    if (oldItems && newItems.length < oldItems.length) {
      const newItemIds = newItems.map(item => item.id)
      const oldItemIds = oldItems.map(item => item.id)
      const removedIds = oldItemIds.filter(id => !newItemIds.includes(id))

      // 为删除的项目执行离开动画
      removedIds.forEach((itemId) => {
        const element = itemRefsMap.get(itemId)?.$el
        if (element) {
          gsap.to(element, {
            opacity: 0,
            x: -100,
            duration: duration,
            ease: 'power2.in',
            onComplete: () => {
              // 动画完成后清理引用
              itemRefsMap.delete(itemId)
            }
          })
        }
      })
    }
  },
  { flush: 'post', deep: true }
)

/**
 * 子组件调用的父组件方法
 * @param data
 */
const handleChildContextMenu = (data: any): void => {
  // 这个方法会被子组件"间接调用"
  console.log('子组件传来的数据:', data)
  contextMenuState.menuType = data.type
  contextMenuState.item = data.item
  contextMenuState.filePath = data.filePath
  contextMenuState.index = data.index
  // 显示右键菜单
  contextMenuRef.value?.handleMenuShow()
}
</script>

<style scoped>
.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80px;
}

.no-more-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
}

.empty {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.clipboard-container {
  height: calc(100vh - 75px);
  /* 减去TitleBar(25px)和NavBar(30px)和Footer(20px)的高度 */
  z-index: 1;
  position: relative;
  overflow-y: auto;
  will-change: height;
  transition:
    height var(--animation-duration, 0.3s) ease,
    transform var(--animation-duration, 0.3s) ease;
}

.clipboard-container.clipboard-container-search {
  height: calc(100vh - 150px);
  transform: translateY(75px);
  /* 减去TitleBar(25px)和NavBar(30px)和Footer(20px)的高度 */
}

/**
 * 代码块行号样式
 */
:deep(.n-code__line-numbers) {
  color: var(--theme-universal-textHint);
}
</style>
