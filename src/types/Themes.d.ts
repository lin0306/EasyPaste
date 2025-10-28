// 主题配置文件
declare interface ThemeConfig {
    [x: string]: any;

    id: string;
    name: string;
    colors: ThemeConfigColors;
}

// 颜色配置
declare interface ThemeConfigColors {
    primary: string;                        // 主色调
    secondary: string;                      // 次色调
    background: string;                     // 背景色
    text: string;                           // 文字色
    textHint: string;                       // 提示文字色
    textDelete: string;                     // 删除文字色
    textDisabled: string;                   // 禁用文字色
    border: string;                         // 边框色
    titleBarBackground: string;             // 标题栏背景色
    titleBarIconColor: string;              // 标题栏图标色
    navBackground: string;                  // 导航栏背景色  
    cardBackground: string;                 // 卡片背景色
    hoverBackground: string;                // 悬浮背景色
    divider: string;                        // 分割线色
    tagColor: string;                       // 标签色
    tagTextColor: string;                   // 标签文字色
    scrollBarColor: string;                 // 滚动条色
    scrollBarColorHover: string;            // 滚动条悬浮色
    menuItemBackground: string;             // 菜单项背景色
    menuItemHover: string;                  // 菜单项悬浮色
    menuItemTextColor: string;              // 菜单项文字色
    menuItemTextActive: string;             // 菜单项选中项文字色
    menuItemTextHover: string;              // 菜单项悬浮文字色
    switchRailColor: string;                // 开关关闭状态下的轨道色
    switchRailColorActive: string;          // 开关选中状态下的轨道色
    switchButtonColor: string;              // 开关按钮色
    dialogTitleTextColor: string;           // 对话框标题文字色
    dialogTextColor: string;                // 对话框文字色
    dialogColor: string;                    // 对话框背景色
    dialogIconColor: string;                // 对话框图标色
    dialogCloseIconColor: string;           // 对话框关闭图标色
    dialogCloseIconColorHover: string;      // 对话框关闭图标悬浮图标色
    dialogCloseColorHover: string;          // 对话框关闭按钮悬浮背景色
    togglePanelBtnBackgroundColor: string;  // 切换按钮背景色
    oscillogramWaveColor: string;           // 波形图波色
    oscillogramCursorColor: string;         // 波形图光标色
    oscillogramProgressColor: string;       // 波形图进度色
    sliderRailColor: string;                // 滑块轨道色
    button: {                               // 按钮颜色
        normal: {
            backgroundColor: string;        // 普通按钮背景色
            disabledBackgroundColor: string;// 普通按钮禁用背景色
            hoverBackgroundColor: string;   // 普通按钮悬浮背景色
            textColor: string;              // 普通按钮文字色
            disabledTextColor: string;      // 普通按钮禁用文字色
            hoverTextColor: string;         // 普通按钮悬浮文字色
        },
        primary: {
            backgroundColor: string;        // 主按钮背景色
            disabledBackgroundColor: string;// 主按钮禁用背景色
            hoverBackgroundColor: string;   // 主按钮悬浮背景色
            textColor: string;              // 主按钮文字色
            disabledTextColor: string;      // 主按钮禁用文字色
            hoverTextColor: string;         // 主按钮悬浮文字色
        },
    },
    select: {                               // 下拉选择框颜色
        input: {
            borderColor: string;            // 边框色
            hoverBorderColor: string;       // 边框悬浮色
            disabledBackgroundColor: string;// 禁用背景色
            disabledBorderColor: string;    // 禁用边框色
        },
        options: {
            disabledBackgroundColor: string;// 禁用背景色
            hoverBackgroundColor: string;   // 悬浮背景色
            selectBackgroundColor: string;  // 选中背景色
        }
    },
}