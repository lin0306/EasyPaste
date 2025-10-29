// 蓝色主题 - 更自然的蓝色调
export const blueTheme: ThemeConfig = {
    id: 'blue',
    name: '蓝色主题',
    colors: {
        universal: {
            primary: 'rgba(41,98,255,1)',
            secondary: 'rgba(255,255,255,1)',
            background: 'rgba(240,248,255,1)',
            hoverBackgroundColor: 'rgba(230,240,250,1)',
            disabledBackgroundColor: 'rgb(210,227,240)',
            text: 'rgba(24,51,93,1)',
            textHint: 'rgba(24,51,93,0.6)',
            textDelete: 'rgb(209, 85, 85)',
            textDisabled: 'rgba(24,51,93,0.6)',
            textHover: 'rgb(40, 83, 153)',
            border: 'rgba(41, 98, 255, 0.1)',
            borderHoverColor: 'rgba(127, 148, 192, 0.54)',
            borderDisabledColor: 'rgba(230,240,250,1)',
        },
        titleBar: {
            background: 'rgb(221,243,255)',
        },
        menu: {
            background: 'rgba(245,250,255,1)',
            itemActive: 'rgb(216,230,246)',
            itemHover: 'rgba(230,240,250,1)',
        },
        button: {
            normal: {
                backgroundColor: 'rgba(208,221,255,0.7)',
                disabledBackgroundColor: 'rgba(195,211,255,0.86)',
                hoverBackgroundColor: 'rgba(115,153,255,0.76)',
                textColor: 'rgba(255,255,255,1)',
                disabledTextColor: 'rgba(255,255,255,0.78)',
                hoverTextColor: 'rgb(255,255,255)',
            },
            primary: {
                backgroundColor: 'rgba(64,115,251,0.8)',
                disabledBackgroundColor: 'rgb(41,98,255)',
                hoverBackgroundColor: 'rgba(41,98,255,1)',
                textColor: 'rgba(255,255,255,1)',
                disabledTextColor: 'rgba(255,255,255,0.5)',
                hoverTextColor: 'rgba(255,255,255,1)',
            }
        },
        select: {
            options: {
                hoverBackgroundColor: 'rgb(219,231,241)',
                selectBackgroundColor: 'rgb(197,209,228)',
            }
        },
        scrollBar: {
            color: 'rgba(127, 148, 192, 0.54)',
            colorHover: 'rgba(49, 61, 84, 0.5)',
        },
        switch: {
            railColor: 'rgba(200,220,240,1)',
            railColorActive: 'rgba(127, 148, 192, 0.54)',
            buttonColor: 'rgba(87, 106, 146, 0.54)',
        },
        slider: {
            railColor: 'rgba(200,220,240,1)',
        },
        wavesurfer: {
            waveColor: 'rgb(74,97,147)',
            cursorColor: 'rgb(171,224,251)',
            progressColor: 'rgb(65,144,200)',
        },
        tooltip: {
            color: 'rgba(180,208,255,0.9)',
        }
    },
};