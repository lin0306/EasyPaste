// 粉色主题 - 更自然的粉色调
export const pinkTheme: ThemeConfig = {
    id: 'pink',
    name: '粉色主题',
    colors: {
        universal: {
            primary: 'rgba(219,112,147,1)',
            secondary: 'rgba(255,255,255,1)',
            background: 'rgba(253,245,250,1)',
            hoverBackgroundColor: 'rgba(248,230,240,1)',
            disabledBackgroundColor: 'rgba(240,210,225,1)',
            text: 'rgba(153,51,102,1)',
            textHint: 'rgba(153,51,102,0.6)',
            textDelete: 'rgb(255, 68, 68)',
            textDisabled: 'rgba(153,51,102,0.6)',
            textHover: 'rgb(198, 65, 132)',
            border: 'rgba(219, 112, 147, 0.1)',
            borderHoverColor: 'rgba(240,210,225,1)',
            borderDisabledColor: 'rgba(240,210,225,1)',
        },
        titleBar: {
            background: 'rgb(245,225,235)',
        },
        menu: {
            background: 'rgba(252,242,248,1)',
            itemActive: 'rgb(246,191,219)',
            itemHover: 'rgba(248,230,240,1)',
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
            }
        },
        select: {
            options: {
                hoverBackgroundColor: 'rgb(246,216,230)',
                selectBackgroundColor: 'rgb(225,193,209)',
            }
        },
        scrollBar: {
            color: 'rgba(144, 147, 153, 0.3)',
            colorHover: 'rgba(144, 147, 153, 0.5)',
        },
        switch: {
            railColor: 'rgb(249, 219, 234)',
            railColorActive: 'rgba(211, 122, 200, 0.38)',
            buttonColor: 'rgba(156, 100, 149, 0.38)',
        },
        slider: {
            railColor: 'rgba(240,210,225,1)',
        },
        wavesurfer: {
            waveColor: 'rgb(179,30,133)',
            cursorColor: 'rgb(236,129,188)',
            progressColor: 'rgb(197,110,153)',
        }
    },
};