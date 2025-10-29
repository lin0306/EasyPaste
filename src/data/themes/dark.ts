// 深色主题 - 灰阶色调
export const darkTheme: ThemeConfig = {
    id: 'dark',
    name: '深色主题',
    colors: {
        universal: {
            primary: 'rgba(90,90,90,1)',
            secondary: 'rgba(35,35,35,1)',
            background: 'rgba(20,20,20,1)',
            hoverBackgroundColor: 'rgba(45,45,45,1)',
            disabledBackgroundColor: 'rgba(240,210,225,1)',
            text: 'rgba(230,230,230,1)',
            textHint: 'rgba(230,230,230,0.6)',
            textDelete: 'rgb(243, 57, 57)',
            textHover: 'rgba(144, 147, 153, 0.5)',
            textDisabled: 'rgba(230,230,230,0.6)',
            border: 'rgba(253, 253, 253, 0.12)',
            borderHoverColor: 'rgb(35,35,35)',
            borderDisabledColor: 'rgb(35,35,35)',
        },
        titleBar: {
            background: 'rgb(53,53,53)',
        },
        menu: {
            background: 'rgba(28,28,28,1)',
            itemActive: 'rgb(64,64,64)',
            itemHover: 'rgba(45,45,45,1)',
        },
        button: {
            normal: {
                backgroundColor: 'rgb(35,35,35)',
                disabledBackgroundColor: 'rgb(23,23,23)',
                hoverBackgroundColor: 'rgb(66,66,66)',
                textColor: 'rgb(96,96,96)',
                disabledTextColor: 'rgb(154,154,154)',
                hoverTextColor: 'rgb(151,151,151)',
            },
            primary: {
                backgroundColor: 'rgb(67,67,67)',
                disabledBackgroundColor: 'rgba(35,35,35,1)',
                hoverBackgroundColor: 'rgb(99,99,99)',
                textColor: 'rgb(166,166,166)',
                disabledTextColor: 'rgb(177,177,177)',
                hoverTextColor: 'rgb(191,191,191)',
            },
        },
        select: {
            options: {
                hoverBackgroundColor: 'rgb(64,64,64)',
                selectBackgroundColor: 'rgb(126,126,126)',
            }
        },
        scrollBar: {
            color: 'rgba(255, 255, 255, 0.3)',
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
            waveColor: 'rgb(83,83,83)',
            cursorColor: 'rgb(163,163,163)',
            progressColor: 'rgb(50,50,50)',
        }
    },
};