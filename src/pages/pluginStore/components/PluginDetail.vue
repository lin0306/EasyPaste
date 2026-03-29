<script setup lang="ts">
import {
  clearSelectPlugin,
  getLatestVersion,
  getLocalVersion,
  hasUpdate,
  install,
  isInstall,
  loadingSet,
  selectedPlugin,
  tabValue,
  togglePluginEnable,
  uninstall,
  update,
} from '../composables/PluginComponsables.ts'
import { useMessage } from 'naive-ui'
import { currentLanguage } from '../../../services/LanguageService.ts'
import ButtonGroup from '../../../components/ButtonGroup.vue'
import { computed, ref, watch } from 'vue'
import { loadPluginManifest } from '../../../services/PluginService.ts'
import PluginSettings from './PluginSettings.vue'

const message = useMessage()

// 判断是否支持设置功能
const hasSettings = ref(false)

// 检查插件是否支持设置
async function checkSettingsSupport(pluginId: string | undefined) {
  if (!pluginId) {
    hasSettings.value = false
    return
  }
  try {
    const manifest = await loadPluginManifest(pluginId)
    const hasSettingsFeature = manifest.features?.some((f: any) => f.type === 'settings') || false
    hasSettings.value = hasSettingsFeature
    console.log(`插件 ${pluginId} 支持设置:`, hasSettingsFeature)
  } catch (e) {
    console.error(`检查插件 ${pluginId} 设置支持失败:`, e)
    hasSettings.value = false
  }
}

// 监听选中插件变化，检查是否支持设置
watch(
  () => selectedPlugin?.plugin_id,
  (pluginId) => {
    checkSettingsSupport(pluginId)
  },
  { immediate: true, flush: 'post' }
)

// 设置弹窗状态
const settingsVisible = ref(false)
const settingsTitle = ref('')

// 打开设置
function openSettings() {
  settingsTitle.value = selectedPlugin.plugin_name + ' ' + currentLanguage.value.pages.pluginStore.settingsBtn
  settingsVisible.value = true
}

/**
 * 加载按钮组内容
 */
const btnOptions = computed(() => [
  {
    key: 'update',
    label: currentLanguage.value.pages.pluginStore.updateBtn,
    onClick: () => update(selectedPlugin.plugin_id, message),
    show: hasUpdate(selectedPlugin.plugin_id),
  },
  {
    key: 'disable',
    label: currentLanguage.value.pages.pluginStore.disableBtn,
    onClick: () => togglePluginEnable(selectedPlugin.plugin_id, false),
    show: selectedPlugin.enable === 1,
  },
  {
    key: 'enable',
    label: currentLanguage.value.pages.pluginStore.enableBtn,
    onClick: () => togglePluginEnable(selectedPlugin.plugin_id, true),
    show: selectedPlugin.enable === 0,
  },
  {
    key: 'settings',
    label: currentLanguage.value.pages.pluginStore.settingsBtn,
    onClick: () => openSettings(),
    show: selectedPlugin.enable === 1 && hasSettings.value,
  },
  {
    key: 'uninstall',
    label: currentLanguage.value.pages.pluginStore.unInstallBtn,
    onClick: () => onUninstall(),
    danger: true,
    show: true,
  },
])

/**
 * 卸载插件
 */
async function onUninstall(): Promise<void> {
  await uninstall(selectedPlugin.plugin_id, message)
  clearSelectPlugin()
}
</script>

<template>
  <div class="plugin-detail" v-if="selectedPlugin && selectedPlugin.id">
    <div class="plugin-detail-main">
      <div class="plugin-detail-main-left">
        <div class="plugin-detail-main-title">
          <div class="plugin-detail-main-name">
            {{ selectedPlugin.plugin_name }}
          </div>
          <div class="plugin-detail-main-platform">
            {{
              selectedPlugin.platform === 'General'
                ? currentLanguage.pages.pluginStore.pluginPlatformGeneral
                : selectedPlugin.platform === 'Windows'
                  ? currentLanguage.pages.pluginStore.pluginPlatformWindows
                  : currentLanguage.pages.pluginStore.pluginPlatformMac
            }}
          </div>
        </div>
        <div class="plugin-detail-main-version">
          <font-awesome-icon :icon="['fas', 'version']" class="plugin-detail-main-version-icon" />
          <span v-if="hasUpdate(selectedPlugin.plugin_id)">
            {{
              (tabValue === 'local'
                ? selectedPlugin.version
                : getLocalVersion(selectedPlugin.plugin_id)) +
              '  → ' +
              getLatestVersion(selectedPlugin.plugin_id)
            }}
          </span>
          <span v-else>{{ selectedPlugin.version }}</span>
        </div>
      </div>
      <div class="plugin-detail-main-right">
        <n-progress
          type="line"
          :show-indicator="false"
          processing
          :percentage="100"
          v-if="loadingSet.has(selectedPlugin.plugin_id)"
        />
        <n-button
          round
          size="small"
          type="primary"
          v-if="
            !loadingSet.has(selectedPlugin.plugin_id) &&
            tabValue === 'store' &&
            !isInstall(selectedPlugin.plugin_id)
          "
          @click="install(selectedPlugin.plugin_id, message)"
        >
          {{ currentLanguage.pages.pluginStore.installBtn }}
        </n-button>
        <button-group
          :data="btnOptions"
          v-if="!loadingSet.has(selectedPlugin.plugin_id) && isInstall(selectedPlugin.plugin_id)"
        />
      </div>
    </div>
    <div class="plugin-detail-description">{{ selectedPlugin.description }}</div>
    <!-- 设置弹窗 -->
    <plugin-settings
      v-model:visible="settingsVisible"
      :plugin-id="selectedPlugin.plugin_id"
      :title="settingsTitle"
    />
  </div>
  <div class="plugin-detail not-select-plugin" v-else>
    {{ currentLanguage.pages.pluginStore.detailNoPluginHint }}
  </div>
</template>

<style scoped>
.plugin-detail {
  width: 50%;
  height: 100%;
}

.not-select-plugin {
  display: flex;
  align-items: center;
  justify-content: center;
}

.plugin-detail-main {
  display: flex;
  border-bottom: 1px solid var(--theme-universal-border);
  padding: 8px;
  height: 100px;
}

.plugin-detail-main-left {
  width: 70%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.plugin-detail-main-title {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.plugin-detail-main-name {
  font-size: 26px;
  font-weight: 700;
}

.plugin-detail-main-platform {
  font-size: 12px;
}

.plugin-detail-main-version {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
}

.plugin-detail-main-version-icon {
  width: 16px;
  height: 16px;
}

.plugin-detail-main-right {
  width: 30%;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
}

.plugin-detail-description {
  padding: 8px;
  font-size: 14px;
}
</style>
