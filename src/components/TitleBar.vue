<template>
  <div id="title-bar"
       :class="{ 'fixed': isFixed }"
       :data-tauri-drag-region="!isFixed"
  >
    <div class="window-title">
      <img src="../../public/logo.svg" class="logo" />
      <span>
      {{ title }}
      </span>
      <UpdateIcon v-if="showUpdateIcon" class="update-icon" @click="openUpdateWindow"/>
    </div>
    <div class="window-controls">
      <div v-if="isDev" class="control-button" @click="onRefresh">
        <RefreshIcon class="program-btn" id="devtool-button-img"/>
      </div>
      <div v-if="isDev && devTool" class="control-button" @click="openDevTool">
        <DevToolIcon class="program-btn" id="devtool-button-img"/>
      </div>
      <div v-if="showFixedBtn && !isFixed" class="control-button fixation-button" @click="onFixWindow">
        <FixedIcon class="program-btn" id="fixation-button-img"/>
      </div>
      <div v-if="showFixedBtn && isFixed" class="control-button unfixation-button" @click="onUnfixWindow">
        <UnFixedIcon class="program-btn" id="unfixation-button-img"/>
      </div>
      <div v-if="showMinimizeBtn" class="control-button" @click="onMinimizeWindow">
        <MinimizeIcon class="program-btn" id="minimize-button-img"/>
      </div>
      <div v-if="showHideBtn" class="control-button" @click="onHide">
        <MinimizeIcon class="program-btn" id="minimize-button-img"/>
      </div>
      <div v-if="showCloseBtn" class="control-button close-button" @click="onClose">
        <CloseIcon class="program-btn" id="close-button-img"/>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import CloseIcon from '../assets/icons/CloseIcon.vue'
import DevToolIcon from '../assets/icons/DevToolIcon.vue'
import FixedIcon from '../assets/icons/FixedIcon.vue'
import MinimizeIcon from '../assets/icons/MinimizeIcon.vue'
import UnFixedIcon from '../assets/icons/UnFixedIcon.vue'

import {invoke} from '@tauri-apps/api/core'
import {onMounted, ref} from 'vue'
import {isDev} from "../data/SystemParams.ts"
import {listFixedStore} from '../store/Fixed.ts'
import {getCurrentWebviewWindow} from "@tauri-apps/api/webviewWindow";
import UpdateIcon from "../assets/icons/UpdateIcon.vue";
import UpdaterService from "../services/UpdaterService.ts";
import RefreshIcon from "../assets/icons/RefreshIcon.vue";

const props = withDefaults(defineProps<{
  title: string;
  showCloseBtn?: boolean;
  showHideBtn?: boolean; // 是否显示窗口隐藏按钮
  showFixedBtn?: boolean;
  devTool?: string;
  showMinimizeBtn?: boolean; // 是否显示窗口最小化按钮，当窗口属性skipTaskbar设置为true时，此设置不生效
  showUpdateIcon?: boolean;
}>(), {
  showFixedBtn: false
});

const isFixed = ref(false);

let listFixedListen = listFixedStore();

/**
 * 固定窗口
 */
function onFixWindow() {
  if (props.showFixedBtn) {
    isFixed.value = true;
    listFixedListen.fixed();
  }
}

/**
 * 取消固定窗口
 */
function onUnfixWindow() {
  if (props.showFixedBtn) {
    isFixed.value = false;
    listFixedListen.unfixed();
  }
}

/**
 * 最小化窗口
 */
function onMinimizeWindow() {
  if (props.showMinimizeBtn) {
    getCurrentWebviewWindow().minimize();
  }
}

/**
 * 关闭窗口
 */
function onClose() {
  if (props.showCloseBtn) {
    getCurrentWebviewWindow().close();
  }
}

/**
 * 隐藏窗口
 */
function onHide() {
  if (props.showHideBtn) {
    getCurrentWebviewWindow().hide();
  }
}

/**
 * 打开开发者工具
 */
async function openDevTool() {
  if (props.devTool) {
    await invoke('open_dev_tool', {windowName: props.devTool});
  }
}

/**
 * 打开更新窗口
 */
async function openUpdateWindow() {
  const update = UpdaterService.getInstance();
  update.showUpdateWindow();
}

/**
 * 刷新页面
 */
function onRefresh() {
  // 刷新当前页面
  window.location.reload();
}

onMounted(() => {
  if (props.showFixedBtn) {
    listFixedListen = listFixedStore();
    isFixed.value = listFixedListen.stateData();
  }
});
</script>
<style scoped>
/* 标题栏样式 */
#title-bar {
  height: 25px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px 8px 0 0;
  backdrop-filter: blur(10px);
  z-index: 3000;
  background-color: var(--theme-titleBar-backgroundColor);
  color: var(--theme-universal-text);
  cursor: move;
  position: relative;
  pointer-events: auto;
}

#title-bar.fixed {
  cursor: auto !important;
}

.window-title {
  font-size: 12px;
  -webkit-app-region: no-drag;
  cursor: auto !important;
  display: flex;
  align-items: center;
  padding: 0 5px;
}

.logo {
  width: 16px;
  margin-right: 5px;
  -webkit-user-drag: none;
}

.update-icon {
  width: 36px;
  margin-left: 5px;
  cursor: pointer;
  opacity: 0.8;
  padding-bottom: 2px;
}

.update-icon:hover {
  opacity: 1;
}

.window-controls {
  display: flex;
  gap: 5px;
  -webkit-app-region: no-drag;
  cursor: pointer;
  padding: 0 5px;
}

.control-button {
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--animation-duration, 0.3s) ease;
  width: 20px;
  height: 20px;
  -webkit-app-region: no-drag;
  opacity: 0.3;
}

.control-button:hover {
  background-color: var(--theme-titleBar-btnHoverBackgroundColor);
  opacity: 1;
}

.close-button:hover {
  background-color: var(--theme-titleBar-closeBtnHoverBackgroundColor) !important;
}

.program-btn {
  width: 60%;
  height: 60%;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  transition: transform var(--animation-duration, 0.3s) ease;
}

.fixation-button,
.unfixation-button {
  position: relative;
  overflow: hidden;
  display: flex;
}

.close-button:hover #close-button-img {
  transform: rotate(180deg);
}
</style>