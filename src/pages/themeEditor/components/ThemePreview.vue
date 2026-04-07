<script setup lang="ts">
import { GlobalThemeOverrides, NConfigProvider } from 'naive-ui'
import { computed, onMounted } from 'vue'
import { applyPreviewThemeToDOM, themeConfig } from '../composables/ThemeEditorDataComposable.ts'
import ListPreview from './ListPreview.vue'
import BasicComponentPreview from './BasicComponentPreview.vue'
import VideoPreview from './VideoPreview.vue'
import TextEditorPreview from './TextEditorPreview.vue'

// 代码高亮引入
import hljs from 'highlight.js/lib/core'
import html from 'highlight.js/lib/languages/vbscript-html'
import { setTransparency } from '../../../utils/ColorUtil.ts'
import { dateLocale, locale } from '../../../utils/LanguageUtil.ts'

hljs.registerLanguage('html', html)

/**
 * 定义全局组件主题色
 */
const theme = computed(() => {
  return {
    common: {
      primaryColor: themeConfig.universal.primary,
      primaryColorHover: themeConfig.universal.primary,
      primaryColorPressed: themeConfig.universal.primary,
      borderRadius: '5px',
    },
    Button: {
      color: themeConfig.button.normal.backgroundColor,
      colorHover: themeConfig.button.normal.hoverBackgroundColor,
      colorFocus: themeConfig.button.normal.hoverBackgroundColor,
      colorPressed: themeConfig.button.normal.hoverBackgroundColor,
      colorDisabled: themeConfig.button.normal.disabledBackgroundColor,
      textColor: themeConfig.button.normal.textColor,
      textColorHover: themeConfig.button.normal.hoverTextColor,
      textColorFocus: themeConfig.button.normal.hoverTextColor,
      textColorPressed: themeConfig.button.normal.hoverTextColor,
      textColorDisabled: themeConfig.button.normal.disabledTextColor,
      border: `1px solid ${themeConfig.button.normal.backgroundColor}`,
      borderHover: `1px solid ${themeConfig.button.normal.hoverBackgroundColor}`,
      borderFocus: `1px solid ${themeConfig.button.normal.hoverBackgroundColor}`,
      borderPressed: `1px solid ${themeConfig.button.normal.hoverBackgroundColor}`,
      borderDisabled: `1px solid ${themeConfig.button.normal.disabledBackgroundColor}`,

      colorPrimary: themeConfig.button.primary.backgroundColor,
      colorHoverPrimary: themeConfig.button.primary.hoverBackgroundColor,
      colorFocusPrimary: themeConfig.button.primary.hoverBackgroundColor,
      colorPressedPrimary: themeConfig.button.primary.hoverBackgroundColor,
      colorDisabledPrimary: themeConfig.button.primary.disabledBackgroundColor,
      textColorPrimary: themeConfig.button.primary.textColor,
      textColorHoverPrimary: themeConfig.button.primary.hoverTextColor,
      textColorFocusPrimary: themeConfig.button.primary.hoverTextColor,
      textColorPressedPrimary: themeConfig.button.primary.hoverTextColor,
      textColorDisabledPrimary: themeConfig.button.primary.disabledTextColor,
      borderPrimary: `1px solid ${themeConfig.button.primary.backgroundColor}`,
      borderHoverPrimary: `1px solid ${themeConfig.button.primary.hoverBackgroundColor}`,
      borderFocusPrimary: `1px solid ${themeConfig.button.primary.hoverBackgroundColor}`,
      borderPressedPrimary: `1px solid ${themeConfig.button.primary.hoverBackgroundColor}`,
      borderDisabledPrimary: `1px solid ${themeConfig.button.primary.disabledBackgroundColor}`,

      colorError: themeConfig.button.error.backgroundColor,
      colorHoverError: themeConfig.button.error.hoverBackgroundColor,
      colorFocusError: themeConfig.button.error.hoverBackgroundColor,
      colorPressedError: themeConfig.button.error.hoverBackgroundColor,
      colorDisabledError: themeConfig.button.error.disabledBackgroundColor,
      textColorError: themeConfig.button.error.textColor,
      textColorHoverError: themeConfig.button.error.hoverTextColor,
      textColorFocusError: themeConfig.button.error.hoverTextColor,
      textColorPressedError: themeConfig.button.error.hoverTextColor,
      textColorDisabledError: themeConfig.button.error.disabledTextColor,
      borderError: `1px solid ${themeConfig.button.error.backgroundColor}`,
      borderHoverError: `1px solid ${themeConfig.button.error.hoverBackgroundColor}`,
      borderDisabledError: `1px solid ${themeConfig.button.error.disabledBackgroundColor}`,

      textColorText: themeConfig.button.normal.textColor,
      textColorTextHover: themeConfig.button.normal.hoverTextColor,
      textColorTextFocus: themeConfig.button.normal.hoverTextColor,
      textColorTextPressed: themeConfig.button.normal.hoverTextColor,
      textColorTextDisabled: themeConfig.button.normal.disabledTextColor,

      textColorGhost: themeConfig.universal.text,
      textColorGhostHover: themeConfig.button.normal.hoverTextColor,
      textColorGhostFocus: themeConfig.button.normal.hoverTextColor,
      textColorGhostPressed: themeConfig.button.normal.hoverTextColor,
      textColorGhostDisabled: themeConfig.button.normal.disabledTextColor,
    },
    Input: {
      color: themeConfig.universal.background,
      colorFocus: themeConfig.universal.background,
      colorHover: themeConfig.universal.background,
      colorDisabled: themeConfig.universal.background,
      border: `1px solid ${themeConfig.universal.border}`,
      borderHover: themeConfig.universal.border,
      borderFocus: themeConfig.universal.border,
      borderDisabled: themeConfig.universal.border,
      textColor: themeConfig.universal.text,
      textColorDisabled: themeConfig.universal.textHint,
      placeholderColor: themeConfig.universal.textHint,
      placeholderColorDisabled: themeConfig.universal.textHint,
      borderRadius: '5px',
    },
    Tag: {
      colorBordered: themeConfig.universal.secondary, // 背景色
      textColor: themeConfig.universal.textHint, // 文字颜色
      border: `1px solid ${themeConfig.universal.border}`, // 边框
      fontWeightStrong: 400, // 字体粗细
      closeIconColor: themeConfig.universal.text,
    },
    Select: {
      peers: {
        InternalSelection: {
          textColor: themeConfig.universal.text,
          color: themeConfig.universal.background,
          colorActive: themeConfig.universal.background,
          textColorDisabled: themeConfig.universal.textHint,
          colorDisabled: themeConfig.universal.textHint,
          border: `1px solid ${themeConfig.universal.border}`,
          borderHover: themeConfig.universal.border,
          borderActive: themeConfig.universal.border,
          borderFocus: themeConfig.universal.border,
          borderDisabled: themeConfig.universal.border,
          placeholderColor: themeConfig.universal.textHint,
          placeholderColorDisabled: themeConfig.universal.textHint,
        },
        InternalSelectMenu: {
          color: themeConfig.universal.background,
          optionTextColor: themeConfig.universal.text, // 未选中状态下的文字颜色
          optionTextColorActive: themeConfig.universal.text, // 选中状态下的文字颜色
          optionOpacityDisabled: '0.6',
          optionColorPending: themeConfig.select.options.optionColorPending, // 悬浮再未选中的选项上的背景色
          optionColorActive: themeConfig.select.options.optionColorActive, // 选中的选项背景色
          optionColorActivePending: themeConfig.select.options.optionColorActivePending, // 悬浮在选中的选项上的背景色
        },
      },
    },
    Menu: {
      color: themeConfig.menuBar.background,
      itemColorHover: themeConfig.menuBar.itemHover,
      itemColorActive: themeConfig.menuBar.itemActive,
      itemTextColor: themeConfig.universal.text,
      itemTextColorActive: themeConfig.universal.text,
      itemTextColorHover: themeConfig.universal.text,
      itemTextColorActiveHover: themeConfig.universal.text,
    },
    Switch: {
      railColor: themeConfig.button.normal.backgroundColor,
      railColorActive: themeConfig.button.normal.hoverBackgroundColor,
      buttonColor: themeConfig.button.primary.backgroundColor,
    },
    Dialog: {
      titleTextColor: themeConfig.universal.text, // 标题颜色
      textColor: themeConfig.universal.text, // 文本颜色
      color: themeConfig.universal.secondary, // 背景色
      iconColor: themeConfig.universal.text, // 图标颜色
      closeColorHover: themeConfig.universal.secondary, // 关闭按钮背景色
      closeColorPressed: themeConfig.universal.secondary, // 关闭按钮背景色
      closeIconColor: themeConfig.universal.text, // 关闭图标颜色
      closeIconColorHover: themeConfig.universal.text, // 关闭图标悬浮颜色
      closeIconColorPressed: themeConfig.universal.text, // 关闭图标悬浮颜色
    },
    Scrollbar: {
      color: setTransparency(themeConfig.universal.textHint),
      colorHover: setTransparency(themeConfig.universal.text),
    },
    Slider: {
      railColor: themeConfig.universal.secondary,
      railColorHover: themeConfig.universal.secondary,
    },
    Divider: {
      color: themeConfig.universal.border,
      textColor: themeConfig.universal.text,
    },
    Tooltip: {
      color: themeConfig.universal.background,
      textColor: themeConfig.universal.text,
      fontSize: '12px',
      padding: '4px 8px',
    },
    Tree: {
      nodeTextColor: themeConfig.universal.text,
      loadingColor: themeConfig.universal.text,
      arrowColor: themeConfig.universal.text,
      nodeTextColorDisabled: themeConfig.universal.textHint,
      dropMarkColor: themeConfig.universal.text,
      lineColor: themeConfig.universal.text,
      nodeColorHover: themeConfig.button.normal.hoverBackgroundColor,
      nodeColorPressed: themeConfig.button.normal.hoverBackgroundColor,
      nodeColorActive: themeConfig.button.normal.hoverBackgroundColor,
    },
    Message: {
      color: themeConfig.universal.background,
      colorInfo: themeConfig.universal.background,
      colorSuccess: themeConfig.universal.background,
      colorError: themeConfig.universal.background,
      colorWarning: themeConfig.universal.background,
      colorLoading: themeConfig.universal.background,
      textColor: themeConfig.universal.text,
      textColorInfo: themeConfig.universal.text,
      textColorSuccess: themeConfig.universal.text,
      textColorError: themeConfig.universal.text,
      textColorWarning: themeConfig.universal.text,
      textColorLoading: themeConfig.universal.text,
    },
    Tabs: {
      tabTextColorLine: themeConfig.universal.textHint,
      tabTextColorActiveLine: themeConfig.universal.text,
      tabBorderColor: themeConfig.universal.border,
    },
    Progress: {
      fillColor: themeConfig.universal.border,
    },
    Split: {
      resizableTriggerColor: themeConfig.universal.border,
      resizableTriggerColorHover: themeConfig.universal.border,
    },
    ColorPicker: {
      color: themeConfig.universal.secondary,
      textColor: themeConfig.universal.text,
    },
    Collapse: {
      dividerColor: themeConfig.universal.border,
      titleTextColor: themeConfig.universal.text,
      textColor: themeConfig.universal.text,
      arrowColor: themeConfig.universal.text,
      itemMargin: '0px',
      titlePadding: '5px',
    },
  } as GlobalThemeOverrides
})

onMounted(() => {
  applyPreviewThemeToDOM(themeConfig)
})
</script>

<template>
  <div class="theme-view">
    <n-config-provider
      :theme-overrides="theme"
      :locale="locale"
      :date-locale="dateLocale"
      :hljs="hljs"
    >
      <n-collapse class="custom-theme-collapse">
        <list-preview />
        <basic-component-preview />
        <video-preview />
        <text-editor-preview />
      </n-collapse>
    </n-config-provider>
  </div>
</template>

<style scoped>
.theme-view {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: var(--preview-universal-background);
}

.custom-theme-collapse :deep(.n-collapse-item) {
  color: var(--preview-universal-text) !important;
}

.custom-theme-collapse :deep(.n-collapse-item:not(:first-child)) {
  border-top: 1px solid var(--preview-universal-border) !important;
}

.custom-theme-collapse-item :deep(.n-collapse-item__header .n-collapse-item-arrow) {
  color: var(--preview-universal-text) !important;
}

.custom-theme-collapse-item :deep(.n-collapse-item__header .n-collapse-item__header-main) {
  color: var(--preview-universal-text) !important;
}

/* 滚动条样式 */
/* 滚动条样式 */
::-webkit-scrollbar-thumb {
  background-color: var(--preview-scrollbar) !important;
}

::-webkit-scrollbar-thumb:hover {
  background-color: var(--preview-scrollbar-hover) !important;
}

:deep(::-webkit-scrollbar-thumb) {
  background-color: var(--preview-scrollbar) !important;
}

:deep(::-webkit-scrollbar-thumb:hover) {
  background-color: var(--preview-scrollbar-hover) !important;
}
</style>
