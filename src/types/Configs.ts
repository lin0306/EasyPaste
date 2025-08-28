interface Settings {
    theme: string,                      // 主题
    powerOnSelfStart: boolean,          // 开机自启
    replaceGlobalHotkey: boolean,       // 替换全局快捷键（仅限Windows）
    languages: string,                  // 语言
    maxHistoryItems: number,            // 最大历史记录数
    dataRetentionDays: number,          // 数据保留时长
    autoCheckUpdate: boolean,           // 自动检查更新
    updateMode: string,                 // 自动检查更新方式
    autoCheckUpdateInterval: number,    // 自动检查更新间隔
    enableTag: boolean,                 // 启用标签
    bindTagBtnShowLocation: string,     // 标签绑定按钮位置
    autoHideWindow: boolean,            // 自动隐藏窗口
    alwaysOnTop: boolean,               // 窗口是否始终置顶
    newVersionAlertMode: string,        // 检查到新版本提示方式
    enableAnimationEffects: boolean,    // 启用动画效果
    animationDuration: number,          // 动画持续时间（毫秒）
    animationSpeedLevel: string,        // 动画速度级别
}

interface ShortcutKeys {
    [x: string]: ShortcutKey;
    search: ShortcutKey;        // 搜索快捷键
    wakeUpRoutine: ShortcutKey; // 唤醒程序快捷键
}

interface ShortcutKey {
    name: string;
    key: string[];
}
