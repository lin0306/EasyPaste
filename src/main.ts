import { error } from '@tauri-apps/plugin-log'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
// 等宽字体
import 'vfonts/FiraCode.css'
// 路由
import router from './routers'
// 全局滚动条样式设置
import './assets/css/scrollbarGlobal.css'
// 主题
import { initializeTheme } from './services/ThemeService.ts'
// 图片预览
import VueViewer from 'v-viewer'
// 导入 Font Awesome
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// 注册自定义图标
import './assets/js/registerIcon.ts'
// window全局配置
import './assets/js/globalWindowConfig.ts'

async function bootstrap() {
  await initializeTheme()

  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)
  app.use(VueViewer)

  app.component('font-awesome-icon', FontAwesomeIcon)
  app.mount('#app')
}

bootstrap().catch(err => error('程序初始化失败' + err))
