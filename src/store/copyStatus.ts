import { defineStore } from 'pinia';
import { ref } from 'vue';
import { CopyState } from '../types/CopyState';

/**
 * 复制状态
 */
export const clipboardListenStore = defineStore('clipboardListen', () => {
    const state = ref(CopyState.SUCCESS);
    const stateData = () => {
        return state.value
    }
    const coping = () => {
        state.value = CopyState.COPING
    }
    const success = () => {
        state.value = CopyState.SUCCESS
    }
    //这里要记得返回出去，否则外面拿不到
    return { state, stateData, coping: coping, success }
})