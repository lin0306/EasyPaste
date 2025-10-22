<script setup lang="ts">
import { GlobalThemeOverrides, NConfigProvider, NMessageProvider } from 'naive-ui';
import { computed, onMounted } from 'vue';

import { error, info } from '@tauri-apps/plugin-log';
import { useLanguage } from './services/LanguageService.ts';
import { useTheme } from './services/ThemeService.ts';
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
const { themeColors, initializeTheme, setupThemeListener } = useTheme()
const { currentLanguage, initializeLanguage, setupLanguageListener } = useLanguage()

const theme = computed(() => {
  return {
    common: {
      primaryColor: themeColors.value.primary,
      primaryColorHover: themeColors.value.primary,
      primaryColorPressed: themeColors.value.primary,
    },
    Button: {
      textColor: themeColors.value.text,
      textColorDisabled: `${themeColors.value.text}80`,
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
      borderRadius: '5px'
    },
    Tag: {
      colorBordered: themeColors.value.background, // 背景色
      textColor: themeColors.value.tagTextColor, // 文字颜色
      border: `1px solid ${themeColors.value.border}`, // 边框
      fontWeightStrong: 400 // 字体粗细
    },
    Select: {
      color: themeColors.value.cardBackground,
      colorActive: themeColors.value.cardBackground,
      colorDisabled: `${themeColors.value.cardBackground}80`,
      textColor: themeColors.value.text,
      textColorDisabled: `${themeColors.value.text}80`,
      placeholderColor: `${themeColors.value.text}80`,
      placeholderColorDisabled: `${themeColors.value.text}50`,
      border: themeColors.value.border,
      borderHover: themeColors.value.primary,
      borderActive: themeColors.value.primary,
      borderFocus: themeColors.value.primary,
      borderDisabled: themeColors.value.border,
      boxShadowFocus: `0 0 0 2px ${themeColors.value.primary}20`,
      menuColor: themeColors.value.cardBackground,
      menuBoxShadow: '0 3px 6px -4px rgba(0, 0, 0, .12), 0 6px 16px 0 rgba(0, 0, 0, .08), 0 9px 28px 8px rgba(0, 0, 0, .05)',
      menuDividerColor: themeColors.value.divider,
      menuHeight: '200px',
      menuBorderRadius: '4px',
      menuBoxShadowPopoverInner: '0 3px 6px -4px rgba(0, 0, 0, .12), 0 6px 16px 0 rgba(0, 0, 0, .08), 0 9px 28px 8px rgba(0, 0, 0, .05)',
      optionHeight: '36px',
      optionFontSize: '14px',
      optionColor: themeColors.value.cardBackground,
      optionColorPressed: themeColors.value.cardBackground,
      optionColorActive: `${themeColors.value.primary}20`,
      optionColorHover: `${themeColors.value.primary}10`,
      optionTextColor: themeColors.value.text,
      optionTextColorPressed: themeColors.value.primary,
      optionTextColorDisabled: `${themeColors.value.text}40`,
      optionTextColorActive: themeColors.value.primary,
      optionTextColorHover: themeColors.value.primary,
      optionOpacityDisabled: '0.6',
      loadingColor: themeColors.value.primary,
      peers: {
        InternalSelection: {
          textColor: themeColors.value.text,
          textColorDisabled: `${themeColors.value.text}80`,
          color: themeColors.value.cardBackground,
          colorActive: themeColors.value.cardBackground,
          colorDisabled: `${themeColors.value.cardBackground}80`,
          borderHover: themeColors.value.primary,
          borderActive: themeColors.value.primary,
          borderFocus: themeColors.value.primary,
          borderDisabled: themeColors.value.border,
          caretColor: themeColors.value.primary,
          placeholderColor: `${themeColors.value.text}80`,
          placeholderColorDisabled: `${themeColors.value.text}50`,
          boxShadowFocus: `0 0 0 2px ${themeColors.value.primary}20`
        },
        InternalSelectMenu: {
          color: themeColors.value.background,
          optionTextColor: themeColors.value.text, // 未选中状态下的文字颜色
          optionTextColorActive: themeColors.value.text, // 选中状态下的文字颜色
          optionOpacityDisabled: '0.6',
          optionColorPending: themeColors.value.hoverBackground, // 悬浮再未选中的选项上的背景色
          optionColorActive: themeColors.value.secondary, // 选中的选项背景色
          optionColorActivePending: themeColors.value.secondary, // 悬浮在选中的选项上的背景色
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
      railColor:themeColors.value.sliderRailColor,
      railColorHover:themeColors.value.sliderRailColor,
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
      <router-view />
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
  -moz-user-select: none;  /* Firefox私有属性 */
  -webkit-user-select: none;  /* WebKit内核私有属性 */
  -ms-user-select: none;  /* IE私有属性(IE10及以后) */
  -khtml-user-select: none;  /* KHTML内核私有属性 */
  -o-user-select: none;  /* Opera私有属性 */
  user-select: none;  /* CSS3属性 */
}
</style>