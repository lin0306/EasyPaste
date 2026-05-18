<script setup lang="ts">
import {
  editState,
  isPanelVisible,
  originTag,
  reloadListTags,
  showAddPanel,
  tagItems,
} from '../composables/TagDataComposable.ts'
import { useMessage } from 'naive-ui'
import { currentLanguage } from '../../../services/LanguageService.ts'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import ClipboardDBService from '../../../services/ClipboardDBService.ts'
import { error } from '@tauri-apps/plugin-log'
import { listen, UnlistenFn } from '@tauri-apps/api/event'
import { animationEffect } from '../../../components/effect/composables/AnimationComposable.ts'
import { faTrashCan } from '@fortawesome/free-regular-svg-icons'
import { faChevronLeft, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { gsap } from 'gsap'

const message = useMessage()

// 搜索关键词
const searchText = ref('')

// 清理数据弹窗
const showClearDataModal = ref(false)

// 标签列表容器引用
const tagListContainerRef = ref<HTMLElement | undefined>(undefined)

/**
 * 加载标签列表
 */
const loadTags = async (): Promise<void> => {
  try {
    const db = await ClipboardDBService.getInstance()
    const tags = await db.getAllTags()
    if (tags) {
      tagItems.value = tags
    }
  } catch (e) {
    console.error('加载标签失败', e)
    error('标签页面加载失败：' + e)
    message.error(currentLanguage.value.pages.tags.loadFailedMsg)
  }
}

/**
 * 删除标签
 * @param id 标签 id
 * @param index 标签索引
 */
const deleteTag = async (id: number, index: number): Promise<void> => {
  try {
    console.log('删除标签', tagItems.value, id, index)
    const db = await ClipboardDBService.getInstance()
    await db.deleteTag(id)
    message.success(currentLanguage.value.pages.tags.deleteSuccessMsg)
    if (editState.tagId === id) {
      editState.tagId = null
      isPanelVisible.value = false
    }

    // 执行删除动画
    if (animationEffect.enabled && tagListContainerRef.value) {
      const tagElements = tagListContainerRef.value.querySelectorAll('.tag-item')
      const targetElement = tagElements[index] as HTMLElement
      if (targetElement) {
        const duration = animationEffect.duration / 1000 || 0.3
        await new Promise<void>(resolve => {
          gsap.to(targetElement, {
            opacity: 0,
            x: -100,
            duration: duration,
            ease: 'power2.in',
            onComplete: () => {
              tagItems.value.splice(index, 1)
              resolve()
            },
          })
        })
      } else {
        tagItems.value.splice(index, 1)
      }
    } else {
      tagItems.value.splice(index, 1)
    }

    console.log(tagItems.value)
    // 刷新剪贴板的标签列表
    await reloadListTags()
  } catch (error) {
    console.error('删除标签失败', error)
    message.error(currentLanguage.value.pages.tags.deleteFailedMsg)
  }
}

/**
 * 清空标签
 */
const clearTags = async (): Promise<void> => {
  try {
    console.log('清空标签')
    const db = await ClipboardDBService.getInstance()
    await db.clearAllTags()
    message.success(currentLanguage.value.pages.tags.deleteSuccessMsg)
    editState.tagId = null
    isPanelVisible.value = false

    // 执行清空动画
    if (animationEffect.enabled && tagListContainerRef.value) {
      const duration = animationEffect.duration / 1000 || 0.3
      await new Promise<void>(resolve => {
        if (tagListContainerRef.value) {
          gsap.to(tagListContainerRef.value.querySelectorAll('.tag-item'), {
            opacity: 0,
            x: -50,
            stagger: 0.05,
            duration: duration,
            ease: 'power2.in',
            onComplete: () => {
              tagItems.value = []
              showClearDataModal.value = false
              resolve()
            },
          })
        }
      })
    } else {
      tagItems.value = []
      showClearDataModal.value = false
    }

    // 刷新剪贴板的标签列表
    await reloadListTags()
  } catch (error) {
    console.error('清空标签失败', error)
    message.error(currentLanguage.value.pages.tags.deleteFailedMsg)
  }
}

/**
 * 过滤标签
 */
const filterTags = (): void => {
  if (!searchText.value) {
    loadTags()
    return
  }

  const keyword = searchText.value.toLowerCase()
  const filteredTags = tagItems.value.filter(tag => tag.name.toLowerCase().includes(keyword))

  // 执行过滤动画
  if (animationEffect.enabled && tagListContainerRef.value) {
    const duration = animationEffect.duration / 1000 || 0.3
    const allElements = tagListContainerRef.value.querySelectorAll('.tag-item')

    // 为隐藏的元素执行离开动画
    allElements.forEach((el, index) => {
      const tag = tagItems.value[index]
      if (!filteredTags.includes(tag)) {
        gsap.to(el, {
          opacity: 0,
          height: 0,
          marginBottom: 0,
          duration: duration,
          ease: 'power2.in',
        })
      }
    })

    // 延迟更新数据，等待动画完成
    setTimeout(() => {
      tagItems.value = filteredTags
    }, duration * 1000)
  } else {
    tagItems.value = filteredTags
  }
}

/**
 * 选择标签
 * @param tag
 * @param index
 */
const selectTag = (tag: TagItem, index: number): void => {
  editState.tagId = tag.id
  editState.index = index
  editState.isEdit = true
  editState.currentTagId = tag.id
  editState.tagName = tag.name
  editState.tagColor = tag.color
  originTag.value = { ...tag }

  isPanelVisible.value = true
}

/**
 * 监听标签绑定的数据变化
 */
let updateBindQuantityListener: any = null

const initUpdateBindQuantityListener = (): Promise<UnlistenFn> => {
  return listen('update-bind-quantity', () => {
    loadTags()
  })
}

// 监听标签列表变化，执行 GSAP 动画
watch(
  () => tagItems.value,
  (newItems, oldItems) => {
    if (!animationEffect.enabled || !tagListContainerRef.value) {
      return
    }

    const duration = animationEffect.duration / 1000 || 0.3

    // 如果是新增标签（列表变长）
    if (oldItems && newItems.length > oldItems.length) {
      const newTagIds = newItems.map(tag => tag.id)
      const oldTagIds = oldItems.map(tag => tag.id)
      const addedIds = newTagIds.filter(id => !oldTagIds.includes(id))

      // 为新添加的标签执行进入动画
      addedIds.forEach((tagId, idx) => {
        const element = tagListContainerRef.value?.querySelector(
          `[data-tag-id="${tagId}"]`
        ) as HTMLElement
        if (element) {
          gsap.fromTo(
            element,
            {
              opacity: 0,
              x: 100,
            },
            {
              opacity: 1,
              x: 0,
              duration: duration,
              delay: idx * 0.05,
              ease: 'power2.out',
            }
          )
        }
      })
    }
  },
  { flush: 'post', deep: true }
)

// 组件挂载时加载标签列表
onMounted(() => {
  loadTags()
  updateBindQuantityListener = initUpdateBindQuantityListener()
})

onUnmounted(() => {
  if (updateBindQuantityListener) {
    updateBindQuantityListener()
  }
})
</script>

<template>
  <!-- 左侧标签列表 -->
  <div class="tag-list-panel" :class="{ 'tag-list-panel-narrow': isPanelVisible }">
    <!-- 搜索框 -->
    <div class="tag-list-header">
      <n-input
        v-model:value="searchText"
        :placeholder="currentLanguage.pages.list.searchHint"
        clearable
        @input="filterTags"
      >
        <template #prefix>
          <!-- 搜索 -->
          <n-icon size="16">
            <font-awesome-icon :icon="faMagnifyingGlass" />
          </n-icon>
        </template>
      </n-input>
    </div>

    <!-- 标签列表 -->
    <div class="tag-list-container" ref="tagListContainerRef">
      <n-empty v-if="tagItems.length === 0" />
      <div v-else class="tag-list">
        <div
          v-for="(tag, index) in tagItems"
          :key="tag.id"
          :data-tag-id="tag.id"
          class="tag-item"
          :class="{ 'tag-item-active': editState.tagId === tag.id }"
          @click="selectTag(tag, index)"
          :style="{ borderLeft: `4px solid ${tag.color}` }"
        >
          <div class="tag-item-content">
            <div class="tag-color-preview" :style="{ backgroundColor: tag.color }"></div>
            <div class="tag-item-name">{{ tag.name }}</div>
            <div v-if="tag.stats && tag.stats > 0" class="tag-item-stats">
              {{ currentLanguage.pages.tags.bindDataHint }}{{ tag.stats }}
            </div>
          </div>
          <div class="tag-item-actions" @click.stop>
            <div class="tag-delete-button" @click="deleteTag(tag.id, index)">
              <font-awesome-icon :icon="faTrashCan" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 切换按钮 -->
    <div class="toggle-panel-button" @click="showAddPanel">
      <div class="toggle-icon-container" :class="{ unfold: isPanelVisible }">
        <font-awesome-icon :icon="faChevronLeft" />
      </div>
    </div>

    <!-- 列表底部展示 -->
    <div class="footer">
      <div class="footer-left">
        <!-- 清理数据 -->
        <font-awesome-icon
          :icon="['fas', 'clear']"
          class="clear-icon"
          @click="showClearDataModal = true"
        />
      </div>
      <div class="footer-right">
        <!-- 数据统计 -->
        <div class="stats-text">
          {{ currentLanguage.pages.tags.totalData.replace('{total}', tagItems.length.toString()) }}
        </div>
      </div>
    </div>
  </div>

  <!-- 清除全部数据二次确认弹窗 -->
  <n-modal
    v-model:show="showClearDataModal"
    :title="currentLanguage.pages.tags.clearDataModalTitle"
    preset="dialog"
  >
    <p>{{ currentLanguage.pages.tags.clearDataModalContent }}</p>
    <template #action>
      <n-button @click="showClearDataModal = false">
        {{ currentLanguage.pages.tags.clearDataModalCancelBtn }}
      </n-button>
      <n-button type="primary" @click="clearTags">
        {{ currentLanguage.pages.tags.clearDataModalConfirmBtn }}
      </n-button>
    </template>
  </n-modal>
</template>

<style scoped>
/* 左侧标签列表面板 */
.tag-list-panel {
  width: 100%;
  height: 100%;
  border-right: 1px solid var(--theme-universal-border);
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 2;
  /* 确保在右侧面板上层 */
}

/* 当右侧面板可见时，调整左侧面板位置 */
.tag-list-panel-narrow {
  width: 50% !important;
  /* 减小宽度，为右侧面板留出空间 */
}

.tag-list-header {
  padding: 16px 16px 8px;
  height: 35px;
  border-bottom: 1px solid var(--theme-universal-border);
}

.tag-list-header :deep(.n-input) {
  border-radius: 4px;
  border: 1px solid var(--theme-universal-border);
  background-color: var(--theme-universal-background);
}

.tag-list-header :deep(.n-input__input) {
  color: var(--theme-universal-textHint);
}

.tag-list-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.tag-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 8px;
}

.tag-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--theme-customCard-background);
  border-radius: 4px;
  box-shadow: 0 2px 8px var(--theme-universal-border);
  cursor: pointer;
  will-change: transform, opacity;
}

.tag-item:hover {
  background-color: var(--theme-customCard-backgroundHover) !important;
}

.tag-item-active {
  background-color: var(--theme-customCard-backgroundHover) !important;
  border-left-width: 6px !important;
}

.tag-item-content {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.tag-color-preview {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  box-shadow: 0 1px 3px var(--theme-universal-border);
  flex-shrink: 0;
}

.tag-item-name {
  font-size: 14px;
  font-weight: 500;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tag-item-stats {
  font-size: 12px;
  margin-right: 10px;
  color: var(--theme-universal-textHint);
}

.tag-item-actions {
  display: flex;
  align-items: center;
}

.tag-delete-button {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0.7;
  transition: all var(--animation-duration, 0.3s);
}

.tag-delete-button:hover {
  opacity: 1;
  transform: scale(1.1);
}

/* 切换按钮样式 */
.toggle-panel-button {
  position: absolute;
  top: calc(100% - 50px);
  right: 0;
  transform: translateY(-50%);
  width: 25px;
  height: 30px;
  background-color: var(--theme-universal-secondary);
  border-radius: 15px 0 0 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: -2px 0 8px var(--theme-universal-border);
  cursor: pointer;
  z-index: 3;
  opacity: 0.7;
}

.toggle-panel-button:hover {
  opacity: 1;
}

.toggle-icon-container {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.unfold {
  opacity: 1 !important;
  transform: rotate(180deg);
}

/*底部样式*/
.footer {
  z-index: 300;
  width: calc(100% - 14px);
  height: 16px;
  position: absolute;
  bottom: 0;
  font-size: 11px;
  padding: 4px 7px;
  color: var(--theme-universal-textHint);
  background-color: var(--theme-universal-background);
  display: flex;
  justify-content: space-between;
  border-top: 1px solid var(--theme-universal-border);
  border-radius: 6px;
  box-shadow: 0 -1px 5px var(--theme-universal-border);
}

.clear-icon {
  width: 15px;
  height: 15px;
  opacity: 0.5;
  cursor: pointer;
}

.clear-icon:hover {
  opacity: 0.8;
}
</style>
