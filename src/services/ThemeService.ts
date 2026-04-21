import { emit, listen } from '@tauri-apps/api/event'
import { error, info } from '@tauri-apps/plugin-log'
import { GlobalThemeOverrides } from 'naive-ui'
import { ref } from 'vue'
import { lightTheme } from '../data/themes/light.ts'
import { darkTheme } from '../data/themes/dark.ts'
import { blueTheme } from '../data/themes/blue.ts'
import { pinkTheme } from '../data/themes/pink.ts'
import { getTheme, saveTheme } from '../store/Settings.ts'
import { SETTINGS } from '../constants/UserSettingsConstant.ts'
import { getCustomTheme, initCustomTheme } from '../store/CustomThemeConfig.ts'
import { setTransparency } from '../utils/ColorUtil.ts'

// 所有可用主题
export const themes = ref<ThemeConfig[]>([lightTheme, darkTheme, blueTheme, pinkTheme])

/**
 * 当前使用的主题id
 */
export const currentThemeId = ref<string>(SETTINGS.THEME.DEFAULT_THEME)
/**
 * 当前使用的主题配置
 */
export const themeColors = ref<ThemeColor>(lightTheme.colors)

/**
 * 初始化主题
 */
export async function initializeTheme(): Promise<void> {
  console.info('正在初始化主题配置...')
  try {
    // 初始化默认主题
    await initCustomTheme()
    const customTheme = await getCustomTheme()
    themes.value.push(customTheme)
    // 设置当前主题
    currentThemeId.value = await getTheme()
    info('程序使用的主题:' + currentThemeId.value)

    // 查找并应用主题
    const theme = themes.value.find(item => item.id === currentThemeId.value)
    if (theme) {
      themeColors.value = theme.colors
      applyThemeToDOM(theme.colors)
    } else {
      // 如果找不到主题，使用默认主题
      themeColors.value = lightTheme.colors
      applyThemeToDOM(lightTheme.colors)
    }
  } catch (err) {
    error('加载主题失败:' + err)
    // 使用默认主题
    currentThemeId.value = SETTINGS.THEME.DEFAULT_THEME
    themeColors.value = lightTheme.colors
    applyThemeToDOM(lightTheme.colors)
  }
  info('主题初始化完成')
}

/**
 * 将主题应用到DOM
 * @param colors 主题颜色
 * @param suffix CSS变量后缀
 */
export function applyThemeToDOM(colors: ThemeColor, suffix: string = ''): void {
  const root = document.documentElement

  // 将主题颜色应用到CSS变量
  Object.entries(colors).forEach(([key, value]) => {
    // 判断值是否是字符串
    if (typeof value === 'string') {
      if (suffix) {
        root.style.setProperty(`--theme-${suffix}-${key}`, value as string)
      } else {
        root.style.setProperty(`--theme-${key}`, value as string)
      }
      if (key === 'textHint') {
        root.style.setProperty(`--theme-scrollbar`, setTransparency(value))
      }
      if (key === 'text') {
        root.style.setProperty(`--theme-scrollbar-hover`, setTransparency(value))
      }
    } else {
      // 递归处理嵌套对象
      applyThemeToDOM(value, suffix ? suffix + '-' + key : key)
    }
  })
}

/**
 * 切换主题
 * @param themeId
 */
export async function toggleTheme(themeId: string): Promise<void> {
  console.log('切换主题:', themeId)
  try {
    // 查找主题
    const theme = themes.value.find(item => item.id === themeId)
    if (!theme) {
      error('找不到主题:' + themeId)
      return
    }

    // 更新当前主题
    currentThemeId.value = themeId
    themeColors.value = theme.colors

    // 应用主题到DOM
    applyThemeToDOM(theme.colors)

    // 保存主题设置
    await saveTheme(themeId)

    // 发送主题变更事件，通知所有窗口
    await emit('theme-changed', themeId)

    emit('easy-paste-theme-changed')

    info('主题已切换为:' + themeId)
  } catch (er) {
    error('切换主题失败:' + er)
  }
}

/**
 * 主题事件监听
 */
export async function setupThemeListener(): Promise<void> {
  // 监听主题变更事件
  await listen<string>('theme-changed', event => {
    console.log('[ThemeService] 收到 theme-changed 事件:', event.payload)
    // 确保不重复应用相同主题
    if (event.payload !== currentThemeId.value) {
      const theme = themes.value.find(item => item.id === event.payload)
      if (theme) {
        currentThemeId.value = event.payload
        themeColors.value = theme.colors
        applyThemeToDOM(theme.colors)
        emit('easy-paste-theme-changed')
        console.log('[ThemeService] 已派发 easy-paste-theme-changed 事件')
      }
    } else {
      console.log('[ThemeService] 主题未变化，忽略事件')
    }
  })
  // 监听自定义主题更新事件
  await listen('reload-custom-theme', async () => {
    const customTheme = await getCustomTheme()
    const index = themes.value.findIndex(item => item.id === customTheme.id)
    if (index && index > -1) {
      themes.value[themes.value.findIndex(item => item.id === customTheme.id)] = customTheme
    } else {
      themes.value.push(customTheme)
    }
    if (currentThemeId.value === 'custom') {
      themeColors.value = customTheme.colors
      applyThemeToDOM(customTheme.colors)
    }
  })
}

/**
 * 获取插件使用的主题覆盖配置
 * 用于插件的 Naive UI 组件主题统一
 * @returns GlobalThemeOverrides 配置对象
 */
export function getPluginThemeOverrides(): GlobalThemeOverrides {
  if (!themeColors.value?.universal) {
    return {}
  }

  const colors = themeColors.value

  return {
    common: {
      primaryColor: colors.universal.primary,
      primaryColorHover: colors.universal.primary,
      primaryColorPressed: colors.universal.primary,
      borderRadius: '5px',
    },
    Button: {
      color: colors.button.normal.backgroundColor,
      colorHover: colors.button.normal.hoverBackgroundColor,
      colorFocus: colors.button.normal.hoverBackgroundColor,
      colorPressed: colors.button.normal.hoverBackgroundColor,
      colorDisabled: colors.button.normal.disabledBackgroundColor,
      textColor: colors.button.normal.textColor,
      textColorHover: colors.button.normal.hoverTextColor,
      textColorFocus: colors.button.normal.hoverTextColor,
      textColorPressed: colors.button.normal.hoverTextColor,
      textColorDisabled: colors.button.normal.disabledTextColor,
      border: `1px solid ${colors.button.normal.textColor}`,
      borderHover: `1px solid ${colors.button.normal.hoverTextColor}`,
      borderFocus: `1px solid ${colors.button.normal.hoverTextColor}`,
      borderPressed: `1px solid ${colors.button.normal.hoverTextColor}`,
      borderDisabled: `1px solid ${colors.button.normal.disabledTextColor}`,
      textColorText: colors.button.normal.textColor,
      textColorTextHover: colors.button.normal.hoverTextColor,
      textColorTextFocus: colors.button.normal.hoverTextColor,
      textColorTextPressed: colors.button.normal.hoverTextColor,
      textColorTextDisabled: colors.button.normal.disabledTextColor,
      textColorGhost: colors.button.normal.textColor,
      textColorGhostHover: colors.button.normal.hoverTextColor,
      textColorGhostFocus: colors.button.normal.hoverTextColor,
      textColorGhostPressed: colors.button.normal.hoverTextColor,
      textColorGhostDisabled: colors.button.normal.disabledTextColor,

      colorPrimary: colors.button.primary.backgroundColor,
      colorHoverPrimary: colors.button.primary.hoverBackgroundColor,
      colorFocusPrimary: colors.button.primary.hoverBackgroundColor,
      colorPressedPrimary: colors.button.primary.hoverBackgroundColor,
      colorDisabledPrimary: colors.button.primary.disabledBackgroundColor,
      textColorPrimary: colors.button.primary.textColor,
      textColorHoverPrimary: colors.button.primary.hoverTextColor,
      textColorFocusPrimary: colors.button.primary.hoverTextColor,
      textColorPressedPrimary: colors.button.primary.hoverTextColor,
      textColorDisabledPrimary: colors.button.primary.disabledTextColor,
      borderPrimary: `1px solid ${colors.button.primary.textColor}`,
      borderHoverPrimary: `1px solid ${colors.button.primary.hoverTextColor}`,
      borderFocusPrimary: `1px solid ${colors.button.primary.hoverTextColor}`,
      borderPressedPrimary: `1px solid ${colors.button.primary.hoverTextColor}`,
      borderDisabledPrimary: `1px solid ${colors.button.primary.disabledTextColor}`,
      textColorTextPrimary: colors.button.primary.textColor,
      textColorTextHoverPrimary: colors.button.primary.hoverTextColor,
      textColorTextFocusPrimary: colors.button.primary.hoverTextColor,
      textColorTextPressedPrimary: colors.button.primary.hoverTextColor,
      textColorTextDisabledPrimary: colors.button.primary.disabledTextColor,
      textColorGhostPrimary: colors.button.primary.textColor,
      textColorGhostHoverPrimary: colors.button.primary.hoverTextColor,
      textColorGhostFocusPrimary: colors.button.primary.hoverTextColor,
      textColorGhostPressedPrimary: colors.button.primary.hoverTextColor,
      textColorGhostDisabledPrimary: colors.button.primary.disabledTextColor,

      colorError: colors.button.error.backgroundColor,
      colorHoverError: colors.button.error.hoverBackgroundColor,
      colorFocusError: colors.button.error.hoverBackgroundColor,
      colorPressedError: colors.button.error.hoverBackgroundColor,
      colorDisabledError: colors.button.error.disabledBackgroundColor,
      textColorError: colors.button.error.textColor,
      textColorHoverError: colors.button.error.hoverTextColor,
      textColorFocusError: colors.button.error.hoverTextColor,
      textColorPressedError: colors.button.error.hoverTextColor,
      textColorDisabledError: colors.button.error.disabledTextColor,
      borderError: `1px solid ${colors.button.error.textColor}`,
      borderHoverError: `1px solid ${colors.button.error.hoverTextColor}`,
      borderFocusError: `1px solid ${colors.button.error.hoverTextColor}`,
      borderPressedError: `1px solid ${colors.button.error.hoverTextColor}`,
      borderDisabledError: `1px solid ${colors.button.error.disabledTextColor}`,
      textColorTextError: colors.button.error.textColor,
      textColorTextHoverError: colors.button.error.hoverTextColor,
      textColorTextFocusError: colors.button.error.hoverTextColor,
      textColorTextPressedError: colors.button.error.hoverTextColor,
      textColorTextDisabledError: colors.button.error.disabledTextColor,
      textColorGhostError: colors.button.error.textColor,
      textColorGhostHoverError: colors.button.error.hoverTextColor,
      textColorGhostFocusError: colors.button.error.hoverTextColor,
      textColorGhostPressedError: colors.button.error.hoverTextColor,
      textColorGhostDisabledError: colors.button.error.disabledTextColor,
    },
    Input: {
      color: colors.universal.background,
      colorFocus: colors.universal.background,
      colorHover: colors.universal.background,
      colorDisabled: colors.universal.background,
      border: `1px solid ${colors.universal.border}`,
      borderHover: colors.universal.border,
      borderFocus: colors.universal.border,
      borderDisabled: colors.universal.border,
      textColor: colors.universal.text,
      textColorDisabled: colors.universal.textHint,
      placeholderColor: colors.universal.textHint,
      placeholderColorDisabled: colors.universal.textHint,
      borderRadius: '5px',
      suffixTextColor: colors.universal.text,
    },
    Tag: {
      colorBordered: colors.universal.secondary, // 背景色
      textColor: colors.universal.textHint, // 文字颜色
      border: `1px solid ${colors.universal.border}`, // 边框
      fontWeightStrong: 400, // 字体粗细
      closeIconColor: colors.universal.text,
    },
    Select: {
      peers: {
        InternalSelection: {
          textColor: colors.universal.text,
          color: colors.universal.background,
          colorActive: colors.universal.background,
          textColorDisabled: colors.universal.textHint,
          colorDisabled: colors.universal.textHint,
          border: `1px solid ${colors.universal.border}`,
          borderHover: colors.universal.border,
          borderActive: colors.universal.border,
          borderFocus: colors.universal.border,
          borderDisabled: colors.universal.border,
          placeholderColor: colors.universal.textHint,
          placeholderColorDisabled: colors.universal.textHint,
          arrowColor: colors.universal.text,
        },
        InternalSelectMenu: {
          color: colors.universal.background,
          optionTextColor: colors.universal.text, // 未选中状态下的文字颜色
          optionTextColorActive: colors.universal.text, // 选中状态下的文字颜色
          optionOpacityDisabled: '0.6',
          optionColorPending: colors.select.options.optionColorPending, // 悬浮再未选中的选项上的背景色
          optionColorActive: colors.select.options.optionColorActive, // 选中的选项背景色
          optionColorActivePending: colors.select.options.optionColorActivePending, // 悬浮在选中的选项上的背景色
          optionCheckColor: colors.universal.text,
        },
      },
    },
    Popselect: {
      peers: {
        Popover: {
          color: colors.universal.background, // 下拉选项背景色
        },
        InternalSelectMenu: {
          optionTextColor: colors.universal.text, // 未选中状态下的文字颜色
          optionTextColorActive: colors.universal.text, // 选中状态下的文字颜色
          optionOpacityDisabled: '0.6',
          optionColorPending: colors.select.options.optionColorPending, // 悬浮再未选中的选项上的背景色
          optionColorActive: colors.select.options.optionColorActive, // 选中的选项背景色
          optionColorActivePending: colors.select.options.optionColorActivePending, // 悬浮在选中的选项上的背景色
          optionCheckColor: colors.universal.text,
        },
      },
    },
    Menu: {
      color: colors.menuBar.background,
      itemColorHover: colors.menuBar.itemHover,
      itemColorActive: colors.menuBar.itemActive,
      itemTextColor: colors.universal.text,
      itemTextColorActive: colors.universal.text,
      itemTextColorHover: colors.universal.text,
      itemTextColorActiveHover: colors.universal.text,
    },
    Switch: {
      railColor: colors.button.normal.backgroundColor,
      railColorActive: colors.button.normal.hoverBackgroundColor,
      buttonColor: colors.button.primary.backgroundColor,
    },
    Dialog: {
      titleTextColor: colors.universal.text, // 标题颜色
      textColor: colors.universal.text, // 文本颜色
      color: colors.universal.secondary, // 背景色
      iconColor: colors.universal.text, // 图标颜色
      closeColorHover: colors.universal.secondary, // 关闭按钮背景色
      closeColorPressed: colors.universal.secondary, // 关闭按钮背景色
      closeIconColor: colors.universal.text, // 关闭图标颜色
      closeIconColorHover: colors.universal.text, // 关闭图标悬浮颜色
      closeIconColorPressed: colors.universal.text, // 关闭图标悬浮颜色
    },
    Empty: {
      textColor: colors.universal.textHint,
      iconColor: colors.universal.textHint,
    },
    Scrollbar: {
      color: setTransparency(colors.universal.textHint),
      colorHover: setTransparency(colors.universal.text),
    },
    Slider: {
      railColor: colors.universal.secondary,
      railColorHover: colors.universal.secondary,
    },
    Divider: {
      color: colors.universal.border,
      textColor: colors.universal.text,
    },
    Tooltip: {
      color: colors.universal.background,
      textColor: colors.universal.text,
      fontSize: '12px',
      padding: '4px 8px',
    },
    Tree: {
      nodeTextColor: colors.universal.text,
      loadingColor: colors.universal.text,
      arrowColor: colors.universal.text,
      nodeTextColorDisabled: colors.universal.textHint,
      dropMarkColor: colors.universal.text,
      lineColor: colors.universal.text,
      nodeColorHover: colors.button.normal.hoverBackgroundColor,
      nodeColorPressed: colors.button.normal.hoverBackgroundColor,
      nodeColorActive: colors.button.normal.hoverBackgroundColor,
    },
    Message: {
      color: colors.universal.background,
      colorInfo: colors.universal.background,
      colorSuccess: colors.universal.background,
      colorError: colors.universal.background,
      colorWarning: colors.universal.background,
      colorLoading: colors.universal.background,
      textColor: colors.universal.text,
      textColorInfo: colors.universal.text,
      textColorSuccess: colors.universal.text,
      textColorError: colors.universal.text,
      textColorWarning: colors.universal.text,
      textColorLoading: colors.universal.text,
    },
    Tabs: {
      tabTextColorLine: colors.universal.textHint,
      tabTextColorActiveLine: colors.universal.text,
      tabBorderColor: colors.universal.border,
    },
    Progress: {
      fillColor: colors.button.primary.backgroundColor,
      textColorCircle: colors.universal.text,
      textColorLineInner: colors.universal.text,
      textColorLineOuter: colors.universal.textHint,
    },
    Split: {
      resizableTriggerColor: colors.universal.border,
      resizableTriggerColorHover: colors.universal.border,
    },
    ColorPicker: {
      color: colors.universal.secondary,
      textColor: colors.universal.text,
    },
    Collapse: {
      dividerColor: colors.universal.border,
      titleTextColor: colors.universal.text,
      textColor: colors.universal.text,
      arrowColor: colors.universal.text,
      itemMargin: '0px',
      titlePadding: '5px',
    },
    Dropdown: {
      color: colors.universal.secondary,
      optionColorHover: colors.button.normal.hoverBackgroundColor,
      optionColorActive: colors.button.normal.hoverBackgroundColor,
      optionTextColor: colors.universal.text,
      optionTextColorHover: colors.button.normal.hoverTextColor,
      optionTextColorActive: colors.button.normal.hoverTextColor,
      optionTextColorChildActive: colors.button.normal.hoverTextColor,
      dividerColor: colors.universal.border,
      padding: '0',
    },
    Modal: {
      peers: {
        Card: {
          colorModal: colors.universal.background,
          textColor: colors.universal.text,
          titleTextColor: colors.universal.text,
          closeIconColor: colors.universal.text,
          closeIconColorHover: colors.universal.text,
          closeIconColorPressed: colors.universal.text,
          closeColorHover: colors.universal.textHint,
          closeColorPressed: colors.universal.textHint,
        },
      },
    },
    DatePicker: {
      panelColor: colors.universal.secondary, // 面板背景色
      panelTextColor: colors.universal.text, // 面板文字颜色
      itemTextColor: colors.universal.text, // 列表项文字颜色
      itemTextColorDisabled: colors.universal.textHint, // 列表项禁用文字颜色
      itemTextColorActive: colors.universal.background, // 列表项选中文字颜色
      itemColorHover: colors.universal.background, // 列表项悬浮背景颜色
      itemColorActive: colors.universal.primary, // 列表项悬浮背景颜色
      itemColorDisabled: colors.universal.background, // 列表项禁用背景颜色
      arrowColor: colors.universal.textHint, // 箭头颜色
      calendarTitleTextColor: colors.universal.text, // 日期标题文字颜色
      calendarTitleColorHover: colors.universal.background, // 日期标题悬浮背景色
      calendarDaysTextColor: colors.universal.background, // 星期文字颜色
      panelHeaderDividerColor: colors.universal.border, // 顶部分割线
      calendarDaysDividerColor: colors.universal.border, // 星期分割线
      panelActionDividerColor: colors.universal.border, // 底部分割线
      iconColor: colors.universal.text,
      iconColorDisabled: colors.universal.textHint,
    },
    TimePicker: {
      panelColor: colors.universal.secondary, // 面板背景色
      panelDividerColor: colors.universal.border, // 分割线颜色
      itemTextColor: colors.universal.text, // 列表项文字颜色
      itemTextColorActive: colors.universal.background, // 列表项选中文字颜色
      itemColorHover: colors.universal.primary, // 列表项悬浮背景颜色
      iconColor: colors.universal.text, // 图标颜色
      iconColorDisabled: colors.universal.textHint, // 图标禁用颜色
    },
  } as GlobalThemeOverrides
}
