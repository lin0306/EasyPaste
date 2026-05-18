<template>
  <div
    :id="String(props.item.id)"
    class="clipboard-item"
    @dblclick="onCopy(props.item, message)"
    @contextmenu.prevent="onOpenContextMenu"
  >
    <div class="clipboard-card">
      <!-- 头部 -->
      <div class="card-header">
        <div class="card-header-left">
          <div class="item-type-icons">
            <font-awesome-icon
              v-if="props.item.type === 'text'"
              class="item-type-icon"
              :icon="faAlignLeft"
            />
            <font-awesome-icon
              v-if="props.item.type === 'code'"
              class="item-type-icon"
              :icon="faCode"
            />
            <font-awesome-icon
              v-if="props.item.type === 'image'"
              class="item-type-icon"
              :icon="faImage"
            />
            <font-awesome-icon
              v-if="props.item.type === 'link'"
              class="item-type-icon"
              :icon="faLink"
            />
            <font-awesome-icon
              v-if="props.item.type === 'file'"
              class="item-type-icon"
              :icon="faFile"
            />
          </div>
          <div v-if="displayDetailTime" class="card-title">
            {{ new Date(item.copy_time).toLocaleString() }}
          </div>
          <div v-else class="card-title">{{ getTimeAgo(item.copy_time) }}</div>
          <div v-if="item.chars">{{ item.chars + ' ' + currentLanguage.pages.list.chars }}</div>
        </div>
        <div class="card-header-right">
          <div class="card-header-right-buttons">
            <!-- 置顶/取消置顶按钮 -->
            <div
              class="card-header-right-button"
              @click="item.is_topped ? onUnTop(item.id, props.index) : onTop(item.id, props.index)"
            >
              <font-awesome-icon v-if="!item.is_topped" :icon="['fas', 'top']" />
              <font-awesome-icon v-else :icon="['fas', 'un-top']" />
            </div>
            <!-- 删除按钮 -->
            <div
              class="card-header-right-button"
              @click="removeItem(item, index, currentLanguage, message)"
            >
              <font-awesome-icon :icon="faTrashCan" />
            </div>
            <!-- 设置标签按钮 -->
            <div
              v-if="
                tagSettingState.isShow &&
                tagSettingState.location === SETTINGS.TAG.BIND_TAG_LOCATION.TOP_RIGHT
              "
              class="card-header-right-button drag-icon"
              draggable="true"
              @dragend="handleDragEnd"
              @dragstart="handleDragStart(item, index, $event)"
            >
              <font-awesome-icon :icon="['fas', 'bind-tag']" class="dropdown-icon" />
            </div>
          </div>
        </div>
      </div>
      <!-- 内容 -->
      <div class="card-content">
        <div class="content-wrapper">
          <!-- 普通文本 -->
          <div v-if="item.type === 'text'" class="text-line item-line">
            <n-scrollbar style="max-height: 5.7em; width: 100%" x-scrollable>
              {{ item.content }}
            </n-scrollbar>
          </div>
          <!-- 代码 -->
          <div v-else-if="item.type === 'code'" class="code-line item-line">
            <n-scrollbar style="max-height: 5.7em; width: 100%" x-scrollable>
              <n-code :code="item.content" language="html" show-line-numbers />
            </n-scrollbar>
          </div>
          <!-- 链接 -->
          <div v-else-if="item.type === 'link'" class="link-line item-line">
            <!-- 图标区域 -->
            <div class="link-icon-container">
              <div class="link-icon-block">
                <font-awesome-icon :icon="faLink" />
              </div>
            </div>
            <!-- 文字内容 -->
            <div class="link-content">
              <div class="link-title">
                {{ item.link_title || currentLanguage.pages.list.linkNotTitle }}
              </div>
              <div class="link-description">{{ item.content }}</div>
            </div>
          </div>
          <!-- 文件 -->
          <div v-else-if="item.type === 'file'" class="file-line item-line">
            <FilePreview
              v-for="filePath in JSON.parse(item.file_path)"
              :file-path="filePath"
              :is-exist="fileExistCache.get(filePath)"
              :is-folder="isFolderCache.get(filePath)"
              :title="filePath"
              @dblclick="onCopyFile(item.id, filePath, message, currentLanguage)"
              @contextmenu.prevent.stop="onOpenContextMenuByFile(filePath)"
            />
          </div>
          <!-- 图片 -->
          <div v-else-if="item.type === 'image'" class="image-line item-line">
            <img
              v-if="displayThumbnailImage"
              :src="convertFileSrc(item.file_path)"
              alt="图片预览失败"
              class="image-preview"
            />
            <font-awesome-icon v-else class="file-icon" :icon="faImage" />
          </div>
          <!-- 空 -->
          <div v-else class="item-line"></div>
        </div>
      </div>
      <!-- 标签展示 -->
      <div
        v-if="tagSettingState.isShow"
        ref="cardTagsRef"
        v-show="
          tagSettingState.location === SETTINGS.TAG.BIND_TAG_LOCATION.BOTTOM_RIGHT ||
          (item.tags && item.tags.length > 0)
        "
        class="card-tags"
      >
        <n-tag
          v-for="tag in item.tags"
          :key="tag.id"
          :ref="(el: any) => setTagRef(el, tag.id)"
          bordered
          class="item-tag"
          closable
          round
          size="small"
          @close="removeItemTag(item, tag, index, currentLanguage, message)"
        >
          <div class="item-tag-content">
            <div :style="{ backgroundColor: tag.color }" class="item-tag-color"></div>
            <div class="item-tag-name">
              {{ tag.name }}
            </div>
          </div>
        </n-tag>
        <div
          v-if="
            tagSettingState.isShow &&
            tagSettingState.location === SETTINGS.TAG.BIND_TAG_LOCATION.BOTTOM_RIGHT
          "
          class="bind-tag-button"
          draggable="true"
          @dragend="handleDragEnd"
          @dragstart="handleDragStart(item, index, $event)"
        >
          <font-awesome-icon :icon="['fas', 'bind-tag']" class="bind-tag-icon" />
          <span v-if="tagSettingState.isShow">{{ currentLanguage.pages.list.bindTagBtn }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NCode, NTag, useMessage } from 'naive-ui'
import {
  displayDetailTime,
  onCopy,
  onCopyFile,
  onTop,
  onUnTop,
  removeItem,
  removeItemTag,
} from '../composables/ClipboardDataComposable.ts'
import {
  displayThumbnailImage,
  fileExistCache,
  isFolderCache,
} from '../composables/FileDataComposable.ts'
import { handleDragEnd, handleDragStart } from '../composables/DragComposable.ts'
import { tagSettingState } from '../composables/TagDataComposable.ts'
import { SETTINGS } from '../../../constants/UserSettingsConstant.ts'
import FilePreview from './FilePreview.vue'
import { animationEffect } from '../../../components/effect/composables/AnimationComposable.ts'
import { currentLanguage } from '../../../services/LanguageService.ts'
import { convertFileSrc } from '@tauri-apps/api/core'
import { getTimeAgo } from '../../../utils/DateUtil.ts'
import { faAlignLeft, faCode, faLink } from '@fortawesome/free-solid-svg-icons'
import { faFile, faImage, faTrashCan } from '@fortawesome/free-regular-svg-icons'
import { gsap } from 'gsap'
import { ref, watch } from 'vue'

// Naive UI 框架的消息组件
const message = useMessage()

const props = defineProps<{
  item: ClipboardItem
  index: number
}>()

/**
 * 获取父级的事件
 */
const emit = defineEmits(['custom-event'])

// GSAP 动画相关 refs
const cardTagsRef = ref<HTMLElement | null>(null)
const tagItemRefsMap = new Map<number, any>()

// 设置标签项引用
const setTagRef = (el: any, tagId: number) => {
  if (el) {
    tagItemRefsMap.set(tagId, el)
  }
}

// 监听标签变化，执行 GSAP 动画
watch(
  () => props.item.tags,
  (newTags, oldTags) => {
    if (!animationEffect.enabled || !cardTagsRef.value) {
      return
    }

    const duration = animationEffect.duration / 1000 || 0.3

    // 如果是新增标签
    if (!oldTags || (newTags && newTags.length > oldTags.length)) {
      const newTagIds = newTags?.map(tag => tag.id) || []
      const oldTagIds = oldTags?.map(tag => tag.id) || []
      const addedIds = newTagIds.filter(id => !oldTagIds.includes(id))

      // 为新增的标签执行进入动画
      addedIds.forEach((tagId, index) => {
        const element = tagItemRefsMap.get(tagId)?.$el
        if (element) {
          gsap.fromTo(element,
            {
              opacity: 0,
              scale: 0.8,
            },
            {
              opacity: 1,
              scale: 1,
              duration: duration,
              delay: index * 0.05,
              ease: 'power2.out',
            }
          )
        }
      })

      // 标签容器展开动画
      gsap.fromTo(cardTagsRef.value,
        {
          maxHeight: 0,
          opacity: 0,
        },
        {
          maxHeight: 200,
          opacity: 1,
          duration: duration,
          ease: 'power2.out',
        }
      )
    }

    // 如果是删除标签
    if (oldTags && newTags && newTags.length < oldTags.length) {
      const newTagIds = newTags.map(tag => tag.id)
      const oldTagIds = oldTags.map(tag => tag.id)
      const removedIds = oldTagIds.filter(id => !newTagIds.includes(id))

      // 为删除的标签执行离开动画
      removedIds.forEach((tagId) => {
        const element = tagItemRefsMap.get(tagId)?.$el
        if (element) {
          gsap.to(element, {
            opacity: 0,
            scale: 0.8,
            x: -20,
            duration: duration,
            ease: 'power2.in',
            onComplete: () => {
              tagItemRefsMap.delete(tagId)
            }
          })
        }
      })

      // 如果没有标签了，执行容器收起动画
      if (newTags.length === 0 &&
          tagSettingState.location !== SETTINGS.TAG.BIND_TAG_LOCATION.BOTTOM_RIGHT) {
        gsap.to(cardTagsRef.value, {
          maxHeight: 0,
          opacity: 0,
          duration: duration,
          ease: 'power2.in',
        })
      }
    }
  },
  { flush: 'post', deep: true }
)

function onOpenContextMenu(): void {
  // 向父组件传递数据（可以是对象、字符串、数字等）
  emit('custom-event', {
    type: props.item.type === 'text' || props.item.type === 'code' ? 'text' : props.item.type,
    item: props.item,
    filePath: props.item.type === 'image' ? props.item.file_path : '',
    index: props.index,
  })
}

function onOpenContextMenuByFile(filePath: string): void {
  // 向父组件传递数据（可以是对象、字符串、数字等）
  emit('custom-event', {
    type: 'file',
    item: props.item,
    filePath: filePath,
    index: props.index,
  })
}
</script>

<style scoped>
.clipboard-item {
  margin: 6px 6px;
  display: block;
}

.clipboard-card:hover {
  background-color: var(--theme-customCard-backgroundHover);
  box-shadow: 0 4px 12px var(--theme-universal-border);
}

.clipboard-card {
  background-color: var(--theme-customCard-background);
  border-radius: 10px;
  box-shadow: 0 2px 8px var(--theme-universal-border);
  padding: 7px;
  border: 1px solid transparent;
  will-change: transform, box-shadow;
}

.card-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  color: var(--theme-universal-text);
  font-size: 13px;
  margin-bottom: 5px;
}

.card-header-left {
  display: flex;
  gap: 5px;
  opacity: 0.5;
}

.item-type-icons {
  width: 16px;
  margin: 0 3px;
  padding: 2px;
  border: solid 0.15em var(--theme-universal-border);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.item-type-icon {
  color: var(--theme-universal-text);
  width: 12px;
}

.card-header-right {
  display: flex;
}

.card-header-right-buttons {
  display: flex;
  gap: 5px;
}

.card-header-right-button {
  cursor: pointer;
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
  will-change: opacity;
}

.card-header-right-button:hover {
  opacity: 0.8;
}

.drag-icon {
  cursor: move !important;
}

.card-content {
  color: var(--theme-universal-text);
  word-break: break-all;
  font-size: 0.9rem;
  line-height: 1.4;
}

.content-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.item-line {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  text-overflow: ellipsis;
  line-clamp: 3;
  width: 96%;
  word-wrap: break-word;
  word-break: break-all;
  font-size: 14px;
  border: 2px solid var(--theme-universal-border);
  border-radius: 8px;
  padding: 5px;
}

.text-line {
  white-space: pre-wrap;
  user-select: text;
  height: 3em;
}

.code-line {
  user-select: text;
  height: 4em;
}

.link-line {
  display: flex;
  align-items: center;
  height: 3.4em !important;
}

.file-line {
  height: 5em;
  overflow-x: auto;
}

.image-line {
  overflow-y: auto;
  height: 8em !important;
}

.link-icon-container {
  max-width: 65px;
  aspect-ratio: 1/1;
  margin: 0 5px;
}

.link-icon-block {
  width: 45px;
  aspect-ratio: 1/1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 1px solid var(--theme-universal-border);
  background-color: var(--theme-universal-background);
}

.link-content {
  width: calc(100% - 65px);
}

.link-title {
  white-space: nowrap; /* 禁止文本换行 */
  overflow: hidden; /* 隐藏超出范围的内容 */
  text-overflow: ellipsis; /* 使用省略号 */
  font-size: 18px;
  font-weight: 700;
}

.link-description {
  white-space: nowrap; /* 禁止文本换行 */
  overflow: hidden; /* 隐藏超出范围的内容 */
  text-overflow: ellipsis; /* 使用省略号 */
  color: var(--theme-universal-textHint);
  font-size: 14px;
}

.image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-tags {
  padding-top: 5px;
  padding-bottom: 2px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  overflow: hidden;
  will-change: max-height, opacity;
}

.item-tag {
  box-shadow: 0 1px 2px var(--theme-universal-border);
  will-change: opacity, transform;
}

.item-tag-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 3px;
}

.item-tag-color {
  width: 12px;
  height: 12px;
  border-radius: 10px;
  box-shadow: 0 0 3px var(--theme-universal-border);
}

.item-tag-name {
  max-width: 60px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  word-break: break-all;
}

.bind-tag-button {
  cursor: grab;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 3px;
  border: 1px dashed var(--theme-universal-text);
  border-radius: 15px;
  color: var(--theme-universal-text);
  background-color: var(--theme-universal-background);
  font-size: 11px;
  padding: 0 8px;
  opacity: 0.5;
  margin-left: auto;
  height: 22px;
  will-change: opacity;
}

.bind-tag-button:hover {
  opacity: 0.8;
}

.bind-tag-icon {
  width: 12px;
  height: 12px;
}

:deep(.n-divider:not(.n-divider--vertical)) {
  margin-top: 0;
  margin-bottom: 2px;
}

:deep(.n-divider__title) {
  font-size: 13px;
  font-weight: 400;
  margin-left: 0;
  margin-right: 0;
}
</style>
