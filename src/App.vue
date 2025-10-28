<script setup lang="ts">
import {GlobalThemeOverrides, NConfigProvider, NMessageProvider} from 'naive-ui';
import {computed, onMounted} from 'vue';

import {error, info} from '@tauri-apps/plugin-log';
import {useLanguage} from './services/LanguageService.ts';
import {useTheme} from './services/ThemeService.ts';
import {env} from "./data/SystemParams.ts";

// 代码高亮引入
import hljs from 'highlight.js/lib/core';
import html from "highlight.js/lib/languages/vbscript-html";

hljs.registerLanguage('html', html)

// 屏蔽鼠标右键菜单（开发环境除外）
document.oncontextmenu = function () {
  return env === 'development';
};

// 创建主题上下文
const {themeColors, initializeTheme, setupThemeListener} = useTheme()
const {currentLanguage, initializeLanguage, setupLanguageListener} = useLanguage()

const theme = computed(() => {
  return {
    common: {
      primaryColor: themeColors.value.primary,
      primaryColorHover: themeColors.value.primary,
      primaryColorPressed: themeColors.value.primary,
      borderRadius: '5px',
    },
    Button: {
      color: themeColors.value.button.normal.backgroundColor,
      colorHover: themeColors.value.button.normal.hoverBackgroundColor,
      colorDisabled: themeColors.value.button.normal.disabledBackgroundColor,
      textColor: themeColors.value.button.normal.textColor,
      textColorHover: themeColors.value.button.normal.hoverTextColor,
      textColorDisabled: themeColors.value.button.normal.disabledTextColor,
      border: '0px',
      borderHover: '0px',
      borderDisabled: '0px',
      colorPrimary: themeColors.value.button.primary.backgroundColor,
      colorHoverPrimary: themeColors.value.button.primary.hoverBackgroundColor,
      colorDisabledPrimary: themeColors.value.button.primary.disabledBackgroundColor,
      textColorPrimary: themeColors.value.button.primary.textColor,
      textColorHoverPrimary: themeColors.value.button.primary.hoverTextColor,
      textColorDisabledPrimary: themeColors.value.button.primary.disabledTextColor,
      borderPrimary: '0px',
      borderHoverPrimary: '0px',
      borderDisabledPrimary: '0px',
    },
    Input: {
      color: themeColors.value.cardBackground,
      colorFocus: themeColors.value.cardBackground,
      colorHover: themeColors.value.primary,
      colorDisabled: themeColors.value.cardBackground,
      borderHover: themeColors.value.primary,
      borderFocus: themeColors.value.primary,
      borderDisabled: themeColors.value.border,
      textColor: themeColors.value.text,
      textColorDisabled: themeColors.value.textHint,
      placeholderColor: themeColors.value.textHint,
      placeholderColorDisabled: themeColors.value.textHint,
      borderRadius: '5px',
    },
    Tag: {
      colorBordered: themeColors.value.background, // 背景色
      textColor: themeColors.value.tagTextColor, // 文字颜色
      border: `1px solid ${themeColors.value.border}`, // 边框
      fontWeightStrong: 400 // 字体粗细
    },
    Select: {
      peers: {
        InternalSelection: {
          textColor: themeColors.value.text,
          color: themeColors.value.background,
          colorActive: themeColors.value.background,
          textColorDisabled: themeColors.value.textDisabled,
          colorDisabled: themeColors.value.select.input.disabledBackgroundColor,
          border: `1px solid ${themeColors.value.select.input.borderColor}`,
          borderHover: themeColors.value.select.input.hoverBorderColor,
          borderActive: themeColors.value.select.input.hoverBorderColor,
          borderFocus: themeColors.value.select.input.hoverBorderColor,
          borderDisabled:  themeColors.value.select.input.disabledBorderColor,
          placeholderColor: themeColors.value.textHint,
          placeholderColorDisabled: themeColors.value.textHint,
        },
        InternalSelectMenu: {
          color: themeColors.value.background,
          optionTextColor: themeColors.value.text, // 未选中状态下的文字颜色
          optionTextColorActive: themeColors.value.text, // 选中状态下的文字颜色
          optionOpacityDisabled: '0.6',
          optionColorPending: themeColors.value.select.options.hoverBackgroundColor, // 悬浮再未选中的选项上的背景色
          optionColorActive: themeColors.value.select.options.selectBackgroundColor, // 选中的选项背景色
          optionColorActivePending: themeColors.value.select.options.selectBackgroundColor, // 悬浮在选中的选项上的背景色
        }
      }
    },
    Menu: {
      color: themeColors.value.menuItemBackground,
      itemColorHover: themeColors.value.menuItemHover,
      itemTextColor: themeColors.value.menuItemTextColor,
      itemTextColorActive: themeColors.value.menuItemTextActive,
      itemTextColorHover: themeColors.value.menuItemTextHover,

    },
    Switch: {
      railColor: themeColors.value.switchRailColor,
      railColorActive: themeColors.value.switchRailColorActive,
      buttonColor: themeColors.value.switchButtonColor,
    },
    Dialog: {
      titleTextColor: themeColors.value.dialogTitleTextColor,
      textColor: themeColors.value.dialogTextColor,
      color: themeColors.value.dialogColor,
      iconColor: themeColors.value.dialogIconColor,
      closeIconColor: themeColors.value.dialogCloseIconColor,
      closeIconColorHover: themeColors.value.dialogCloseIconColorHover,
      closeColorHover: themeColors.value.dialogCloseColorHover,
    },
    Empty: {
      textColor: themeColors.value.textHint,
      iconColor: themeColors.value.textHint,
    },
    Scrollbar: {
      color: themeColors.value.scrollBarColor,
      colorHover: themeColors.value.scrollBarColorHover,
    },
    Slider: {
      railColor: themeColors.value.sliderRailColor,
      railColorHover: themeColors.value.sliderRailColor,
    },
    Divider: {
      color: themeColors.value.divider,
      textColor: themeColors.value.text,
    }
  } as GlobalThemeOverrides;
});

// 计算 Naive UI 的语言配置
const locale = computed(() => {
  return currentLanguage.value.locale;
});

// 计算 Naive UI 的语言配置
const dateLocale = computed(() => {
  return currentLanguage.value.dateLocale;
});

// 应用启动时初始化数据库和剪贴板监听
onMounted(async () => {
  try {
    info("应用启动中...");
    // 初始化主题
    await initializeTheme();
    // 设置主题监听器
    await setupThemeListener();
    // 初始化语言
    await initializeLanguage();
    // 设置语言监听器
    await setupLanguageListener();

    info('应用初始化完成');
  } catch (er) {
    error('应用初始化失败:' + er);
  }
});
</script>

<template>
  <n-config-provider :theme-overrides="theme" :locale="locale" :date-locale="dateLocale" :hljs="hljs">
    <n-message-provider>
      <router-view/>
    </n-message-provider>
  </n-config-provider>

</template>

<style>
/* 全局样式 */
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: var(--theme-background);
  color: var(--theme-text);
  transition: background-color 0.3s, color 0.3s;
  overflow-y: hidden;
  -moz-user-select: none; /* Firefox私有属性 */
  -webkit-user-select: none; /* WebKit内核私有属性 */
  -ms-user-select: none; /* IE私有属性(IE10及以后) */
  -khtml-user-select: none; /* KHTML内核私有属性 */
  -o-user-select: none; /* Opera私有属性 */
  user-select: none; /* CSS3属性 */
}
</style>