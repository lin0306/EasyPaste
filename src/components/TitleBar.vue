<template>
    <div id="title-bar" :class="{ 'fixed': isFixed }">
        <div class="window-title">{{ title }}</div>
        <div class="window-controls">
            <div v-if="isShow && devTool" class="control-button" @click="openDevTool">
                <DevToolIcon class="program-btn" id="devtool-button-img" />
            </div>
            <div v-if="fixed && !isFixed" class="control-button fixation-button" @click="onFixWindow">
                <FixedIcon class="program-btn" id="fixation-button-img" />
            </div>
            <div v-if="fixed && isFixed" class="control-button unfixation-button" @click="onUnfixWindow">
                <UnFixedIcon class="program-btn" id="unfixation-button-img" />
            </div>
            <div v-if="showMinimizeBtn" class="control-button" @click="onMinimizeWindow">
                <MinimizeIcon class="program-btn" id="minimize-button-img" />
            </div>
            <div v-if="showClostBtn" class="control-button close-button" @click="onClose">
                <CloseIcon class="program-btn" id="close-button-img" />
            </div>
            <div v-if="showHideBtn" class="control-button close-button" @click="onHide">
                <HideIcon class="program-btn" id="hide-button-img" />
            </div>
        </div>
    </div>
    <div style="width: 100%;height: 25px;"></div>
</template>
<script lang="ts" setup>
import CloseIcon from '../assets/icons/CloseIcon.vue'
import DevToolIcon from '../assets/icons/DevToolIcon.vue'
import FixedIcon from '../assets/icons/FixedIcon.vue'
import HideIcon from '../assets/icons/HideIcon.vue'
import MinimizeIcon from '../assets/icons/MinimizeIcon.vue'
import UnFixedIcon from '../assets/icons/UnFixedIcon.vue'

import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { showDevToolStore } from '../store/devtools'
import { listFixedStore } from '../store/fixed'

const props = withDefaults(defineProps<{
    title: string;
    showClostBtn?: boolean;
    showHideBtn?: boolean;
    showFixedBtn?: boolean;
    fixed?: string;
    devTool?: string;
    showMinimizeBtn?: boolean;
}>(), {
    showFixedBtn: false
});

const isFixed = ref(false);

const isShow = ref(false);

const listFixedListen = listFixedStore();
const showDevToolListen = showDevToolStore();

let unlisten: any = null;

// 固定窗口
function onFixWindow() {
    isFixed.value = true;
    const listener = getFixedListener();
    if (listener) {
        listener.fixed();
    }
}

// 取消固定窗口
function onUnfixWindow() {
    isFixed.value = false;
    const listener = getFixedListener();
    if (listener) {
        listener.unfiexed();
    }
}

function onMinimizeWindow() {
    if (props.showMinimizeBtn) {
        getCurrentWindow().minimize();
    }
}

function onClose() {
    if (props.showClostBtn) {
        getCurrentWindow().close();
    }
}

function onHide() {
    if (props.showHideBtn) {
        getCurrentWindow().hide();
    }
}

async function openDevTool() {
    if (props.devTool) {
        await invoke('open_dev_tool', { windowName: props.devTool });
    }
}

function getFixedListener(): any {
    switch (props.fixed) {
        case 'listFixedListen':
            return listFixedListen;
        default:
            return null;
    }
}

watch(() => showDevToolListen.isShow, (newValue, _oldValue) => {
    isShow.value = Boolean(newValue);
});

onMounted(async () => {
    // 监听标签加载
    unlisten = await listen('update-show-dev-tool', (event: any) => {
        isShow.value = event.payload;
    });
    isShow.value = await showDevToolListen.isShow();
})
onUnmounted(() => {
    if (unlisten) {
        unlisten();
    }
})
</script>
<style scoped>
/* 标题栏样式 */
#title-bar {
    height: 25px;
    width: 100%;
    -webkit-app-region: drag;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 5px;
    border-radius: 8px 8px 0 0;
    backdrop-filter: blur(10px);
    position: relative;
    z-index: 1000;
    position: fixed;
    top: 0;
    background-color: var(--theme-titleBarBackground);
    color: var(--theme-text);
}

#title-bar.fixed {
    -webkit-app-region: no-drag;
}

.window-title {
    font-size: 12px;
}

.window-controls {
    display: flex;
    gap: 8px;
    -webkit-app-region: no-drag;
    padding-right: 10px;
}

.control-button {
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 20px;
    height: 20px;
    -webkit-app-region: no-drag;
}

.program-btn {
    width: 60%;
    height: 60%;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    transition: transform 0.3s ease, opacity 0.3s ease;
    opacity: 0.3;
}

.fixation-button,
.unfixation-button {
    position: relative;
    overflow: hidden;
    display: flex;
}

#close-button-img:hover {
    transform: rotate(180deg);
    opacity: 1;
}

#fixation-button-img:hover {
    opacity: 1;
}

#unfixation-button-img {
    opacity: 1;
}

#devtool-button-img:hover {
    opacity: 1;
}

#minimize-button-img:hover {
    opacity: 1;
}

#hide-button-img:hover {
    opacity: 1;
}
</style>