// 深色主题 - 灰阶色调
export const darkTheme: ThemeConfig = {
  id: 'dark',
  name: '深色主题',
  colors: {
    universal: {
      primary: 'rgba(90,90,90,1)',
      secondary: 'rgba(35,35,35,1)',
      background: 'rgba(20,20,20,1)',
      delete: 'rgb(243, 57, 57)',
      text: 'rgb(188,188,188)',
      textHint: 'rgba(230,230,230,0.49)',
      border: 'rgba(253, 253, 253, 0.12)',
    },
    button: {
      normal: {
        backgroundColor: 'rgb(46,46,46)',
        disabledBackgroundColor: 'rgb(23,23,23)',
        hoverBackgroundColor: 'rgb(86,86,86)',
        textColor: 'rgb(142,142,142)',
        disabledTextColor: 'rgb(154,154,154)',
        hoverTextColor: 'rgb(174,174,174)',
      },
      primary: {
        backgroundColor: 'rgb(129,129,129)',
        disabledBackgroundColor: 'rgb(80,80,80)',
        hoverBackgroundColor: 'rgb(156,156,156)',
        textColor: 'rgb(189,189,189)',
        disabledTextColor: 'rgb(177,177,177)',
        hoverTextColor: 'rgb(211,211,211)',
      },
      error: {
        backgroundColor: 'rgb(131,55,55)',
        disabledBackgroundColor: 'rgb(66,66,66)',
        hoverBackgroundColor: 'rgb(131,55,55)',
        textColor: 'rgb(166,166,166)',
        disabledTextColor: 'rgb(177,177,177)',
        hoverTextColor: 'rgb(191,191,191)',
      },
    },
    select: {
      options: {
        optionColorPending: 'rgb(64,64,64)',
        optionColorActive: 'rgb(126,126,126)',
        optionColorActivePending: 'rgb(126,126,126)',
      },
    },
    titleBar: {
      backgroundColor: 'rgb(53,53,53)',
      btnHoverBackgroundColor: 'rgb(106,106,106)',
      closeBtnHoverBackgroundColor: 'rgb(131,55,55)',
    },
    menuBar: {
      background: 'rgba(28,28,28,1)',
      itemActive: 'rgb(64,64,64)',
      itemHover: 'rgba(45,45,45,1)',
    },
    customCard: {
      background: 'rgba(53,53,53,0.5)',
      backgroundHover: 'rgb(64,64,64)',
    },
    wavesurfer: {
      waveColor: 'rgb(83,83,83)',
      cursorColor: 'rgb(163,163,163)',
      progressColor: 'rgb(50,50,50)',
    },
    editor: {
      backgroundColor: 'rgb(35,35,35)',
      lineNumberBackgroundColor: 'rgb(53,53,53)',
      lineNumberBackgroundColorActive: 'rgb(35,35,35)',
    },
  },
}
