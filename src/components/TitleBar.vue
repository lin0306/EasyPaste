<template>
  <div id="title-bar"
       :class="{ 'fixed': isFixed }"
       :data-tauri-drag-region="!isFixed"
  >
    <div class="window-title">
      <span>
      {{ title }}
      </span>
      <UpdateIcon v-if="showUpdateIcon" class="update-icon" @click="checkUpdate"/>
    </div>
    <div class="window-controls">
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
import {nextTick, onMounted, ref} from 'vue'
import {isDev} from "../data/SystemParams.ts"
import {listFixedStore} from '../store/fixed'
import {getCurrentWebviewWindow} from "@tauri-apps/api/webviewWindow";
import UpdateIcon from "../assets/icons/UpdateIcon.vue";
import UpdaterService from "../services/UpdaterService.ts";

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

// 固定窗口
function onFixWindow() {
  if (props.showFixedBtn) {
    isFixed.value = true;
    listFixedListen.fixed();
  }
}

// 取消固定窗口
function onUnfixWindow() {
  if (props.showFixedBtn) {
    isFixed.value = false;
    listFixedListen.unfixed();
  }
}

function onMinimizeWindow() {
  if (props.showMinimizeBtn) {
    getCurrentWebviewWindow().minimize();
  }
}

function onClose() {
  if (props.showCloseBtn) {
    getCurrentWebviewWindow().close();
  }
}

function onHide() {
  if (props.showHideBtn) {
    getCurrentWebviewWindow().hide();
  }
}

async function openDevTool() {
  if (props.devTool) {
    await invoke('open_dev_tool', {windowName: props.devTool});
  }
}

/**
 * 检查更新
 */
async function checkUpdate() {
  const update = UpdaterService.getInstance();
  await update.checkForUpdates(true);
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
  width: 98%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1%;
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

#close-button-img:hover {
  transform: rotate(180deg);
}
</style>