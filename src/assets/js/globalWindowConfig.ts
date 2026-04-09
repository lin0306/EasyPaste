import * as Vue from 'vue'
import * as naive from 'naive-ui'
import { getPluginThemeOverrides, themeColors } from '../../services/ThemeService.ts'
import { createPluginVueApp } from '../../services/PluginService.ts'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { getItemContent, getItemFilePath } from '../../services/ClipboardDBService.ts'
import { currentLanguage } from '../../services/LanguageService.ts'

// 暴露 Vue 和 naive-ui 为全局变量
// @ts-ignore
window.Vue = Vue
// @ts-ignore
window.naive = naive
// 暴露 Font Awesome 给插件使用
// @ts-ignore
window.FontAwesomeIcon = FontAwesomeIcon
// @ts-ignore
window.getPluginThemeOverrides = getPluginThemeOverrides
// @ts-ignore
window.themeColors = themeColors
// @ts-ignore
window.createPluginVueApp = createPluginVueApp
// @ts-ignore
window.getItemContent = getItemContent
// @ts-ignore
window.getItemFilePath = getItemFilePath
// @ts-ignore
window.currentLanguage = currentLanguage
