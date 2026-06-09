import { computed, reactive, ref } from 'vue'
import { useDialog, useMessage } from 'naive-ui'
import { open } from '@tauri-apps/plugin-dialog'
import { invoke } from '@tauri-apps/api/core'
import { BaseDirectory, copyFile, mkdir, remove, stat, writeTextFile } from '@tauri-apps/plugin-fs'
import { appDataDir, join } from '@tauri-apps/api/path'
import { currentLanguage } from '@/services/LanguageService.ts'
import ClipboardDBService from '@/services/ClipboardDBService.ts'
import {
  defaultSettings,
  getImageBasePath,
  getPluginPath,
  isSettingsModified,
  SETTINGS_FILE_NAME,
} from '@/store/Settings.ts'
import {
  defaultShortcutKeys,
  isShortcutKeysModified,
  SHORTCUT_KEYS_FILE_NAME,
} from '@/store/ShortcutKeys.ts'
import {
  defaultCustomThemeConfig,
  isCustomThemeModified,
  THEME_FILE_NAME,
} from '@/store/CustomThemeConfig.ts'
import { isEqual } from 'lodash-es'
import { load } from '@tauri-apps/plugin-store'
import { copyFolder } from '@/utils/FileUtil.ts'

export function useDataExport() {
  const message = useMessage()
  const dialog = useDialog()

  // ========== 导出选项 ==========
  const options = reactive<ExportOptions>({
    textItems: false,
    imageItems: false,
    imageFiles: false,
    fileItems: false,
    tags: false,
    itemTags: false,
    settings: false,
    shortcutKeys: false,
    customTheme: false,
    pluginsStore: false,
    pluginsLocal: false,
    pluginConfig: false,
  })

  const allKeys = Object.keys(options) as (keyof ExportOptions)[]

  const hasSelected = computed<boolean>(() => allKeys.some(k => options[k]))

  const selectAll = computed<boolean>(() => {
    return (
      options.textItems === true &&
      options.imageItems === true &&
      options.imageFiles === true &&
      options.fileItems === true &&
      options.tags === true &&
      options.itemTags === true &&
      options.settings === true &&
      options.shortcutKeys === true &&
      options.customTheme === true &&
      options.pluginsStore === true &&
      options.pluginsLocal === true &&
      options.pluginConfig === true
    )
  })

  const indeterminate = computed<boolean>(() => {
    const someSelected = allKeys.some(k => options[k])
    return someSelected && !selectAll.value
  })

  function changeAll(value: boolean) {
    allKeys.forEach(k => {
      options[k] = value
    })
  }

  // ========== 统计数据 ==========
  const stats = reactive<ExportStats>({
    textCount: 0,
    imageCount: 0,
    imageSize: 0,
    fileCount: 0,
    tagCount: 0,
    itemTagCount: 0,
    modifiedSettingsCount: 0,
    modifiedShortcutCount: 0,
    customThemeModified: false,
    pluginsStoreCount: 0,
    pluginsLocalCount: 0,
  })

  const pageLoading = ref(true)

  // ========== 导出路径 ==========
  const exportPath = ref('')

  // ========== 进度 ==========
  const exportModalVisible = ref(false)
  const exportSteps = ref<ExportStep[]>([])

  // ========== 结果 ==========
  const resultModalVisible = ref(false)
  const resultZipPath = ref('')

  // ========== 取消 ==========
  const cancelling = ref(false)
  let isCancelled = false
  let collectedData: ExportData | null = null

  // ========== 统计数据加载 ==========
  async function loadStats(): Promise<void> {
    pageLoading.value = true
    try {
      const db = await ClipboardDBService.getInstance()

      const [
        textCount,
        imageCount,
        fileCount,
        tagCount,
        itemTagCount,
        settingsMod,
        shortcutMod,
        themeMod,
        pluginsStoreCount,
        pluginsLocalCount,
      ] = await Promise.all([
        db.getTextItemCount(),
        db.getImageItemCount(),
        db.getFileItemCount(),
        db.getAllTags().then(tags => tags?.length || 0),
        db.getItemTagCount(),
        isSettingsModified(),
        isShortcutKeysModified(),
        isCustomThemeModified(),
        db.getStorePluginCount(),
        db.getLocalPluginCount(),
      ])

      stats.textCount = textCount
      stats.imageCount = imageCount
      stats.fileCount = fileCount
      stats.tagCount = tagCount
      stats.itemTagCount = itemTagCount
      stats.modifiedSettingsCount = settingsMod.count
      stats.modifiedShortcutCount = shortcutMod.count
      stats.customThemeModified = themeMod
      stats.pluginsStoreCount = pluginsStoreCount
      stats.pluginsLocalCount = pluginsLocalCount

      // 计算图片总大小
      if (imageCount > 0) {
        const imageItems = await db.getAllItemsByType('image')
        let totalSize = 0
        for (const item of imageItems) {
          if (item.file_path) {
            try {
              const fileStat = await stat(item.file_path)
              totalSize += fileStat.size
            } catch {
              // 忽略无法读取的文件
            }
          }
        }
        stats.imageSize = totalSize
      }
    } catch (e) {
      console.error('加载导出统计数据失败:', e)
    } finally {
      pageLoading.value = false
    }
  }

  // ========== 步骤生成 ==========
  function generateSteps(): ExportStep[] {
    const steps: ExportStep[] = []
    if (options.textItems) {
      steps.push({
        key: 'textItems',
        title: currentLanguage.value.pages.dataExport.stepTextItems,
        status: 'wait',
      })
    }
    if (options.fileItems) {
      steps.push({
        key: 'fileItems',
        title: currentLanguage.value.pages.dataExport.stepFileItems,
        status: 'wait',
      })
    }
    if (options.tags) {
      steps.push({
        key: 'tags',
        title: currentLanguage.value.pages.dataExport.stepTags,
        status: 'wait',
      })
    }
    if (options.itemTags) {
      steps.push({
        key: 'itemTags',
        title: currentLanguage.value.pages.dataExport.stepItemTags,
        status: 'wait',
      })
    }
    if (options.settings) {
      steps.push({
        key: 'settings',
        title: currentLanguage.value.pages.dataExport.stepSettings,
        status: 'wait',
      })
    }
    if (options.shortcutKeys) {
      steps.push({
        key: 'shortcutKeys',
        title: currentLanguage.value.pages.dataExport.stepShortcutKeys,
        status: 'wait',
      })
    }
    if (options.customTheme) {
      steps.push({
        key: 'customTheme',
        title: currentLanguage.value.pages.dataExport.stepCustomTheme,
        status: 'wait',
      })
    }
    if (options.pluginsStore) {
      steps.push({
        key: 'pluginsStore',
        title: currentLanguage.value.pages.dataExport.stepPluginsStore,
        status: 'wait',
      })
    }
    if (options.pluginsLocal) {
      steps.push({
        key: 'pluginsLocal',
        title: currentLanguage.value.pages.dataExport.stepPluginsLocal,
        status: 'wait',
      })
    }
    if (options.imageItems) {
      steps.push({
        key: 'imageItems',
        title: currentLanguage.value.pages.dataExport.stepImageItems,
        status: 'wait',
      })
      if (options.imageFiles) {
        steps.push({
          key: 'imageFiles',
          title: currentLanguage.value.pages.dataExport.stepImageFiles,
          status: 'wait',
        })
      }
    }
    if (options.pluginsLocal) {
      steps.push({
        key: 'pluginsLocalFile',
        title: currentLanguage.value.pages.dataExport.stepPluginsLocalFile,
        status: 'wait',
      })
    }
    if (options.pluginConfig) {
      steps.push({
        key: 'pluginConfig',
        title: currentLanguage.value.pages.dataExport.stepPluginConfig,
        status: 'wait',
      })
    }

    steps.push({
      key: 'compress',
      title: currentLanguage.value.pages.dataExport.stepCompress,
      status: 'wait',
    })
    return steps
  }

  // ========== 配置读取 ==========
  async function getModifiedSettings(): Promise<Record<string, any> | undefined> {
    const store = await load(SETTINGS_FILE_NAME, { defaults: {}, autoSave: true })
    const modified: Record<string, any> = {}
    for (const key of Object.keys(defaultSettings)) {
      const value = await store.get<any>(key)
      if (value !== undefined && value !== null && !isEqual(value, (defaultSettings as any)[key])) {
        modified[key] = value
      }
    }
    return Object.keys(modified).length > 0 ? modified : undefined
  }

  async function getModifiedShortcutKeys(): Promise<Record<string, any> | undefined> {
    const store = await load(SHORTCUT_KEYS_FILE_NAME, { defaults: {}, autoSave: true })
    const modified: Record<string, any> = {}
    for (const key of Object.keys(defaultShortcutKeys)) {
      const value = await store.get<any>(key)
      if (
        value !== undefined &&
        value !== null &&
        !isEqual(value, (defaultShortcutKeys as any)[key])
      ) {
        modified[key] = value
      }
    }
    return Object.keys(modified).length > 0 ? modified : undefined
  }

  async function getCustomThemeConfig(): Promise<ThemeConfig | undefined> {
    try {
      const { readTextFile } = await import('@tauri-apps/plugin-fs')
      const content = await readTextFile(THEME_FILE_NAME, { baseDir: BaseDirectory.AppData })
      const data = JSON.parse(content)
      if (!isEqual(data, defaultCustomThemeConfig)) {
        return data
      }
    } catch {
      // 文件不存在或读取失败
    }
    return undefined
  }

  function startHandle(key: string) {
    exportSteps.value.forEach(step => {
      if (step.key === key) {
        step.status = 'process'
      }
    })
  }

  function finishHandle(key: string) {
    exportSteps.value.forEach(step => {
      if (step.key === key) {
        step.status = 'finish'
      }
    })
  }

  // ========== 数据收集 ==========
  async function collectExportData(): Promise<ExportData> {
    const db = await ClipboardDBService.getInstance()
    checkCancelled()
    const data: ExportData = {
      version: '0.3.0',
      exportTime: Date.now(),
      options: { ...options },
      data: {},
    }

    if (options.textItems) {
      startHandle('textItems')
      const items = await db.getAllItemsByTypes(['text', 'code', 'link'])
      checkCancelled()
      data.data.itemsText = items.map(
        item =>
          ({
            id: item.id,
            content: item.content,
            link_title: item.link_title,
            chars: item.chars,
            copy_time: item.copy_time,
            is_topped: item.is_topped,
            top_time: item.top_time,
            type: item.type,
          }) as ClipboardItem
      )
      finishHandle('textItems')
    }

    if (options.imageItems) {
      startHandle('imageItems')
      const items = await db.getAllItemsByType('image')
      checkCancelled()
      const imageBasePath = await getImageBasePath()
      data.data.itemsImage = items.map(
        item =>
          ({
            id: item.id,
            copy_time: item.copy_time,
            is_topped: item.is_topped,
            top_time: item.top_time,
            type: item.type,
            file_path: imageBasePath
              ? item.file_path.replace(imageBasePath, '').replace(/^[\\/]/, '')
              : item.file_path,
          }) as ClipboardItem
      )
      finishHandle('imageItems')
    }

    if (options.fileItems) {
      startHandle('fileItems')
      const items = await db.getAllItemsByType('file')
      checkCancelled()
      data.data.itemsFile = items.map(
        item =>
          ({
            id: item.id,
            copy_time: item.copy_time,
            is_topped: item.is_topped,
            top_time: item.top_time,
            type: item.type,
            file_path: item.file_path,
          }) as ClipboardItem
      )
      finishHandle('fileItems')
    }

    if (options.tags) {
      startHandle('tags')
      const tags = await db.getAllTags()
      checkCancelled()
      data.data.tags = tags || []
      finishHandle('tags')
    }

    if (options.itemTags) {
      startHandle('itemTags')
      const relations = await db.getAllItemTags()
      checkCancelled()
      data.data.itemTags = relations || []
      finishHandle('itemTags')
    }

    if (options.settings) {
      startHandle('settings')
      const settings = await getModifiedSettings()
      checkCancelled()
      if (settings) {
        data.data.settings = settings
      }
      finishHandle('settings')
    }

    if (options.shortcutKeys) {
      startHandle('shortcutKeys')
      const shortcuts = await getModifiedShortcutKeys()
      checkCancelled()
      if (shortcuts) {
        data.data.shortcutKeys = shortcuts
      }
      finishHandle('shortcutKeys')
    }

    if (options.customTheme) {
      startHandle('customTheme')
      const theme = await getCustomThemeConfig()
      checkCancelled()
      if (theme) {
        data.data.customTheme = theme
      }
      finishHandle('customTheme')
    }

    if (options.pluginsStore) {
      startHandle('pluginsStore')
      const plugins = await db.getStorePlugins()
      checkCancelled()
      data.data.pluginsStore = plugins || []
      finishHandle('pluginsStore')
    }

    if (options.pluginsLocal) {
      startHandle('pluginsLocal')
      const plugins = await db.getLocalPlugins()
      checkCancelled()
      data.data.pluginsLocal = plugins || []
      finishHandle('pluginsLocal')
    }

    return data
  }

  // ========== 取消 ==========
  function checkCancelled(): void {
    if (isCancelled) throw new Error('CANCELLED')
  }

  function cancelExport(): void {
    isCancelled = true
    cancelling.value = true
  }

  // ========== 文件夹选择 ==========
  async function selectExportFolder(): Promise<void> {
    const selected = await open({
      directory: true,
      multiple: false,
    })
    if (selected) {
      exportPath.value = selected
    }
  }

  // ========== 执行导出 ==========
  async function handleExport(): Promise<void> {
    if (!hasSelected.value) {
      message.warning(currentLanguage.value.pages.dataExport.noItemSelected)
      return
    }

    if (!exportPath.value) {
      message.warning(currentLanguage.value.pages.dataExport.noExportPath)
      return
    }

    // 检查 zip 是否已存在
    const zipPath = await join(exportPath.value, 'easypaste.zip')
    try {
      await stat(zipPath)
      const confirmed = await new Promise<boolean>(resolve => {
        dialog.warning({
          title: currentLanguage.value.pages.dataExport.overwriteTitle,
          content: currentLanguage.value.pages.dataExport.overwriteContent,
          positiveText: currentLanguage.value.pages.dataExport.overwriteConfirm,
          negativeText: currentLanguage.value.pages.dataExport.overwriteCancel,
          onPositiveClick: () => resolve(true),
          onNegativeClick: () => resolve(false),
        })
      })
      if (!confirmed) return
    } catch {
      // 文件不存在，继续
    }

    // 重置取消状态
    exportSteps.value = generateSteps()
    exportModalVisible.value = true
    isCancelled = false
    cancelling.value = false

    let tempDirPath = ''

    try {
      // 收集数据
      checkCancelled()
      collectedData = await collectExportData()
      checkCancelled()

      // 创建临时目录
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
      const tempDirName = `easypaste_${timestamp}`
      tempDirPath = await join(exportPath.value, tempDirName)
      await mkdir(tempDirPath)
      checkCancelled()

      // 写入 data.json
      const dataJsonPath = await join(tempDirPath, 'data.json')
      await writeTextFile(dataJsonPath, JSON.stringify(collectedData, null, 2))
      checkCancelled()

      // 拷贝图片文件
      if (options.imageItems && options.imageFiles && collectedData.data.itemsImage) {
        startHandle('imageFiles')
        const imagesDir = await join(tempDirPath, 'images')
        await mkdir(imagesDir)
        const imageBasePath = await getImageBasePath()
        for (const item of collectedData.data.itemsImage) {
          if (item.file_path) {
            try {
              checkCancelled()
              const sourcePath = imageBasePath
                ? await join(imageBasePath, item.file_path)
                : item.file_path
              const destPath = await join(imagesDir, item.file_path)
              await copyFile(sourcePath, destPath)
            } catch {
              // 忽略拷贝失败（取消异常已在 checkCancelled 中抛出）
            }
          }
        }
        finishHandle('imageFiles')
      }

      // 拷贝本地插件包体
      if (options.pluginsLocal && collectedData.data.pluginsLocal) {
        startHandle('pluginsLocalFile')
        const pluginsDir = await join(tempDirPath, 'plugins')
        await mkdir(pluginsDir)
        checkCancelled()
        const baseFolder = await getPluginPath()
        for (let plugin of collectedData.data.pluginsLocal) {
          checkCancelled()
          const pluginId = plugin.plugin_id
          const pluginFolder = await join(baseFolder, pluginId)
          console.log(
            '正在处理插件',
            pluginId,
            pluginFolder,
            await join(pluginsDir, pluginId + '.zip')
          )
          await invoke('compress_folder_to_zip', {
            sourceDir: pluginFolder,
            outputPath: await join(pluginsDir, pluginId + '.zip'),
          })
          checkCancelled()
        }
        finishHandle('pluginsLocalFile')
      }

      // 拷贝插件配置数据
      if (options.pluginConfig) {
        startHandle('pluginConfig')
        const pluginsConfigDir = await join(tempDirPath, 'pluginsConfigs')
        await mkdir(pluginsConfigDir)
        checkCancelled()
        const configPath = await join(await appDataDir(), 'plugins')
        await copyFolder(configPath, pluginsConfigDir)
        checkCancelled()
        finishHandle('pluginConfig')
      }

      // 压缩
      startHandle('compress')
      await invoke('compress_folder_to_zip', {
        sourceDir: tempDirPath,
        outputPath: zipPath,
      })
      finishHandle('compress')
      checkCancelled()

      // 删除临时目录
      await remove(tempDirPath, { recursive: true })
      tempDirPath = ''

      // 完成
      exportSteps.value.push({
        key: 'done',
        title: currentLanguage.value.pages.dataExport.stepDone,
        status: 'finish',
      })
      finishHandle('done')
      resultZipPath.value = zipPath

      setTimeout(() => {
        // exportModalVisible.value = false
        // resultModalVisible.value = true
      }, 500)
    } catch (e) {
      // 清理临时目录
      if (tempDirPath) {
        try {
          await remove(tempDirPath, { recursive: true })
        } catch {}
      }

      if (isCancelled) {
        try {
          await remove(zipPath)
        } catch {}
        message.info(currentLanguage.value.pages.dataExport.exportCancelled)
      } else {
        console.error('导出失败:', e)
        message.error('导出失败: ' + String(e))
      }
      exportModalVisible.value = false
    } finally {
      cancelling.value = false
      isCancelled = false
    }
  }

  return {
    // 选项
    options,
    hasSelected,
    selectAll,
    indeterminate,
    changeAll,
    // 统计
    stats,
    pageLoading,
    loadStats,
    // 路径
    exportPath,
    selectExportFolder,
    // 执行
    handleExport,
    cancelExport,
    // 进度
    exportModalVisible,
    exportSteps,
    // 结果
    resultModalVisible,
    resultZipPath,
    // 取消状态
    cancelling,
  }
}
