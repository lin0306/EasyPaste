import { reactive, ref } from 'vue'
import { setTransparency } from '../../../utils/ColorUtil.ts'

// 是否禁止主题色计算
export const forbidCalculate = ref(true)

export const themeConfig = reactive<ThemeColor>({
  universal: {
    primary: 'rgba(90,90,90,1)',
    secondary: 'rgba(255,255,255,1)',
    background: 'rgb(248,248,248)',
    delete: 'rgb(178, 20, 20)',
    text: 'rgb(83,83,83)',
    textHint: 'rgba(51,51,51,0.6)',
    border: 'rgba(48,48,48,0.09)',
  },
  button: {
    normal: {
      backgroundColor: 'rgb(218,218,218)',
      disabledBackgroundColor: 'rgb(161,161,161)',
      hoverBackgroundColor: 'rgb(209,209,209)',
      textColor: 'rgb(92,92,92)',
      disabledTextColor: 'rgba(81,81,81,0.75)',
      hoverTextColor: 'rgba(51,51,51,1)',
    },
    primary: {
      backgroundColor: 'rgb(255,255,255)',
      disabledBackgroundColor: 'rgb(245,245,245)',
      hoverBackgroundColor: 'rgb(255,255,255)',
      textColor: 'rgb(51,51,51)',
      disabledTextColor: 'rgba(51,51,51,0.6)',
      hoverTextColor: 'rgb(51,51,51)',
    },
    error: {
      backgroundColor: 'rgb(253,132,132)',
      disabledBackgroundColor: 'rgb(255,140,140)',
      hoverBackgroundColor: 'rgb(255,102,102)',
      textColor: 'rgb(230,230,230)',
      disabledTextColor: 'rgba(232,232,232,0.77)',
      hoverTextColor: 'rgba(255,255,255,1)',
    },
  },
  select: {
    options: {
      optionColorPending: 'rgb(255,255,255)',
      optionColorActive: 'rgb(255,255,255)',
      optionColorActivePending: 'rgb(255,255,255)',
    },
  },
  titleBar: {
    backgroundColor: 'rgb(239,239,239)',
    btnHoverBackgroundColor: 'rgb(225,225,225)',
    closeBtnHoverBackgroundColor: 'rgb(248,196,196)',
  },
  menuBar: {
    background: 'rgba(248,248,248,1)',
    itemActive: 'rgb(216,216,216)',
    itemHover: 'rgba(240,240,240,1)',
  },
  customCard: {
    background: 'rgb(244,244,244)',
    backgroundHover: 'rgb(232,232,232)',
  },
  wavesurfer: {
    waveColor: 'rgba(104,104,104, 1)',
    cursorColor: 'rgb(220,220,220)',
    progressColor: 'rgb(166,166,166)',
  },
  editor: {
    backgroundColor: 'rgb(255,255,255)',
    lineNumberBackgroundColor: 'rgb(241,241,241)',
    lineNumberBackgroundColorActive: 'rgb(255,255,255)',
  },
})

/**
 * 将预览主题应用到DOM
 * @param colors 主题颜色
 * @param suffix CSS变量后缀
 */
export function applyPreviewThemeToDOM(colors: ThemeColor, suffix: string = ''): void {
  const root = document.documentElement

  // 将主题颜色应用到CSS变量
  Object.entries(colors).forEach(([key, value]) => {
    // 判断值是否是字符串
    if (value && typeof value === 'string') {
      if (suffix) {
        root.style.setProperty(`--preview-${suffix}-${key}`, value as string)
      } else {
        root.style.setProperty(`--preview-${key}`, value as string)
      }
      if (key === 'textHint') {
        root.style.setProperty(`--preview-scrollbar`, setTransparency(value))
      }
      if (key === 'text') {
        root.style.setProperty(`--preview-scrollbar-hover`, setTransparency(value))
      }
    } else {
      // 递归处理嵌套对象
      applyPreviewThemeToDOM(value, suffix ? suffix + '-' + key : key)
    }
  })
}
