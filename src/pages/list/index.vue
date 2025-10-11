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
} from "./composables/ClipboardDataComposable.ts";
import {destroyTag, initializeTag} from "./composables/TagDataComposable.ts";
import {destroyUpdater, hasNewVersion, initializeUpdater} from "./composables/UpdaterComposable.ts";
import {destroyWindow, initializeWindow, isAutoHideWindow} from "./composables/WindowComposable.ts";
import {destroyAnimationEffect, initializeAnimationEffect} from "./composables/AnimationComposable.ts";
import {destroyFileData, initializeFileData, initUserSettings} from "./composables/FileDataComposable.ts";

// 获取语言上下文
const {currentLanguage} = useLanguage();

// Naive UI 框架的消息组件
const message = useMessage();

// 监听系统复制状态
const clipboardListen = clipboardListenStore();
const isLoading = ref(true);

// 监听系统是否复制内容
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
  <div class="footer">
    <div></div>
    <div>{{ currentLanguage.pages.list.totalData.replace('{total}', scrollState.total.toString()) }}</div>
  </div>
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
  color: var(--theme-textHint);
  background-color: var(--theme-background);
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--theme-border);
  border-radius: 6px;
  box-shadow: 0 -1px 5px var(--theme-border);

}
</style>
