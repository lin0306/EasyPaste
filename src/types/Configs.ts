interface Settings {
    theme: string,
    powerOnSelfStart: boolean,
    replaceGlobalHotkey: boolean,
    languages: string,
    maxHistoryItems: number,
    maxStorageSize: number,
    dataRetentionDays: number,
    maxItemSize: number,
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
