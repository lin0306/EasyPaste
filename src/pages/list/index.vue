<script setup lang="ts">
import {error, info} from "@tauri-apps/plugin-log";
import {useMessage} from 'naive-ui';
import {onMounted, onUnmounted, ref, watch} from "vue";
import TitleBar from '../../components/TitleBar.vue';
import {useLanguage} from '../../services/LanguageService.ts';
import {firstRun} from "../../store/FirstRun.ts";
import {clipboardListenStore} from "../../store/CopyStatus.ts";
import {COPY_STATE} from "../../constants/CopyStateConstant.ts";
import ClipboardListContent from './components/ClipboardListContent.vue';
import HeadNavigationBar from "./components/HeadNavigationBar.vue";
import SearchBox from './components/SearchBox.vue';
import TagList from './components/TagList.vue';
import {
  destroyClipboardData,
  initializeClipboardData,
  insertClipboardItem,
  scrollState,
  searchBoxState,
  toggleSearchBox,
} from "./composables/ClipboardDataComposable.ts";
import {destroyTag, initializeTag} from "./composables/TagDataComposable.ts";
import {destroyUpdater, hasNewVersion, initializeUpdater} from "./composables/UpdaterComposable.ts";
import {destroyWindow, initializeWindow, isAutoHideWindow} from "./composables/WindowComposable.ts";
import {destroyAnimationEffect, initializeAnimationEffect} from "./composables/AnimationComposable.ts";
import {destroyFileData, initializeFileData, initUserSettings} from "./composables/FileDataComposable.ts";
import {getSearchKey} from "../../store/ShortcutKeys.ts";

// 获取语言上下文
const {currentLanguage} = useLanguage();

// Naive UI 框架的消息组件
const message = useMessage();

// 监听系统复制状态
const clipboardListen = clipboardListenStore();
const isLoading = ref(true);

/**
 * 处理键盘事件
 * @param {KeyboardEvent} event - 键盘事件
 */
let lastKeyDownTime = 0;

/**
 * 监听键盘点击事件
 */
async function handleKeyDown(event: KeyboardEvent) {
  // 忽略重复的按键事件
  if (event.timeStamp - lastKeyDownTime < 100) {
    return;
  }
  lastKeyDownTime = event.timeStamp;

  const searchKey = await getSearchKey();
  // 如果没有快捷键配置，则不处理
  if (!searchKey) return;

  // 当搜索框显示时，按ESC键隐藏
  if (searchBoxState.visible && event.key === 'Escape') {
    toggleSearchBox();
    return;
  }

  const keys: string[] = searchKey.key;

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
    toggleSearchBox();
    return;
  }
}

/**
 * 监听系统是否复制内容
 */
watch(() => clipboardListen.state, (newValue, oldValue) => {
  if (
      newValue !== oldValue
      && newValue === COPY_STATE.SUCCESS
      && oldValue === COPY_STATE.COPING
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
    info("列表页面初始化...")
    const isFirstRun = await firstRun();
    if (isFirstRun) {
      // 初始化数据
      await initUserSettings();
    }

    // 初始化剪贴板数据配置
    await initializeClipboardData();

    // 初始化标签配置
    await initializeTag();

    // 初始化窗口配置
    await initializeWindow(currentLanguage.value);

    // 初始化更新器配置
    await initializeUpdater();

    // 初始化动画效果配置
    await initializeAnimationEffect();

    // 初始化文件数据配置
    initializeFileData();

    // 增加事件监听
    document.addEventListener('keydown', handleKeyDown);
  } catch (err) {
    console.error(err);
    error('列表页面初始化失败:' + err);
    message.error(currentLanguage.value.pages.list.initFailedHint);
  } finally {
    isLoading.value = false;
    info("列表页面初始化完成")
  }
})

/**
 * 组件卸载时清除事件监听
 */
onUnmounted(async () => {
  // 销毁剪贴板数据配置
  await destroyClipboardData();

  // 销毁标签配置
  destroyTag();

  // 销毁窗口配置
  destroyWindow();

  // 销毁更新器配置
  destroyUpdater();

  // 销毁动画效果配置
  destroyAnimationEffect();

  // 销毁文件数据配置
  destroyFileData();

  // 移除事件监听
  document.removeEventListener('keydown', handleKeyDown);
})
</script>

<template>
  <div v-if="isLoading" class="loading">
    <n-spin size="large"/>
  </div>
  <TitleBar
      :title="currentLanguage.pages.list.title"
      :showFixedBtn="true"
      :show-hide-btn="!isAutoHideWindow"
      :dev-tool="`main`"
      :show-update-icon="hasNewVersion"
      v-if="!isLoading"
  />
  <HeadNavigationBar v-if="!isLoading"/>

  <!-- 搜索框 -->
  <SearchBox v-if="!isLoading"/>

  <!-- 数据列表 -->
  <ClipboardListContent v-if="!isLoading"/>

  <!-- 底部展示 -->
  <div class="footer">
    <div>{{ currentLanguage.pages.list.totalData.replace('{total}', scrollState.total.toString()) }}</div>
  </div>

  <!-- 标签列表 -->
  <TagList v-if="!isLoading"/>
</template>
<style scoped>
.loading {
  display: flex;
  width: 100%;
  height: 100vh;
  align-content: center;
  justify-content: center;
}

.footer {
  z-index: 999;
  width: 96%;
  height: 16px;
  position: fixed;
  bottom: 0;
  font-size: 11px;
  padding: 4px 7px;
  color: var(--theme-universal-textHint);
  background-color: var(--theme-universal-background);
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--theme-universal-border);
  border-radius: 6px;
  box-shadow: 0 -1px 5px var(--theme-universal-border);
}
</style>
