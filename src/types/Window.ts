export interface WindowOptions {
    label: string,                  // 窗口唯一label
    title?: string,                 // 窗口标题
    url: string,                    // 路由地址url
    width: number,                  // 窗口宽度
    height: number,                 // 窗口高度
    minWidth?: number | undefined,  // 窗口最小宽度
    minHeight?: number | undefined, // 窗口最小高度
    maxWidth?: number | undefined,  // 窗口最大宽度
    maxHeight?: number | undefined, // 窗口最大高度
    x?: number | undefined,         // 窗口相对于屏幕左侧坐标
    y?: number | undefined,         // 窗口相对于屏幕顶端坐标
    center?: boolean,               // 窗口居中显示
    maximized?: boolean,            // 是否最大化窗口
    decorations?: boolean,          // 是否窗口是否装饰边框及导航条
    alwaysOnTop?: boolean,          // 是否置顶窗口
    dragDropEnabled?: boolean,      // 是否启用系统拖放
    visible?: boolean,              // 是否显示窗口
    focus?: boolean,                // 是否聚焦窗口
    resizable?: boolean,            // 是否允许窗口调整大小
}