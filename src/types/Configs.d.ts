declare interface Settings {
    // 程序设置
    powerOnSelfStart: boolean,          // 开机自启
    languages: string,                  // 语言
    replaceGlobalHotkey: boolean,       // 替换全局快捷键（仅限Windows）
    // 主窗口设置
    autoHideWindow: boolean,            // 自动隐藏窗口
    autoGoToLatestData: boolean,        // 自动跳转到最新数据
    alwaysOnTop: boolean,               // 窗口是否始终置顶
    displayThumbnailImage: boolean,    // 显示缩略图图片
    // 标签设置
    enableTag: boolean,                 // 启用标签
    bindTagBtnShowLocation: string,     // 标签绑定按钮位置
    tagListLocation: string,            // 标签列表位置
    // 主题设置
    theme: string,                      // 主题
    enableAnimationEffects: boolean,    // 启用动画效果
    animationDuration: number,          // 动画持续时间（毫秒）
    animationSpeedLevel: string,        // 动画速度级别
    // 更新设置
    autoCheckUpdate: boolean,           // 自动检查更新
    updateMode: string,                 // 自动检查更新方式
    autoCheckUpdateInterval: number,    // 自动检查更新间隔
    newVersionAlertMode: string,        // 检查到新版本提示方式
    // 存储设置
    maxHistoryItems: number,            // 最大历史记录数
    dataRetentionDays: number,          // 数据保留时长
}

declare interface ShortcutKeys {
    [x: string]: ShortcutKey;
    search: ShortcutKey;        // 搜索快捷键
    wakeUpRoutine: ShortcutKey; // 唤醒程序快捷键
    quickPaste: ShortcutKey;    // 快速粘贴快捷键
}

declare interface ShortcutKey {
    name: string;
    key: string[];
}
