<script setup lang="ts">
import {NEmpty, NImage, useMessage} from 'naive-ui';
import AddTagIcon from '../../assets/icons/AddTagIcon.vue';
import FileDeleteIcon from '../../assets/icons/FileDeleteIcon.vue';
import FileIcon from '../../assets/icons/FileIcon.vue';
import SearchIcon from '../../assets/icons/SearchIcon.vue';
import TopIcon from '../../assets/icons/TopIcon.vue';
import TrashIcon from '../../assets/icons/TrashIcon.vue';
import UnTopIcon from '../../assets/icons/UnTopIcon.vue';
import TitleBar from '../../components/TitleBar.vue';
import {useLanguage} from '../../services/LanguageService.ts';
import {getContrastColor} from '../../utils/color.ts';
import {isImage} from '../../utils/fileSystem.ts';
import {filePathConvertFileName} from '../../utils/strUtil.ts';
import {isCode} from '../../utils/TextType.ts';
import {onMounted, onUnmounted, watch} from "vue";
import {getSettings, getShortcutKeys} from "../../services/FileService.ts";
import {clipboardListenStore} from "../../store/copyStatus.ts";
import {error} from "@tauri-apps/plugin-log";
import {CopyState} from "../../types/CopyState.ts";
import {
  clipboardItems,
  destroyClipboardDataContext,
  initializeClipboardDataContext,
  insertClipboardItem,
  isItemTagged,
  loadClipboardItems,
  loadMoreItems,
  onCopy,
  onCopyFile,
  onTop,
  onUnTop,
  removeItem,
  removeItemTag,
  scrollState,
  searchBoxState,
  toggleSearchBox
} from "./context/ClipboardDataContext.ts";
import {
  destroyTagContext,
  handleTagClick,
  initializeTagContext,
  selectedTagState,
  TagItems,
  tagSettingState
} from "./context/TagDataContext.ts";
import HeadNavigationBar from "./components/HeadNavigationBar.vue";
import {destroyWindowContext, initializeWindowContext, isAutoHideWindow} from "./context/WindowContext.ts";
import {fileExistCache, imageDataCache} from "./context/FileDataContext.ts";
import {destroyUpdaterContext, initializeUpdaterContext} from "./context/UpdaterContext.ts";
import {
  contentDragStart,
  dragState,
  handleDragEnd,
  handleDragEnterTag,
  handleDragLeaveTag,
  handleDragStart,
  handleDropOnTag
} from "./context/DragContext.ts";

// 获取语言上下文
const {currentLanguage} = useLanguage();

// Naive UI 框架的消息组件
const message = useMessage();

// 监听系统复制状态
const clipboardListen = clipboardListenStore();


/**
 * 处理键盘事件
 * @param {KeyboardEvent} event - 键盘事件
 */
async function handleKeyDown(event: KeyboardEvent) {
  // 如果设置的搜索快捷键是ctrl + f，则优先触发搜索，mac是command + f
  if (event.key.toLowerCase() === 'f' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    event.stopPropagation();
  }

  const shortcutKeys = await getShortcutKeys();
  // 如果没有快捷键配置，则不处理
  if (!shortcutKeys || !shortcutKeys.search) return;

  // 当搜索框显示时，按ESC键隐藏
  if (searchBoxState.visible && event.key === 'Escape') {
    event.preventDefault(); // 阻止默认行为
    toggleSearchBox();
    return;
  }

  const searchConfig = shortcutKeys.search;
  const keys: string[] = searchConfig.key;

  let isCtrl = keys.includes("ctrl");
  let isAlt = keys.includes("alt");
  let isShift = keys.includes("shift");
  // mac上是command键，windows上是win键
  let isMeta = keys.includes("meta");
  let character = keys[keys.length - 1];
  if (
      event.key.toLowerCase() === character.toLowerCase()
      && event.ctrlKey === isCtrl
      && event.altKey === isAlt
      && event.shiftKey === isShift
      && event.metaKey === isMeta
  ) {
    event.preventDefault(); // 阻止默认行为
    toggleSearchBox();
    return;
  }
}

// 监听系统是否复制内容
watch(() => clipboardListen.state, (newValue, oldValue) => {
  if (
      newValue !== oldValue
      && newValue === CopyState.SUCCESS
      && oldValue === CopyState.COPING
  ) {
    console.log("检测到剪贴板有更新，插入新数据");
    insertClipboardItem(clipboardListen.getItem());
  }
});

/**
 * 组件初始化挂载监听
 */
onMounted(async () => {
  try {
    const settings = await getSettings();

    // 初始化剪贴板数据上下文
    await initializeClipboardDataContext(settings);

    // 初始化标签上下文
    await initializeTagContext(settings);

    // 初始化窗口上下文
    await initializeWindowContext(settings, currentLanguage.value);

    // 初始化更新器上下文
    await initializeUpdaterContext(settings);

    // 增加事件监听
    document.addEventListener('keydown', handleKeyDown);
  } catch (err) {
    console.error(err);
    error('初始化失败:' + err);
    message.error("程序初始化失败，请重试");
  }
})

/**
 * 组件卸载时清除事件监听
 */
onUnmounted(async () => {
  // 销毁剪贴板数据上下文
  await destroyClipboardDataContext();

  // 销毁标签上下文
  destroyTagContext();

  // 销毁窗口上下文
  destroyWindowContext();

  // 销毁更新器上下文
  destroyUpdaterContext();

  // 移除事件监听
  document.removeEventListener('keydown', handleKeyDown);
})
</script>

<template>
  <TitleBar :title="currentLanguage.pages.list.title" :showFixedBtn="true" :show-hide-btn="!isAutoHideWindow"
            :dev-tool="`main`"/>
  <HeadNavigationBar/>

  <!-- 搜索框 -->
  <div class="search-container" v-show="searchBoxState.visible">
    <n-input
        id="search-input"
        v-model:value="searchBoxState.text"
        :placeholder="currentLanguage.pages.list.searchHint"
        clearable
        @input="loadClipboardItems(true)"
        size="small"
    >
      <template #prefix>
        <!-- 搜索 -->
        <n-icon size="18">
          <SearchIcon/>
        </n-icon>
      </template>
    </n-input>
  </div>

  <!-- 标签列表 -->
  <div
      v-if="tagSettingState.isShow"
      class="tag-list"
      :class="{ 'has-selected-tag': dragState.isDragging }"
      @dragover.prevent
  >
    <div v-for="tag in TagItems" :key="tag.id" class="tag-item"
         :class="{
          'tag-dragging-over': dragState.draggedOverTagId === tag.id,
          'tag-disabled': dragState.isDragging && isItemTagged(dragState.dragItem.id, tag.id),
          'tag-expanded': dragState.isDragging && !isItemTagged(dragState.dragItem.id, tag.id),
          'tag-selected': selectedTagState.selectedTagId === tag.id
        }"
         :style="{ backgroundColor: tag.color }"
         @dragover.prevent
         @dragenter="handleDragEnterTag(tag.id)"
         @dragleave="handleDragLeaveTag($event)"
         @drop="handleDropOnTag(tag)"
         @click="handleTagClick(tag.id)"
    >
      <span class="tag-name" :style="{ color: getContrastColor(tag.color) }">{{ tag.name }}</span>
    </div>
  </div>

  <!-- 数据列表 -->
  <div :class="searchBoxState.visible ? `clipboard-container-search` : `clipboard-container`">
    <n-infinite-scroll v-if="clipboardItems && clipboardItems.length > 0" :distance="9" @load="loadMoreItems()">
      <!-- 列表内容 -->
      <div v-for="(item, index) in clipboardItems" :key="item.id" class="clipboard-item"
           @dblclick="onCopy(item, message, currentLanguage)">
        <div class="clipboard-card">
          <!-- 头部 -->
          <div class="card-header">
            <div class="card-header-left">
              <div>{{
                  item.type === 'text' ? (isCode(item.content) ? currentLanguage.pages.list.typeCode :
                      currentLanguage.pages.list.typeText) : currentLanguage.pages.list.typeFile
                }}
              </div>
              <div class="card-title">{{ new Date(item.copy_time).toLocaleString() }}</div>
              <div v-if="item.chars">{{ item.chars + ' ' + currentLanguage.pages.list.chars }}</div>
            </div>
            <div class="card-header-right">
              <div class="card-header-right-buttons">
                <!-- 置顶/取消置顶按钮 -->
                <div class="card-header-right-button" @click="item.is_topped ? onUnTop(item.id) : onTop(item.id)">
                  <TopIcon v-if="!item.is_topped"/>
                  <UnTopIcon v-else/>
                </div>
                <!-- 删除按钮 -->
                <div class="card-header-right-button" @click="removeItem(item.id, index)">
                  <TrashIcon/>
                </div>
                <!-- 设置标签按钮 -->
                <div v-if="tagSettingState.isShow && tagSettingState.location === 'top-right'"
                     class="card-header-right-button drag-icon"
                     draggable="true"
                     @dragstart="handleDragStart(item, index, $event)"
                     @dragend="handleDragEnd">
                  <AddTagIcon class="dropdown-icon"/>
                </div>
              </div>
            </div>
          </div>
          <!-- 内容 -->
          <div class="card-content">
            <div class="content-wrapper">
              <!-- 普通文本 -->
              <div v-if="item.type === 'text' && !isCode(item.content)"
                   class="text-line item-line"
                   draggable="true"
                   @dragstart="contentDragStart(item, $event)">
                {{ item.content }}
              </div>
              <!-- 代码 -->
              <div v-else-if="item.type === 'text' && isCode(item.content)"
                   class="code-line item-line"
                   draggable="true"
                   @dragstart="contentDragStart(item, $event)">
                <n-code :code="item.content" language="html" show-line-numbers/>
              </div>
              <!-- 文件 -->
              <div v-else-if="item.type === 'file'" class="file-line item-line">
                <div class="file-item" v-for="filePath in JSON.parse(item.file_path)" :title="filePath"
                     @dblclick="onCopyFile(item.id, filePath, message, currentLanguage)">
                  <n-image v-if="isImage(filePath)
                    && imageDataCache.get(filePath)" :src="imageDataCache.get(filePath)" object-fit="cover" width="100%"
                           :show-toolbar="false"/>
                  <FileIcon class="file-exist-icon" v-else-if="fileExistCache.get(filePath)"/>
                  <FileDeleteIcon class="file-not-exist-icon" v-else/>
                  <span :class="!fileExistCache.get(filePath) ? 'file-not-exist-text' : ''">{{
                      filePathConvertFileName(filePath)
                    }}</span>
                </div>
              </div>
              <!-- 空 -->
              <div v-else class="item-line"></div>
            </div>
          </div>
          <!-- 标签展示 -->
          <div class="card-tags" v-if="tagSettingState.isShow">
            <n-tag size="small" round closable bordered v-for="tag in item.tags" :key="tag.id" class="item-tag"
                   @close="removeItemTag(item, tag, index)">
              <div class="item-tag-content">
                <div :style="{ backgroundColor: tag.color }" class="item-tag-color"></div>
                <div class="item-tag-name">
                  {{ tag.name }}
                </div>
              </div>
            </n-tag>
            <div v-if="tagSettingState.isShow && tagSettingState.location === 'bottom-right'" class="bind-tag-button"
                 draggable="true" @dragstart="handleDragStart(item, index, $event)" @dragend="handleDragEnd">
              <AddTagIcon class="bind-tag-icon"/>
              <span v-if="tagSettingState.isShow">绑定标签</span>
            </div>
          </div>
        </div>
      </div>
      <!-- 最底部内容展示 -->
      <div v-if="scrollState.isLoading" class="loading-indicator">
        <n-spin :description="currentLanguage.pages.list.dataLoading"/>
      </div>
      <div v-if="!scrollState.hasMore" class="no-more-indicator">
        {{ currentLanguage.pages.list.allLoaded }}
      </div>
    </n-infinite-scroll>
    <!-- 无数据展示 -->
    <n-empty v-else description="暂无剪贴板记录" class="empty"/>
  </div>

</template>

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
  height: calc(100vh - 65px);
}

.clipboard-container {
  height: calc(100vh - 65px);
  /* 减去TitleBar(25px)和NavBar(30px)的高度 */
}

.clipboard-container-search {
  height: calc(100vh - 110px);
  /* 减去TitleBar(25px)和NavBar(30px)的高度 */
}

.clipboard-item {
  margin: 6px 6px;
}

.clipboard-card:hover {
  background-color: var(--theme-border);
}

.clipboard-card {
  background-color: var(--theme-cardBackground);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 7px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid transparent;
}

.clipboard-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  color: var(--theme-text);
  padding-bottom: 5px;
  font-size: 12px;
  border-bottom: 1px solid var(--theme-border);
}

.card-header-left {
  display: flex;
  gap: 5px;
  opacity: 0.5;
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
  transition: transform 0.2s;
  opacity: 0.5;
}

.card-header-right-button:hover {
  opacity: 0.8;
}

.drag-icon {
  cursor: move !important;
}

.card-content {
  color: var(--theme-text);
  word-break: break-all;
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 5px 0;
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
  overflow: hidden;
  height: 5.7em;
  width: 100%;
  word-wrap: break-word;
  word-break: break-all;
  font-size: 16px;
}

.text-line {
  white-space: pre-wrap;
  overflow: auto;
}

.code-line {
  overflow: auto;
  height: 5.7em;
}

.code-line::-webkit-scrollbar {
  border-radius: 10px;
  height: 6px;
}

.file-line {
  overflow: auto !important;
}

.file-line::-webkit-scrollbar {
  border-radius: 10px;
  height: 6px;
}

.file-item {
  margin: 2px;
  padding: 3px;
  border: 1px solid var(--theme-border);
  border-radius: 5px;
  font-size: 12px;
  width: 80px;
  display: grid;
  place-items: center;
  grid-template-rows: 1fr auto;
}

.file-item span {
  width: 75px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  /* 显示一行 */
  overflow: hidden;
  text-align: center;
  align-self: end;
  justify-self: center;
}

.file-exist-icon {
  width: 50px;
  height: 50px;
}

.file-not-exist-icon {
  width: 50px;
  height: 50px;
}

.file-not-exist-text {
  color: var(--theme-textDelete);
  text-decoration: line-through;
}

.card-tags {
  border-top: 1px solid var(--theme-border);
  padding-top: 5px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.item-tag {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
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
}

.item-tag-name {
  max-width: 60px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  word-break: break-all;
}

.item-tag-close-icon {
  margin-left: 5px;
  width: 12px;
  height: 12px;
}

.bind-tag-button {
  cursor: grab;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 3px;
  border: 1px dashed var(--theme-text);
  border-radius: 15px;
  padding: 3px;
  color: var(--theme-text);
  background-color: var(--theme-background);
  font-size: 11px;
  padding: 0px 8px;
  opacity: 0.6;
  margin-left: auto;
}

.bind-tag-button:hover {
  opacity: 1;
}

.bind-tag-icon {
  width: 12px;
  height: 12px;
}

/* 标签列表样式 */
.tag-list {
  position: fixed;
  top: 55px;
  left: -16px;
  display: flex;
  flex-direction: column;
  z-index: 100;
  transition: left 0.3s ease;
  overflow-y: auto;
  overflow-x: hidden;
  height: calc(100vh - 57px);
}

.has-selected-tag {
  width: 110px;
}

/* 隐藏 Chrome、Safari 和 Opera 的滚动条 */
.tag-list::-webkit-scrollbar {
  width: 0;
}

/* 拖拽激活时，标签列表稍微向右移动，增加可见性 */
.tag-list.dragging-active {
  left: -5px;
}

.tag-item {
  width: 24px;
  height: 30px;
  border-radius: 4px;
  margin-bottom: -4px;
  position: relative;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  transform-origin: left center;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  opacity: 0.2;
}

/* 鼠标悬停或拖拽时展开标签 */
.tag-item:hover,
.tag-item.tag-expanded {
  opacity: 1;
  /* 固定宽度而不是拉伸 */
  width: 100px;
  /* 悬浮时置于顶层 */
  z-index: 10;
}

.tag-name {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.3s ease 0.15s;
  /* 延迟显示文字，等待展开动画完成一半 */
  pointer-events: none;
  width: 70px;
  transform-origin: left center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  word-break: break-all;
}

/* 鼠标悬停或拖拽时显示标签名称 */
.tag-item:hover .tag-name,
.tag-item.tag-expanded .tag-name {
  opacity: 1;
  transform: translateY(-50%);
}

.tag-dragging-over {
  transform: scale(1.08);
  z-index: 20 !important;
}

/* 选中标签的样式 */
.tag-selected {
  width: 100px !important;
  z-index: 5 !important;
  opacity: 0.6;
}

/* 选中标签的名称始终显示 */
.tag-selected .tag-name {
  opacity: 1;
  font-weight: bold;
}

.tag-disabled {
  opacity: 0.7;
  /* 禁用鼠标光标样式 */
  cursor: not-allowed;
  /* 禁用点击事件 */
  pointer-events: none;
}

.tag-disabled:hover {
  width: 24px !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3) !important;
  transform: none !important;
}

.tag-disabled:hover .tag-name {
  opacity: 0 !important;
}

/* 搜索框样式 */
.search-container {
  z-index: 100;
  height: 30px;
  margin-bottom: 4px;
  background-color: var(--theme-cardBackground);
  border-radius: 0 0 8px 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 8px;
  transition: all 0.3s ease;
}

.search-container :deep(.n-input) {
  border-radius: 4px;
  border: 1px solid var(--theme-border);
  background-color: var(--theme-background);
}

.search-container :deep(.n-input__input) {
  color: var(--theme-textHint);
}
</style>