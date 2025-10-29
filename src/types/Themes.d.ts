// 主题配置文件
declare interface ThemeConfig {
    [x: string]: any;

    id: string;
    name: string;
    colors: ThemeConfigColors;
}

// 颜色配置
declare interface ThemeConfigColors {
    universal: {                            // 全局通用色
        primary: string;                    // 主色
        secondary: string;                  // 次色
        background: string;                 // 背景色
        hoverBackgroundColor: string;       // 悬浮背景色
        disabledBackgroundColor: string;    // 禁用背景色
        text: string;                       // 文字色
        textHint: string;                   // 提示文字色
        textDelete: string;                 // 删除文字色
        textDisabled: string;               // 禁用文字色
        textHover: string;                  // 悬浮文字色
        border: string;                     // 边框色
        borderHoverColor: string;           // 边框悬浮色
        borderDisabledColor: string;        // 边框禁用色
    },
    titleBar: {                             // 标题栏颜色
        background: string;                 // 标题栏背景色
    },
    menu: {                                 // 菜单颜色
        background: string;                 // 背景色
        itemActive: string;                 // 菜单项选中色
        itemHover: string;                  // 菜单项悬浮色
    },
    button: {                               // 按钮颜色
        normal: {                           // 普通按钮颜色
            backgroundColor: string;        // 普通按钮背景色
            disabledBackgroundColor: string;// 普通按钮禁用背景色
            hoverBackgroundColor: string;   // 普通按钮悬浮背景色
            textColor: string;              // 普通按钮文字色
            disabledTextColor: string;      // 普通按钮禁用文字色
            hoverTextColor: string;         // 普通按钮悬浮文字色
        },
        primary: {                          // 主按钮颜色
            backgroundColor: string;        // 主按钮背景色
            disabledBackgroundColor: string;// 主按钮禁用背景色
            hoverBackgroundColor: string;   // 主按钮悬浮背景色
            textColor: string;              // 主按钮文字色
            disabledTextColor: string;      // 主按钮禁用文字色
            hoverTextColor: string;         // 主按钮悬浮文字色
        },
    },
    select: {                               // 下拉选择框颜色
        options: {                          // 选项颜色
            hoverBackgroundColor: string;   // 悬浮背景色
            selectBackgroundColor: string;  // 选中背景色
        }
    },
    scrollBar: {                            // 滚动条颜色
        color: string;                      // 滚动条色
        colorHover: string;                 // 滚动条悬浮色
    },
    switch: {                               // 开关颜色
        railColor: string;                  // 开关轨道色
        railColorActive: string;            // 开关选中轨道色
        buttonColor: string;                // 开关按钮色
    },
    slider: {                               // 滑块颜色
        railColor: string;                  // 滑块轨道色
    },
    wavesurfer: {
        waveColor: string;                  // 波形图波色
        cursorColor: string;                // 波形图光标色
        progressColor: string;              // 波形图进度色
    },
    tooltip: {
        color: string;                      // 提示框色
    }
}