// 蓝色主题 - 更自然的蓝色调
export const blueTheme: ThemeConfig = {
  id: 'blue',
  name: '蓝色主题',
  colors: {
    universal: {
      primary: 'rgba(41,98,255,1)',
      secondary: 'rgba(255,255,255,1)',
      background: 'rgba(240,248,255,1)',
      delete: 'rgb(209, 85, 85)',
      text: 'rgba(24,51,93,1)',
      textHint: 'rgba(24,51,93,0.6)',
      border: 'rgba(41, 98, 255, 0.1)',
    },
    button: {
      normal: {
        backgroundColor: 'rgba(194, 211, 255, 1)',
        disabledBackgroundColor: 'rgba(195,211,255,0.86)',
        hoverBackgroundColor: 'rgba(85, 129, 255, 0.85)',
        textColor: 'rgba(76, 121, 181, 0.72)',
        disabledTextColor: 'rgba(79, 117, 167, 0.78)',
        hoverTextColor: 'rgba(51, 79, 118, 1)',
      },
      primary: {
        backgroundColor: 'rgba(64, 115, 251, 0.92)',
        disabledBackgroundColor: 'rgb(41,98,255)',
        hoverBackgroundColor: 'rgba(41,98,255,1)',
        textColor: 'rgba(255,255,255,1)',
        disabledTextColor: 'rgba(255,255,255,0.5)',
        hoverTextColor: 'rgba(255,255,255,1)',
      },
      error: {
        backgroundColor: 'rgb(255,124,124)',
        disabledBackgroundColor: 'rgb(255,140,140)',
        hoverBackgroundColor: 'rgb(255,102,102)',
        textColor: 'rgba(255,255,255,1)',
        disabledTextColor: 'rgba(255,255,255,0.5)',
        hoverTextColor: 'rgba(255,255,255,1)',
      },
    },
    select: {
      options: {
        optionColorPending: 'rgb(219,231,241)',
        optionColorActive: 'rgb(197,209,228)',
        optionColorActivePending: 'rgb(197,209,228)',
      },
    },
    titleBar: {
      backgroundColor: 'rgb(221,243,255)',
      btnHoverBackgroundColor: 'rgb(213,229,248)',
      closeBtnHoverBackgroundColor: 'rgb(237,210,210)',
    },
    menuBar: {
      background: 'rgba(245,250,255,1)',
      itemActive: 'rgb(216,230,246)',
      itemHover: 'rgba(230,240,250,1)',
    },
    customCard: {
      background: 'rgba(245,250,255,1)',
      backgroundHover: 'rgba(230,240,250,1)',
    },
    wavesurfer: {
      waveColor: 'rgb(74,97,147)',
      cursorColor: 'rgb(171,224,251)',
      progressColor: 'rgb(65,144,200)',
    },
    editor: {
      backgroundColor: 'rgba(240,248,255,1)',
      lineNumberBackgroundColor: 'rgb(231,238,244)',
      lineNumberBackgroundColorActive: 'rgb(245,250,255)',
    },
  },
}
