import { invoke } from '@tauri-apps/api/core'
import { loadingMap, localPlugins } from '@/pages/plugins/store/composables/PluginComponsables.ts'
import { BaseHandler } from '../BaseHandler'
import { currentLanguage } from '@/services/LanguageService.ts'
import { join } from '@tauri-apps/api/path'
import { stat } from '@tauri-apps/plugin-fs'
import { isMac } from '@/data/SystemParams.ts'
import { PluginHandlerContext } from '@/pages/plugins/store/composables/file/types'

/**
 * 本地压缩文件处理
 */
export class VerifyZipHandler extends BaseHandler {
  public async doHandle(context: PluginHandlerContext): Promise<void> {
    console.log(`正在验证本地插件，[${context.localZipPath}]...`)
    try {
      // 读取zip文件内容
      const content = await invoke<string>('read_zip_content', {
        zipPath: context.localZipPath,
        fileName: 'manifest.json',
      })
      if (!content) {
        context.success = false
        context.message.error(currentLanguage.value.pages.pluginStore.localInstallNoManifestHint)
        return
      }
      const manifest = JSON.parse(content)
      console.log('插件清单:', manifest)
      // 验证必要的字段
      if (!manifest.id || !manifest.name || !manifest.version || !manifest.platform) {
        context.message.error(
          currentLanguage.value.pages.pluginStore.localInstallInvalidManifestHint
        )
        context.success = false
        return
      }
      // 验证平台是否一致
      if (manifest.platform !== 'General') {
        if (manifest.platform === 'Windows' && isMac) {
          context.message.error(
            currentLanguage.value.pages.pluginStore.localInstallInstallPlatformNotMatchHint
              .replace('${current}', isMac ? 'MacOS' : 'Windows')
              .replace('${requirement}', manifest.platform)
          )
          context.success = false
          return
        }
      }
      // 验证本地是否安装，版本检测
      const pluginId = manifest.id
      console.log('获取到插件id', pluginId)
      context.localFolderPath = await join(context.localFolderPath, pluginId)
      const existingPlugin = localPlugins.value.find(p => p.plugin_id === pluginId)
      if (existingPlugin) {
        console.log('插件已存在，检查版本', existingPlugin.version, manifest.version)

        // 比较版本号
        const compareResult = compareVersion(manifest.version, existingPlugin.version)

        if (compareResult <= 0) {
          console.log('已安装的版本相同或已安装更新的版本，不进行安装')
          // 新版本 <= 当前版本，不安装
          if (compareResult === 0) {
            context.message.warning(
              currentLanguage.value.pages.pluginStore.localInstallSameVersionHint
                .replace('${pluginName}', manifest.name)
                .replace('${version}', manifest.version)
            )
          } else {
            context.message.warning(
              currentLanguage.value.pages.pluginStore.localInstallOldVersionHint
                .replace('${pluginName}', manifest.name)
                .replace('${newVersion}', manifest.version)
                .replace('${currentVersion}', existingPlugin.version)
            )
          }
          return
        }

        // 新版本 > 当前版本，询问用户是否替换
        const shouldReplace = await new Promise<boolean>(resolve => {
          context.dialog.warning({
            title: currentLanguage.value.pages.pluginStore.localInstallUpdateTitle,
            content: currentLanguage.value.pages.pluginStore.localInstallUpdateContent
              .replace('${pluginName}', manifest.name)
              .replace('${oldVersion}', existingPlugin.version)
              .replace('${newVersion}', manifest.version),
            positiveText: currentLanguage.value.pages.pluginStore.localInstallUpdateConfirmBtn,
            negativeText: currentLanguage.value.pages.pluginStore.localInstallUpdateCancelBtn,
            onPositiveClick: () => resolve(true),
            onNegativeClick: () => resolve(false),
            onClose: () => resolve(false),
          })
        })

        if (!shouldReplace) {
          console.log('用户取消了更新')
          return
        }
        context.pluginId = existingPlugin.id
        loadingMap.value.set(existingPlugin.plugin_id, 'updating')
      }

      // 获取文件信息
      const state = await stat(context.localZipPath)
      context.plugin = {
        id: pluginId,
        name: manifest.name,
        branch: 'GA',
        version: manifest.version,
        description: manifest.description || '',
        platform: manifest.platform || '',
        fileName: manifest.fileName || '',
        releaseUrl: manifest.releaseUrl || '',
        downloadUrl: manifest.downloadUrl || '',
        size: state.size,
      } as StorePlugin
    } catch (error) {
      console.error(`[${context.plugin.id}]插件下载异常:`, error)
      context.success = false
      return
    }
    loadingMap.value.set('local-file-install', 'unzipping')
    console.log(`[${context.plugin.id}]插件验证完成，传递给下一个处理器...`)
  }
}

/**
 * 比较版本号
 * @param version1 版本号1
 * @param version2 版本号2
 * @returns 1: version1 > version2, -1: version1 < version2, 0: version1 === version2
 */
function compareVersion(version1: string, version2: string): number {
  const v1Parts = version1.split('.').map(Number)
  const v2Parts = version2.split('.').map(Number)
  const maxLength = Math.max(v1Parts.length, v2Parts.length)

  for (let i = 0; i < maxLength; i++) {
    const v1 = v1Parts[i] || 0
    const v2 = v2Parts[i] || 0

    if (v1 > v2) return 1
    if (v1 < v2) return -1
  }

  return 0
}
