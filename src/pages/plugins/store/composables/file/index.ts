import { DownloadHandler } from '@/pages/plugins/store/composables/file/handlers/DownloadHandler.ts'
import { ExtractHandler } from '@/pages/plugins/store/composables/file/handlers/ExtractHandler.ts'
import { getPluginPath } from '@/store/Settings.ts'
import { join } from '@tauri-apps/api/path'
import { DBHandler } from '@/pages/plugins/store/composables/file/handlers/DBHandler.ts'
import { LoadingHandler } from '@/pages/plugins/store/composables/file/handlers/LoadingHandler.ts'
import { EventHandler } from '@/pages/plugins/store/composables/file/handlers/EventHandler.ts'
import { currentLanguage, loadPluginLanguage } from '@/services/LanguageService.ts'
import { MessageApiInjection } from 'naive-ui/es/message/src/MessageProvider'
import { BackupHandler } from '@/pages/plugins/store/composables/file/handlers/BackupHandler.ts'
import { DeleteBackupHandler } from '@/pages/plugins/store/composables/file/handlers/DeleteBackupHandler.ts'
import { loadingMap, loadLocalPlugins, } from '@/pages/plugins/store/composables/PluginComponsables.ts'
import { renameFolder } from '@/utils/FileUtil.ts'
import { invoke } from '@tauri-apps/api/core'
import { emit } from '@tauri-apps/api/event'
import { UninstallHandler } from '@/pages/plugins/store/composables/file/handlers/UninstallHandler.ts'
import { VerifyZipHandler } from '@/pages/plugins/store/composables/file/handlers/VerifyZipHandler.ts'
import { DialogApiInjection } from 'naive-ui/es/dialog/src/DialogProvider'
import { PluginHandlerContext } from '@/pages/plugins/store/composables/file/types'
import { exists, mkdir } from '@tauri-apps/plugin-fs'

/**
 * 安装插件
 * @param plugin 插件信息
 * @param message 消息
 */
export async function installPlugin(plugin: StorePlugin, message: MessageApiInjection) {
  console.log('开始安装插件', plugin)
  const handler = new DownloadHandler() // 下载文件
  handler
    .setNext(new ExtractHandler()) // 解压文件
    .setNext(new DBHandler()) // 保存数据库
    .setNext(new LoadingHandler()) // 加载插件
    .setNext(new EventHandler()) // 发送安装插件广播通知所有窗口

  const configDir = await getPluginPath()
  if (!await exists(configDir)) {
    await mkdir(configDir, { recursive: true })
  }
  const zipPath = await join(configDir, plugin.fileName)
  const folderPath = await join(configDir, plugin.id)

  const context = {
    mode: 'install',
    plugin: plugin,
    localFolderPath: folderPath,
    localZipPath: zipPath,
    success: true,
    message,
  } as PluginHandlerContext

  await handler.handle(context)

  if (!context.success) {
    message.error(currentLanguage.value.pages.pluginStore.installFailedHint)
    return
  }

  message.success(
    currentLanguage.value.pages.pluginStore.installSuccessHint.replace('${pluginName}', plugin.name)
  )
}

/**
 * 安装本地插件
 * @param zipPath 压缩包文件路径
 * @param message 消息
 * @param dialog 对话框
 */
export async function installPluginByLocal(
  zipPath: string,
  message: MessageApiInjection,
  dialog: DialogApiInjection
) {
  // 解压压缩文件
  console.log('开始安装本地插件', zipPath)
  const handler = new VerifyZipHandler() // 验证压缩包文件
  handler
    .setNext(new EventHandler()) // 发送卸载插件广播通知所有窗口（如果有）
    .setNext(new BackupHandler()) // 备份旧的插件（如果有）
    .setNext(new ExtractHandler()) // 解压文件
    .setNext(new DBHandler()) // 保存数据库
    .setNext(new LoadingHandler()) // 加载插件
    .setNext(new EventHandler()) // 发送安装插件广播通知所有窗口
    .setNext(new DeleteBackupHandler()) // 删除备份的插件（如果有）

  const configDir = await getPluginPath()

  const context = {
    mode: 'installLocal',
    localFolderPath: configDir,
    localZipPath: zipPath,
    success: true,
    message,
    onGlobalError: resetBackUp(),
    dialog,
  } as unknown as PluginHandlerContext

  await handler.handle(context)
  loadingMap.value.delete(context.plugin.id)

  if (!context.success) {
    message.error(currentLanguage.value.pages.pluginStore.installFailedHint)
    return
  }

  message.success(
    currentLanguage.value.pages.pluginStore.installSuccessHint.replace(
      '${pluginName}',
      context.plugin.name
    )
  )

  return context.plugin.id
}

/**
 * 更新插件
 * @param pluginId 插件ID
 * @param plugin 插件信息
 * @param message 消息
 */
export async function updatePlugin(
  pluginId: number,
  plugin: StorePlugin,
  message: MessageApiInjection
) {
  console.log('开始更新插件', plugin)
  const handler = new EventHandler() // 备份旧的文件
  handler
    .setNext(new BackupHandler()) // 发送卸载插件广播通知所有窗口
    .setNext(new DownloadHandler()) // 下载最新版的压缩文件
    .setNext(new ExtractHandler()) // 解压文件
    .setNext(new DBHandler()) // 更新数据库
    .setNext(new LoadingHandler()) // 重新加载插件信息
    .setNext(new EventHandler()) // 发送安装插件广播通知所有窗口
    .setNext(new DeleteBackupHandler()) // 删除备份文件

  const configDir = await getPluginPath()
  const zipPath = await join(configDir, plugin.fileName)
  const folderPath = await join(configDir, plugin.id)

  const context = {
    mode: 'update',
    pluginId: pluginId,
    plugin: plugin,
    localFolderPath: folderPath,
    localZipPath: zipPath,
    success: true,
    message,
    onGlobalError: resetBackUp(),
  } as unknown as PluginHandlerContext

  await handler.handle(context)

  if (!context.success) {
    message.error(currentLanguage.value.pages.pluginStore.updateFailedHint)
    return
  }

  message.success(
    currentLanguage.value.pages.pluginStore.updateSuccessHint.replace('${pluginName}', plugin.name)
  )
}

/**
 * 卸载插件
 * @param plugin 插件信息
 * @param message 消息
 */
export async function uninstallPlugin(plugin: LocalPlugin, message: MessageApiInjection) {
  console.log('开始卸载插件')
  loadingMap.value.set(plugin.plugin_id, 'uninstalling')

  const handler = new EventHandler() // 发送卸载插件广播通知所有窗口
  handler
    .setNext(new DBHandler()) // 删除数据库数据
    .setNext(new UninstallHandler()) // 删除文件
    .setNext(new LoadingHandler()) // 加载插件

  const configDir = await getPluginPath()
  const folderPath = await join(configDir, plugin.plugin_id)
  console.log('卸载插件', folderPath, handler)

  const context = {
    mode: 'uninstall',
    pluginId: plugin.id,
    plugin: { id: plugin.plugin_id },
    localFolderPath: folderPath,
    success: true,
    message,
  } as PluginHandlerContext

  await handler.handle(context)

  if (!context.success) {
    message.error(currentLanguage.value.pages.pluginStore.uninstallFailedHint)
    return
  }

  message.success(currentLanguage.value.pages.pluginStore.uninstallSuccessHint)
}

/**
 * 重置备份
 */
function resetBackUp() {
  return async (error: unknown, context: PluginHandlerContext) => {
    if (context.pluginId) {
      console.error('插件更新失败，正在回滚', error)
      loadingMap.value.set(context.plugin.id, 'resetBackingUp')
      // 恢复插件
      renameFolder(context.localFolderPath + '_back', context.localFolderPath)
      // 后端载入插件的语言
      await invoke('load_plugin_locales', { pluginId: context.plugin.id })
      // 前端获取插件的语言
      await loadPluginLanguage()
      // 重新加载插件
      await loadLocalPlugins()
      await emit('install-plugin', { pluginId: context.plugin.id })
      context.message.error(currentLanguage.value.pages.pluginStore.updateFailedHint)
    }
  }
}
