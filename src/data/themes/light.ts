// 默认主题 - 灰阶色调
export const lightTheme: ThemeConfig = {
    id: 'light',
    name: '浅色主题',
    colors: {
        universal: {
            primary: 'rgba(90,90,90,1)',
            secondary: 'rgba(255,255,255,1)',
            background: 'rgb(248,248,248)',
            hoverBackgroundColor: 'rgb(236,236,236)',
            disabledBackgroundColor: 'rgb(216,216,216)',
            text: 'rgb(83,83,83)',
            textHint: 'rgba(51,51,51,0.6)',
            textDelete: 'rgb(178, 20, 20)',
            textDisabled: 'rgba(51,51,51,0.6)',
            textHover: 'rgba(144, 147, 153, 0.5)',
            border: 'rgba(48,48,48,0.09)',
            borderHoverColor: 'rgb(163,163,163)',
            borderDisabledColor: 'rgb(230,230,230)',
        },
        titleBar: {
            background: 'rgb(239,239,239)',
        },
        menu: {
            background: 'rgba(248,248,248,1)',
            itemActive: 'rgb(216,216,216)',
            itemHover: 'rgba(240,240,240,1)',
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
                backgroundColor: 'rgb(92,92,92)',
                disabledBackgroundColor: 'rgba(43,43,43,0.85)',
                hoverBackgroundColor: 'rgba(25,25,25,0.86)',
                textColor: 'rgb(218,218,218)',
                disabledTextColor: 'rgba(232,232,232,0.77)',
                hoverTextColor: 'rgba(255,255,255,1)',
            }
        },
        select: {
            options: {
                hoverBackgroundColor: 'rgb(230,230,230)',
                selectBackgroundColor: 'rgb(216,216,216)',
            }
        },
        scrollBar: {
            color: 'rgba(144, 147, 153, 0.3)',
            colorHover: 'rgba(144, 147, 153, 0.5)',
        },
        switch: {
            railColor: 'rgba(144, 147, 153, 0.3)',
            railColorActive: 'rgba(144, 147, 153, 0.5)',
            buttonColor: 'rgba(255,255,255,1)',
        },
        slider: {
            railColor: 'rgba(144, 147, 153, 0.3)',
        },
        wavesurfer: {
            waveColor: 'rgba(104,104,104, 1)',
            cursorColor: 'rgb(220,220,220)',
            progressColor: 'rgb(166,166,166)',
        },
        tooltip: {
            color: 'rgb(244,244,244)',
        }
    },
}