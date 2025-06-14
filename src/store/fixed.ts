import { defineStore } from "pinia";
import { ref } from "vue";

/**
 * 列表固定状态
 */
export const listFixedStore = defineStore('listFixedListen', () => {
    const state = ref<number>(0);
    const stateData = () => {
        return state.value
    }
    const fixed = () => {
        state.value = 1
    }
    const unfiexed = () => {
        state.value = 0
    }
    //这里要记得返回出去，否则外面拿不到
    return { state, stateData, fixed, unfiexed }
})