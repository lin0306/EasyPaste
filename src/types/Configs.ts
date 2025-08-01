interface Settings {
    theme: string,                  // 主题
    powerOnSelfStart: boolean,      // 开机自启
    replaceGlobalHotkey: boolean,   // 替换全局快捷键（仅限Windows）
    languages: string,              // 语言
    maxHistoryItems: number,        // 最大历史记录数
    dataRetentionDays: number,      // 数据保留时长
    autoCheckUpdate: boolean,       // 自动检查更新
    updateMode: string,             // 自动检查更新方式
    autoCheckUpdateInterval: number, // 自动检查更新间隔
    enableTag: boolean,             // 启用标签
    bindTagBtnShowLocation: string, // 标签绑定按钮位置
}

interface ShortcutKeys {
    search: {
        name: string,
        key: string[]
    },
    wakeUpRoutine: {
        name: string,
        key: string[]
    }
}
