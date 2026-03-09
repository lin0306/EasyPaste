<script setup lang="ts">
import { GlobalThemeOverrides, NConfigProvider, NMessageProvider } from 'naive-ui'
import { computed, onMounted, onUnmounted } from 'vue'
import { error, info } from '@tauri-apps/plugin-log'
import { currentLanguage, setupLanguageListener } from './services/LanguageService.ts'
import { setupThemeListener, themeColors } from './services/ThemeService.ts'
import {
  destroyAnimationEffect,
  initializeAnimationEffect,
} from './components/composables/AnimationComposable.ts'
// 代码高亮引入
import hljs from 'highlight.js/lib/core'
import { setTransparency } from './utils/ColorUtil.ts'

// 屏蔽鼠标右键菜单
document.oncontextmenu = function () {
  return false
}

/**
 * 定义全局组件主题色
 */
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
      colorFocus: themeColors.value.button.normal.hoverBackgroundColor,
      colorPressed: themeColors.value.button.normal.hoverBackgroundColor,
      colorDisabled: themeColors.value.button.normal.disabledBackgroundColor,
      textColor: themeColors.value.button.normal.textColor,
      textColorHover: themeColors.value.button.normal.hoverTextColor,
      textColorFocus: themeColors.value.button.normal.hoverTextColor,
      textColorPressed: themeColors.value.button.normal.hoverTextColor,
      textColorDisabled: themeColors.value.button.normal.disabledTextColor,
      border: `1px solid ${themeColors.value.button.normal.textColor}`,
      borderHover: `1px solid ${themeColors.value.button.normal.hoverTextColor}`,
      borderFocus: `1px solid ${themeColors.value.button.normal.hoverTextColor}`,
      borderPressed: `1px solid ${themeColors.value.button.normal.hoverTextColor}`,
      borderDisabled: `1px solid ${themeColors.value.button.normal.disabledTextColor}`,
      textColorText: themeColors.value.button.normal.textColor,
      textColorTextHover: themeColors.value.button.normal.hoverTextColor,
      textColorTextFocus: themeColors.value.button.normal.hoverTextColor,
      textColorTextPressed: themeColors.value.button.normal.hoverTextColor,
      textColorTextDisabled: themeColors.value.button.normal.disabledTextColor,
      textColorGhost: themeColors.value.button.normal.textColor,
      textColorGhostHover: themeColors.value.button.normal.hoverTextColor,
      textColorGhostFocus: themeColors.value.button.normal.hoverTextColor,
      textColorGhostPressed: themeColors.value.button.normal.hoverTextColor,
      textColorGhostDisabled: themeColors.value.button.normal.disabledTextColor,

      colorPrimary: themeColors.value.button.primary.backgroundColor,
      colorHoverPrimary: themeColors.value.button.primary.hoverBackgroundColor,
      colorFocusPrimary: themeColors.value.button.primary.hoverBackgroundColor,
      colorPressedPrimary: themeColors.value.button.primary.hoverBackgroundColor,
      colorDisabledPrimary: themeColors.value.button.primary.disabledBackgroundColor,
      textColorPrimary: themeColors.value.button.primary.textColor,
      textColorHoverPrimary: themeColors.value.button.primary.hoverTextColor,
      textColorFocusPrimary: themeColors.value.button.primary.hoverTextColor,
      textColorPressedPrimary: themeColors.value.button.primary.hoverTextColor,
      textColorDisabledPrimary: themeColors.value.button.primary.disabledTextColor,
      borderPrimary: `1px solid ${themeColors.value.button.primary.textColor}`,
      borderHoverPrimary: `1px solid ${themeColors.value.button.primary.hoverTextColor}`,
      borderFocusPrimary: `1px solid ${themeColors.value.button.primary.hoverTextColor}`,
      borderPressedPrimary: `1px solid ${themeColors.value.button.primary.hoverTextColor}`,
      borderDisabledPrimary: `1px solid ${themeColors.value.button.primary.disabledTextColor}`,
      textColorTextPrimary: themeColors.value.button.primary.textColor,
      textColorTextHoverPrimary: themeColors.value.button.primary.hoverTextColor,
      textColorTextFocusPrimary: themeColors.value.button.primary.hoverTextColor,
      textColorTextPressedPrimary: themeColors.value.button.primary.hoverTextColor,
      textColorTextDisabledPrimary: themeColors.value.button.primary.disabledTextColor,
      textColorGhostPrimary: themeColors.value.button.primary.textColor,
      textColorGhostHoverPrimary: themeColors.value.button.primary.hoverTextColor,
      textColorGhostFocusPrimary: themeColors.value.button.primary.hoverTextColor,
      textColorGhostPressedPrimary: themeColors.value.button.primary.hoverTextColor,
      textColorGhostDisabledPrimary: themeColors.value.button.primary.disabledTextColor,

      colorError: themeColors.value.button.error.backgroundColor,
      colorHoverError: themeColors.value.button.error.hoverBackgroundColor,
      colorFocusError: themeColors.value.button.error.hoverBackgroundColor,
      colorPressedError: themeColors.value.button.error.hoverBackgroundColor,
      colorDisabledError: themeColors.value.button.error.disabledBackgroundColor,
      textColorError: themeColors.value.button.error.textColor,
      textColorHoverError: themeColors.value.button.error.hoverTextColor,
      textColorFocusError: themeColors.value.button.error.hoverTextColor,
      textColorPressedError: themeColors.value.button.error.hoverTextColor,
      textColorDisabledError: themeColors.value.button.error.disabledTextColor,
      borderError: `1px solid ${themeColors.value.button.error.textColor}`,
      borderHoverError: `1px solid ${themeColors.value.button.error.hoverTextColor}`,
      borderFocusError: `1px solid ${themeColors.value.button.error.hoverTextColor}`,
      borderPressedError: `1px solid ${themeColors.value.button.error.hoverTextColor}`,
      borderDisabledError: `1px solid ${themeColors.value.button.error.disabledTextColor}`,
      textColorTextError: themeColors.value.button.error.textColor,
      textColorTextHoverError: themeColors.value.button.error.hoverTextColor,
      textColorTextFocusError: themeColors.value.button.error.hoverTextColor,
      textColorTextPressedError: themeColors.value.button.error.hoverTextColor,
      textColorTextDisabledError: themeColors.value.button.error.disabledTextColor,
      textColorGhostError: themeColors.value.button.error.textColor,
      textColorGhostHoverError: themeColors.value.button.error.hoverTextColor,
      textColorGhostFocusError: themeColors.value.button.error.hoverTextColor,
      textColorGhostPressedError: themeColors.value.button.error.hoverTextColor,
      textColorGhostDisabledError: themeColors.value.button.error.disabledTextColor,
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
      suffixTextColor: themeColors.value.universal.text,
    },
    Tag: {
      colorBordered: themeColors.value.universal.secondary, // 背景色
      textColor: themeColors.value.universal.textHint, // 文字颜色
      border: `1px solid ${themeColors.value.universal.border}`, // 边框
      fontWeightStrong: 400, // 字体粗细
      closeIconColor: themeColors.value.universal.text,
    },
    Select: {
      peers: {
        InternalSelection: {
          textColor: themeColors.value.universal.text,
          color: themeColors.value.universal.background,
          colorActive: themeColors.value.universal.background,
          textColorDisabled: themeColors.value.universal.textHint,
          colorDisabled: themeColors.value.universal.textHint,
          border: `1px solid ${themeColors.value.universal.border}`,
          borderHover: themeColors.value.universal.border,
          borderActive: themeColors.value.universal.border,
          borderFocus: themeColors.value.universal.border,
          borderDisabled: themeColors.value.universal.border,
          placeholderColor: themeColors.value.universal.textHint,
          placeholderColorDisabled: themeColors.value.universal.textHint,
          arrowColor: themeColors.value.universal.text,
        },
        InternalSelectMenu: {
          color: themeColors.value.universal.background,
          optionTextColor: themeColors.value.universal.text, // 未选中状态下的文字颜色
          optionTextColorActive: themeColors.value.universal.text, // 选中状态下的文字颜色
          optionOpacityDisabled: '0.6',
          optionColorPending: themeColors.value.select.options.optionColorPending, // 悬浮再未选中的选项上的背景色
          optionColorActive: themeColors.value.select.options.optionColorActive, // 选中的选项背景色
          optionColorActivePending: themeColors.value.select.options.optionColorActivePending, // 悬浮在选中的选项上的背景色
          optionCheckColor: themeColors.value.universal.text,
        },
      },
    },
    Popselect: {
      peers: {
        Popover: {
          color: themeColors.value.universal.background, // 下拉选项背景色
        },
        InternalSelectMenu: {
          optionTextColor: themeColors.value.universal.text, // 未选中状态下的文字颜色
          optionTextColorActive: themeColors.value.universal.text, // 选中状态下的文字颜色
          optionOpacityDisabled: '0.6',
          optionColorPending: themeColors.value.select.options.optionColorPending, // 悬浮再未选中的选项上的背景色
          optionColorActive: themeColors.value.select.options.optionColorActive, // 选中的选项背景色
          optionColorActivePending: themeColors.value.select.options.optionColorActivePending, // 悬浮在选中的选项上的背景色
          optionCheckColor: themeColors.value.universal.text,
        },
      },
    },
    Menu: {
      color: themeColors.value.menuBar.background,
      itemColorHover: themeColors.value.menuBar.itemHover,
      itemColorActive: themeColors.value.menuBar.itemActive,
      itemTextColor: themeColors.value.universal.text,
      itemTextColorActive: themeColors.value.universal.text,
      itemTextColorHover: themeColors.value.universal.text,
      itemTextColorActiveHover: themeColors.value.universal.text,
    },
    Switch: {
      railColor: themeColors.value.button.normal.backgroundColor,
      railColorActive: themeColors.value.button.normal.hoverBackgroundColor,
      buttonColor: themeColors.value.button.primary.backgroundColor,
    },
    Dialog: {
      titleTextColor: themeColors.value.universal.text, // 标题颜色
      textColor: themeColors.value.universal.text, // 文本颜色
      color: themeColors.value.universal.secondary, // 背景色
      iconColor: themeColors.value.universal.text, // 图标颜色
      closeColorHover: themeColors.value.universal.secondary, // 关闭按钮背景色
      closeColorPressed: themeColors.value.universal.secondary, // 关闭按钮背景色
      closeIconColor: themeColors.value.universal.text, // 关闭图标颜色
      closeIconColorHover: themeColors.value.universal.text, // 关闭图标悬浮颜色
      closeIconColorPressed: themeColors.value.universal.text, // 关闭图标悬浮颜色
    },
    Empty: {
      textColor: themeColors.value.universal.textHint,
      iconColor: themeColors.value.universal.textHint,
    },
    Scrollbar: {
      color: setTransparency(themeColors.value.universal.textHint),
      colorHover: setTransparency(themeColors.value.universal.text),
    },
    Slider: {
      railColor: themeColors.value.universal.secondary,
      railColorHover: themeColors.value.universal.secondary,
    },
    Divider: {
      color: themeColors.value.universal.border,
      textColor: themeColors.value.universal.text,
    },
    Tooltip: {
      color: themeColors.value.universal.background,
      textColor: themeColors.value.universal.text,
      fontSize: '12px',
      padding: '4px 8px',
    },
    Tree: {
      nodeTextColor: themeColors.value.universal.text,
      loadingColor: themeColors.value.universal.text,
      arrowColor: themeColors.value.universal.text,
      nodeTextColorDisabled: themeColors.value.universal.textHint,
      dropMarkColor: themeColors.value.universal.text,
      lineColor: themeColors.value.universal.text,
      nodeColorHover: themeColors.value.button.normal.hoverBackgroundColor,
      nodeColorPressed: themeColors.value.button.normal.hoverBackgroundColor,
      nodeColorActive: themeColors.value.button.normal.hoverBackgroundColor,
    },
    Message: {
      color: themeColors.value.universal.background,
      colorInfo: themeColors.value.universal.background,
      colorSuccess: themeColors.value.universal.background,
      colorError: themeColors.value.universal.background,
      colorWarning: themeColors.value.universal.background,
      colorLoading: themeColors.value.universal.background,
      textColor: themeColors.value.universal.text,
      textColorInfo: themeColors.value.universal.text,
      textColorSuccess: themeColors.value.universal.text,
      textColorError: themeColors.value.universal.text,
      textColorWarning: themeColors.value.universal.text,
      textColorLoading: themeColors.value.universal.text,
    },
    Tabs: {
      tabTextColorLine: themeColors.value.universal.textHint,
      tabTextColorActiveLine: themeColors.value.universal.text,
      tabBorderColor: themeColors.value.universal.border,
    },
    Progress: {
      fillColor: themeColors.value.button.primary.backgroundColor,
    },
    Split: {
      resizableTriggerColor: themeColors.value.universal.border,
      resizableTriggerColorHover: themeColors.value.universal.border,
    },
    ColorPicker: {
      color: themeColors.value.universal.secondary,
      textColor: themeColors.value.universal.text,
    },
    Collapse: {
      dividerColor: themeColors.value.universal.border,
      titleTextColor: themeColors.value.universal.text,
      textColor: themeColors.value.universal.text,
      arrowColor: themeColors.value.universal.text,
      itemMargin: '0px',
      titlePadding: '5px',
    },
    Dropdown: {
      color: themeColors.value.universal.secondary,
      optionColorHover: themeColors.value.button.normal.hoverBackgroundColor,
      optionColorActive: themeColors.value.button.normal.hoverBackgroundColor,
      optionTextColor: themeColors.value.universal.text,
      optionTextColorHover: themeColors.value.button.normal.hoverTextColor,
      optionTextColorActive: themeColors.value.button.normal.hoverTextColor,
      optionTextColorChildActive: themeColors.value.button.normal.hoverTextColor,
      dividerColor: themeColors.value.universal.border,
      padding: '0',
    },
  } as GlobalThemeOverrides
})

/**
 * 计算 Naive UI 的语言配置
 */
const locale = computed(() => {
  return currentLanguage.value.locale
})

/**
 * 计算 Naive UI 的语言配置
 */
const dateLocale = computed(() => {
  return currentLanguage.value.dateLocale
})

/**
 * 忽略浏览器默认的搜索快捷键
 */
async function handleKeyDown(event: KeyboardEvent): Promise<void> {
  // 忽略浏览器默认的搜索快捷键
  if (
    event.key.toLowerCase() === 'f' &&
    (event.ctrlKey || event.metaKey) &&
    !event.altKey &&
    !event.shiftKey
  ) {
    event.preventDefault()
    event.stopPropagation()
  }
  // 忽略浏览器f5刷新快捷键
  if (
    event.key.toLowerCase() === 'f5' &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey &&
    !event.shiftKey
  ) {
    event.preventDefault()
    event.stopPropagation()
  }
  // 检测 Ctrl + R 或 Cmd + R（macOS）
  if (
    ((event.ctrlKey && event.key.toLowerCase() === 'r') ||
      (event.metaKey && event.key.toLowerCase() === 'r')) &&
    !event.altKey &&
    !event.shiftKey
  ) {
    event.preventDefault()
    event.stopPropagation()
  }
  // 检测 Ctrl + Shift + R 或 Cmd + Shift + R（macOS）
  if (
    ((event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'r') ||
      (event.metaKey && event.shiftKey && event.key.toLowerCase() === 'r')) &&
    !event.altKey
  ) {
    event.preventDefault()
    event.stopPropagation()
  }
}

// 应用启动时初始化数据库和剪贴板监听
onMounted(async () => {
  try {
    info('应用启动中...')
    // 初始化动画效果配置
    await initializeAnimationEffect()
    // 设置主题监听器
    setupThemeListener().catch(e => {
      error('主题监听器初始化失败:' + e)
    })
    // 设置语言监听器
    setupLanguageListener().catch(e => {
      error('语言监听器初始化失败:' + e)
    })
    info('应用初始化完成')
  } catch (er) {
    error('应用初始化失败:' + er)
  }
  // 增加键盘点击事件监听
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  // 销毁动画效果配置
  destroyAnimationEffect()
  // 移除键盘点击时间监听
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <n-config-provider
    :theme-overrides="theme"
    :locale="locale"
    :date-locale="dateLocale"
    :hljs="hljs"
  >
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
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: var(--theme-universal-background);
  color: var(--theme-universal-text);
  transition:
    background-color 0.3s,
    color 0.3s;
  overflow-y: hidden;
  -moz-user-select: none; /* Firefox私有属性 */
  -webkit-user-select: none; /* WebKit内核私有属性 */
  -ms-user-select: none; /* IE私有属性(IE10及以后) */
  -khtml-user-select: none; /* KHTML内核私有属性 */
  -o-user-select: none; /* Opera私有属性 */
  user-select: none; /* CSS3属性 */
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-tap-highlight-color: transparent;
  touch-action: none;
}

/*fix:折叠面板第一条没有垂直居中*/
.n-collapse .n-collapse-item:first-child {
  margin-top: 5px;
}

.n-collapse .n-collapse-item .n-collapse-item__content-wrapper .n-collapse-item__content-inner {
  padding-top: 0;
}
</style>
