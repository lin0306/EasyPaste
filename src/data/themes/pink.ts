// 粉色主题 - 更自然的粉色调
export const pinkTheme: ThemeConfig = {
    id: 'pink',
    name: '粉色主题',
    colors: {
        universal: {
            primary: 'rgba(219,112,147,1)',
            secondary: 'rgba(255,255,255,1)',
            background: 'rgba(253,245,250,1)',
            delete: 'rgb(255, 68, 68)',
            text: 'rgba(153,51,102,1)',
            textHint: 'rgba(153,51,102,0.6)',
            border: 'rgba(219, 112, 147, 0.1)',
        },
        button: {
            normal: {
                backgroundColor: 'rgba(219,112,147,0.07)',
                disabledBackgroundColor: 'rgba(219, 112, 147, 0.1)',
                hoverBackgroundColor: 'rgba(219,112,147,0.25)',
                textColor: 'rgba(153,51,102,0.7)',
                disabledTextColor: 'rgba(153,51,102,0.6)',
                hoverTextColor: 'rgba(153,51,102,1)',
            },
            primary: {
                backgroundColor: 'rgba(219, 112, 147, 1)',
                disabledBackgroundColor: 'rgb(219,112,147)',
                hoverBackgroundColor: 'rgb(177,94,122)',
                textColor: 'rgba(255,255,255,1)',
                disabledTextColor: 'rgba(255,255,255,0.71)',
                hoverTextColor: 'rgba(255,255,255,1)',
            },
            error: {
                backgroundColor: 'rgb(255,99,99)',
                disabledBackgroundColor: 'rgb(209,47,47)',
                hoverBackgroundColor: 'rgb(255, 68, 68)',
                textColor: 'rgb(255,255,255)',
                disabledTextColor: 'rgba(236,236,236,0.71)',
                hoverTextColor: 'rgb(255,255,255)',
            }
        },
        select: {
            options: {
                optionColorPending: 'rgb(246,216,230)',
                optionColorActive: 'rgb(225,193,209)',
                optionColorActivePending: 'rgb(225,193,209)',
            }
        },
        titleBar: {
            backgroundColor: 'rgb(245,225,235)',
            btnHoverBackgroundColor: 'rgb(243,205,223)',
            closeBtnHoverBackgroundColor: 'rgb(255,136,136)',
        },
        menuBar: {
            background: 'rgba(252,242,248,1)',
            itemActive: 'rgb(246,191,219)',
            itemHover: 'rgba(248,230,240,1)',
        },
        customCard: {
          background: 'rgb(255,255,255)',
          backgroundHover: 'rgb(245,225,235)',
        },
        wavesurfer: {
            waveColor: 'rgb(179,30,133)',
            cursorColor: 'rgb(236,129,188)',
            progressColor: 'rgb(197,110,153)',
        },
        editor: {
            backgroundColor: 'rgb(251,242,242)',
            lineNumberBackgroundColor: 'rgb(246,229,229)',
            lineNumberBackgroundColorActive: 'rgb(253,244,244)',
        }
    },
};