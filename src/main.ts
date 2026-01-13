import {createPinia} from "pinia";
import {createApp} from "vue";
import App from "./App.vue";
// 等宽字体
import 'vfonts/FiraCode.css';
// 路由
import router from "./routers";
// 全局滚动条样式设置
import './assets/css/scrollbarGlobal.css';
// 语言
import {initializeLanguage} from './services/LanguageService.ts';
// 主题
import {initializeTheme, themeColors} from './services/ThemeService.ts';
// 图片预览
import VueViewer from 'v-viewer';

import * as naive from 'naive-ui';
// 导入 Vue 以暴露为全局变量
import * as Vue from 'vue';

// 暴露 Vue 和 naive-ui 为全局变量
// @ts-ignore
window.Vue = Vue;
// @ts-ignore
window.naive = naive;
// @ts-ignore
window.themeColors = themeColors;

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(VueViewer);

// 在挂载前初始化主题和语言
initializeTheme().then(() => {
    initializeLanguage().then(() => {
        app.mount('#app')
    })
})


// app.mount('#app')
