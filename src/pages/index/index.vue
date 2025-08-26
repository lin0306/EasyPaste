<script setup lang="ts">
import {error} from "@tauri-apps/plugin-log";
import {useMessage} from 'naive-ui';
import {onMounted, onUnmounted, ref, watch} from "vue";
import TitleBar from '../../components/TitleBar.vue';
import {fillData} from "../../services/FileService.ts";
import {useLanguage} from '../../services/LanguageService.ts';
import {useTheme} from "../../services/ThemeService.ts";
import {firstRun} from "../../store/FirstRun.ts";
import {clipboardListenStore} from "../../store/copyStatus.ts";
import {CopyState} from "../../types/CopyState.ts";
import ClipboardListContent from './components/ClipboardListContent.vue';
import HeadNavigationBar from "./components/HeadNavigationBar.vue";
import SearchBox from './components/SearchBox.vue';
import TagList from './components/TagList.vue';
import {
  destroyClipboardDataContext,
  initializeClipboardDataContext,
  insertClipboardItem
} from "./composables/ClipboardDataComposable.ts";
import {destroyTagContext, initializeTagContext} from "./composables/TagDataComposable.ts";
import {destroyUpdaterContext, hasNewVersion, initializeUpdaterContext} from "./composables/UpdaterComposable.ts";
import {destroyWindowContext, initializeWindowContext, isAutoHideWindow} from "./composables/WindowComposable.ts";

// 获取语言上下文
const {currentLanguage, toggleLanguage} = useLanguage();
const {toggleTheme} = useTheme();

// Naive UI 框架的消息组件
const message = useMessage();

// 监听系统复制状态
const clipboardListen = clipboardListenStore();
const isLoading = ref(false);

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
    isLoading.value = true;
    const isFirstRun = await firstRun();
    if (isFirstRun) {
      // 填充数据
      await fillData(toggleLanguage, toggleTheme);
    }

    // 初始化剪贴板数据上下文
    await initializeClipboardDataContext();

    // 初始化标签上下文
    await initializeTagContext();

    // 初始化窗口上下文
    await initializeWindowContext(currentLanguage.value);

    // 初始化更新器上下文
    await initializeUpdaterContext();
  } catch (err) {
    console.error(err);
    error('初始化失败:' + err);
    message.error(currentLanguage.value.pages.list.initFailedHint);
  } finally {
    isLoading.value = false;
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

  <!-- 标签列表 -->
  <TagList v-if="!isLoading"/>

  <!-- 数据列表 -->
  <ClipboardListContent v-if="!isLoading"/>
</template>
<style scoped>
.loading {
  display: flex;
  width: 100%;
  height: 100vh;
  align-content: center;
  justify-content: center;
}
</style>
