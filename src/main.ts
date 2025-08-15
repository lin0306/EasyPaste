import {createPinia} from "pinia";
import {createApp} from "vue";
import App from "./App.vue";
// 等宽字体
import 'vfonts/FiraCode.css';
import router from "./routers";

// 全局滚动条样式设置
import './assets/css/scrollbarGlobal.css';
import {useLanguage} from './services/LanguageService.ts';
import {useTheme} from './services/ThemeService.ts';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// 在挂载前初始化主题和语言
const {initializeTheme} = useTheme()
const {initializeLanguage} = useLanguage()

initializeTheme().then(() => {
    initializeLanguage().then(() => {
        app.mount('#app')
    })
})


// app.mount('#app')
