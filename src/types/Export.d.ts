/**
 * 导出选项
 */
declare interface ExportOptions {
  textItems: boolean
  imageItems: boolean
  imageFiles: boolean
  fileItems: boolean
  tags: boolean
  itemTags: boolean
  settings: boolean
  shortcutKeys: boolean
  customTheme: boolean
  pluginsStore: boolean
  pluginsLocal: boolean
  pluginConfig: boolean
}

/**
 * 导出统计数据
 */
declare interface ExportStats {
  textCount: number
  imageCount: number
  imageSize: number
  fileCount: number
  tagCount: number
  itemTagCount: number
  modifiedSettingsCount: number
  modifiedShortcutCount: number
  customThemeModified: boolean
  pluginsStoreCount: number
  pluginsLocalCount: number
}

/**
 * 导出步骤
 */
declare interface ExportStep {
  key: string
  title: string
  status: 'process' | 'finish' | 'error' | 'wait'
}

/**
 * 导出数据
 */
declare interface ExportData {
  version: string
  exportTime: number
  options: ExportOptions
  data: {
    itemsText?: ClipboardItem[]
    itemsImage?: ClipboardItem[]
    itemsFile?: ClipboardItem[]
    tags?: TagItem[]
    itemTags?: { item_id: number; tag_id: number }[]
    settings?: Record<string, any>
    shortcutKeys?: Record<string, any>
    customTheme?: ThemeConfig
    pluginsStore?: LocalPlugin[]
    pluginsLocal?: LocalPlugin[]
    pluginConfig?: Record<string, any>
  }
}
