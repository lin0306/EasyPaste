// 主题配置文件
declare interface ThemeConfig {
  [x: string]: any

  id: string
  name: string
  colors: ThemeColor
}

// 主题颜色配置
declare interface ThemeColor {
  [x: string]: any
  universal: {
    // 全局通用色
    primary: string // 主色调
    secondary: string // 次色调
    background: string // 背景色
    delete: string // 删除色
    text: string // 文本色
    textHint: string // 文本色（提示）
    border: string // 边框色
  }
  button: {
    // 按钮颜色
    normal: {
      // 普通按钮颜色
      backgroundColor: string // 普通按钮背景色
      disabledBackgroundColor: string // 普通按钮禁用背景色
      hoverBackgroundColor: string // 普通按钮悬浮背景色
      textColor: string // 普通按钮文字色
      disabledTextColor: string // 普通按钮禁用文字色
      hoverTextColor: string // 普通按钮悬浮文字色
    }
    primary: {
      // 主按钮颜色
      backgroundColor: string // 主按钮背景色
      disabledBackgroundColor: string // 主按钮禁用背景色
      hoverBackgroundColor: string // 主按钮悬浮背景色
      textColor: string // 主按钮文字色
      disabledTextColor: string // 主按钮禁用文字色
      hoverTextColor: string // 主按钮悬浮文字色
    }
    error: {
      // 异常按钮颜色
      backgroundColor: string // 异常按钮背景色
      disabledBackgroundColor: string // 异常按钮禁用背景色
      hoverBackgroundColor: string // 异常按钮悬浮背景色
      textColor: string // 异常按钮文字色
      disabledTextColor: string // 异常按钮禁用文字色
      hoverTextColor: string // 异常按钮悬浮文字色
    }
  }
  select: {
    // 下拉选择框颜色
    options: {
      // 选项颜色
      optionColorPending: string // 选项颜色（待选悬浮）
      optionColorActive: string // 选项颜色（选中）
      optionColorActivePending: string // 选项颜色（选中后悬浮）
    }
  }
  titleBar: {
    // 标题栏颜色
    backgroundColor: string // 背景色
    btnHoverBackgroundColor: string // 按钮悬浮背景色
    closeBtnHoverBackgroundColor: string // 关闭按钮悬浮背景色
  }
  menuBar: {
    background: string // 背景色
    itemActive: string // 菜单项选中色
    itemHover: string // 菜单项悬浮色
  }
  customCard: {
    // 自定义卡片颜色
    background: string // 背景色
    backgroundHover: string // 背景色（悬浮）
  }
  wavesurfer: {
    // 波形图颜色
    waveColor: string // 波形图波色
    cursorColor: string // 波形图光标色
    progressColor: string // 波形图进度色
  }
  editor: {
    // 编辑器颜色
    backgroundColor: string // 背景色
    lineNumberBackgroundColor: string // 行号背景色
    lineNumberBackgroundColorActive: string // 行号背景色（选中）
  }
}
