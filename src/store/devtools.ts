import { load } from "@tauri-apps/plugin-store";
import { defineStore } from "pinia";
import { ref } from "vue";

const env = process.env.NODE_ENV;

// 屏蔽鼠标右键菜单
function isDev() {
    return env === 'development';
};

const store = await load('store.json', { autoSave: false });

export const showDevToolStore = defineStore('showDevToolListen', () => {
    const state = ref(false);
    const isShow = async () => {
        const val = await store.get<{ value: boolean }>('showDevTool');
        if (val?.value !== undefined) {
            state.value = val.value
        } else {
            if (isDev()) {
                state.value = true
            }
        }
        return state.value;
    }
    const show = async () => {
        state.value = true
        await store.set("showDevTool", { value: true });
        await store.save();
    }
    const hide = async () => {
        state.value = false
        await store.set("showDevTool", { value: false });
        await store.save();
    }
    //这里要记得返回出去，否则外面拿不到
    return { isShow, show, hide }
})