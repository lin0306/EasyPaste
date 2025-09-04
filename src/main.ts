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
import {useLanguage} from './services/LanguageService.ts';
// 主题
import {useTheme} from './services/ThemeService.ts';
// 图片预览
import VueViewer from 'v-viewer';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(VueViewer);

// 在挂载前初始化主题和语言
const {initializeTheme} = useTheme()
const {initializeLanguage} = useLanguage()

initializeTheme().then(() => {
    initializeLanguage().then(() => {
        app.mount('#app')
    })
})


// app.mount('#app')
