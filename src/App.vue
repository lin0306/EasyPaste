<script setup lang="ts">
import {GlobalThemeOverrides, NConfigProvider, NMessageProvider} from 'naive-ui';
import {computed, onMounted, onUnmounted} from 'vue';

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
      primaryColor: themeColors.value.universal.primary,
      primaryColorHover: themeColors.value.universal.primary,
      primaryColorPressed: themeColors.value.universal.primary,
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
      color: themeColors.value.universal.background,
      colorFocus: themeColors.value.universal.background,
      colorHover: themeColors.value.universal.background,
      colorDisabled: themeColors.value.universal.background,
      border: `1px solid ${themeColors.value.universal.border}`,
      borderHover: themeColors.value.universal.border,
      borderFocus: themeColors.value.universal.border,
      borderDisabled: themeColors.value.universal.border,
      textColor: themeColors.value.universal.text,
      textColorDisabled: themeColors.value.universal.textHint,
      placeholderColor: themeColors.value.universal.textHint,
      placeholderColorDisabled: themeColors.value.universal.textHint,
      borderRadius: '5px',
    },
    Tag: {
      colorBordered: themeColors.value.universal.secondary, // 背景色
      textColor: themeColors.value.universal.textHint, // 文字颜色
      border: `1px solid ${themeColors.value.universal.border}`, // 边框
      fontWeightStrong: 400 // 字体粗细
    },
    Select: {
      peers: {
        InternalSelection: {
          textColor: themeColors.value.universal.text,
          color: themeColors.value.universal.background,
          colorActive: themeColors.value.universal.background,
          textColorDisabled: themeColors.value.universal.textDisabled,
          colorDisabled: themeColors.value.universal.disabledBackgroundColor,
          border: `1px solid ${themeColors.value.universal.border}`,
          borderHover: themeColors.value.universal.borderHoverColor,
          borderActive: themeColors.value.universal.borderHoverColor,
          borderFocus: themeColors.value.universal.borderHoverColor,
          borderDisabled: themeColors.value.universal.borderDisabledColor,
          placeholderColor: themeColors.value.universal.textHint,
          placeholderColorDisabled: themeColors.value.universal.textHint,
        },
        InternalSelectMenu: {
          color: themeColors.value.universal.background,
          optionTextColor: themeColors.value.universal.text, // 未选中状态下的文字颜色
          optionTextColorActive: themeColors.value.universal.text, // 选中状态下的文字颜色
          optionOpacityDisabled: '0.6',
          optionColorPending: themeColors.value.select.options.hoverBackgroundColor, // 悬浮再未选中的选项上的背景色
          optionColorActive: themeColors.value.select.options.selectBackgroundColor, // 选中的选项背景色
          optionColorActivePending: themeColors.value.select.options.selectBackgroundColor, // 悬浮在选中的选项上的背景色
        }
      }
    },
    Menu: {
      color: themeColors.value.menu.background,
      itemColorHover: themeColors.value.menu.itemHover,
      itemColorActive: themeColors.value.menu.itemActive,
      itemTextColor: themeColors.value.universal.text,
      itemTextColorActive: themeColors.value.universal.text,
      itemTextColorHover: themeColors.value.universal.text,
      itemTextColorActiveHover: themeColors.value.universal.text,
    },
    Switch: {
      railColor: themeColors.value.switch.railColor,
      railColorActive: themeColors.value.switch.railColorActive,
      buttonColor: themeColors.value.switch.buttonColor,
    },
    Dialog: {
      titleTextColor: themeColors.value.universal.text,             // 标题颜色
      textColor: themeColors.value.universal.text,                  // 文本颜色
      color: themeColors.value.universal.secondary,                 // 背景色
      iconColor: themeColors.value.universal.text,                  // 图标颜色
      closeColorHover: themeColors.value.universal.secondary,       // 关闭按钮背景色
      closeColorPressed: themeColors.value.universal.secondary,     // 关闭按钮背景色
      closeIconColor: themeColors.value.universal.text,             // 关闭图标颜色
      closeIconColorHover: themeColors.value.universal.textHover,   // 关闭图标悬浮颜色
      closeIconColorPressed: themeColors.value.universal.textHover, // 关闭图标悬浮颜色
    },
    Empty: {
      textColor: themeColors.value.universal.textHint,
      iconColor: themeColors.value.universal.textHint,
    },
    Scrollbar: {
      color: themeColors.value.scrollBar.color,
      colorHover: themeColors.value.scrollBar.colorHover,
    },
    Slider: {
      railColor: themeColors.value.slider.railColor,
      railColorHover: themeColors.value.slider.railColor,
    },
    Divider: {
      color: themeColors.value.universal.border,
      textColor: themeColors.value.universal.text,
    },
    Tooltip: {
      color: themeColors.value.tooltip.color,
      textColor: themeColors.value.universal.text,
      fontSize: '12px',
      padding: '4px 8px',
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

async function handleKeyDown(event: KeyboardEvent) {
  // 忽略浏览器默认的搜索快捷键
  if (event.key.toLowerCase() === 'f' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    event.stopPropagation();
  }
}

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
  // 增加键盘点击事件监听
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  // 移除键盘点击时间监听
  document.removeEventListener('keydown', handleKeyDown);
})
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
  background-color: var(--theme-universal-background);
  color: var(--theme-universal-text);
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