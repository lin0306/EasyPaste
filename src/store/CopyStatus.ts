import { defineStore } from 'pinia';
import {reactive, ref} from 'vue';
import { COPY_STATE } from '../constants/CopyStateConstant.ts';

/**
 * 复制状态
 */
export const clipboardListenStore = defineStore('clipboardListen', () => {
    const state = ref(COPY_STATE.SUCCESS);
    const item = reactive<ClipboardItem>({} as ClipboardItem);
    const stateData = () => {
        return state.value
    }
    const setItem = (data: ClipboardItem) => {
        item.id = data.id;
        item.content = data.content;
        item.copy_time = data.copy_time;
        item.is_topped = data.is_topped;
        item.top_time = data.top_time;
        item.type = data.type;
        item.file_path = data.file_path;
        item.chars = data.chars;
    }
    const getItem = () => {
        return item;
    }
    const coping = () => {
        state.value = COPY_STATE.COPING
    }
    const error = () => {
        state.value = COPY_STATE.ERROR
    }
    const success = () => {
        state.value = COPY_STATE.SUCCESS
    }
    //这里要记得返回出去，否则外面拿不到
    return { state, stateData, coping, error, success, setItem, getItem }
})