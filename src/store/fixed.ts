import { defineStore } from "pinia";
import { ref } from "vue";

/**
 * 列表固定状态
 */
export const listFixedStore = defineStore('listFixedListen', () => {
    const state = ref<boolean>(false);
    const stateData = () => {
        return state.value
    }
    const fixed = () => {
        state.value = true
    }
    const unfixed = () => {
        state.value = false
    }
    //这里要记得返回出去，否则外面拿不到
    return { state, stateData, fixed, unfixed }
})