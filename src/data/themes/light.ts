// 默认主题 - 灰阶色调
export const lightTheme: ThemeConfig = {
    id: 'light',
    name: '浅色主题',
    colors: {
        universal: {
            primary: 'rgba(90,90,90,1)',
            secondary: 'rgba(255,255,255,1)',
            background: 'rgb(248,248,248)',
            delete: 'rgb(255,102,102)',
            text: 'rgb(83,83,83)',
            textHint: 'rgba(51,51,51,0.6)',
            border: 'rgba(48,48,48,0.09)',
        },
        button: {
            normal: {
                backgroundColor: 'rgb(218,218,218)',
                disabledBackgroundColor: 'rgb(161,161,161)',
                hoverBackgroundColor: 'rgb(143,143,143)',
                textColor: 'rgb(92,92,92)',
                disabledTextColor: 'rgba(81,81,81,0.75)',
                hoverTextColor: 'rgba(51,51,51,1)',
            },
            primary: {
                backgroundColor: 'rgb(92,92,92)',
                disabledBackgroundColor: 'rgba(43,43,43,0.85)',
                hoverBackgroundColor: 'rgba(25,25,25,0.86)',
                textColor: 'rgb(218,218,218)',
                disabledTextColor: 'rgba(232,232,232,0.77)',
                hoverTextColor: 'rgba(255,255,255,1)',
            },
            error: {
                backgroundColor: 'rgb(253,132,132)',
                disabledBackgroundColor: 'rgb(255,140,140)',
                hoverBackgroundColor: 'rgb(255,102,102)',
                textColor: 'rgb(230,230,230)',
                disabledTextColor: 'rgba(232,232,232,0.77)',
                hoverTextColor: 'rgba(255,255,255,1)',
            }
        },
        select: {
            options: {
                optionColorPending: 'rgb(230,230,230)',
                optionColorActive: 'rgb(216,216,216)',
                optionColorActivePending: 'rgb(216,216,216)',
            }
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
            background: 'rgb(255,255,255)',
            backgroundHover: 'rgb(240,240,240)',
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
    },
}