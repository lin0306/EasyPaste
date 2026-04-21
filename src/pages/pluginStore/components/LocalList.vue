<script setup lang="ts">
import {
  hasUpdate,
  installFromLocalFile,
  loadingMap,
  localListLoading,
  localPlugins,
  onSelectLocal,
  selectedPlugin,
  tabValue,
  togglePluginEnable,
  update,
} from '../composables/PluginComponsables.ts'
import { useDialog, useMessage } from 'naive-ui'
import { themeColors } from '../../../services/ThemeService.ts'
import { currentLanguage } from '../../../services/LanguageService.ts'
import { faCubes, faFileImport } from '@fortawesome/free-solid-svg-icons'
import { faApple, faWindows } from '@fortawesome/free-brands-svg-icons'
import { computed } from 'vue'

const message = useMessage()
const dialog = useDialog()

const tagColor = computed(() => {
  return { color: themeColors.value.universal.border, textColor: themeColors.value.universal.text }
})

/**
 * 插件更新
 * @param plugin 本地插件
 */
const onUpdate = async (plugin: LocalPlugin): Promise<void> => {
  onSelectLocal(plugin)
  await update(plugin.plugin_id, message)
}

/**
 * 从本地文件安装插件
 */
const onInstallFromLocal = async (): Promise<void> => {
  await installFromLocalFile(message, dialog)
}
</script>

<template>
  <div class="plugin-list">
    <!-- 本地安装按钮 -->
    <div class="local-install-bar">
      <n-button round size="small" type="primary" @click="onInstallFromLocal">
        <template #icon>
          <font-awesome-icon :icon="faFileImport" />
        </template>
        {{ currentLanguage.pages.pluginStore.localInstallBtn }}
      </n-button>
    </div>
    <div v-if="localListLoading" class="loading">
      <n-spin size="large" />
    </div>
    <div
      v-else-if="localPlugins && localPlugins.length > 0"
      class="plugin-item"
      v-for="plugin in localPlugins"
      :key="plugin.id"
      :class="{ 'item-selected': selectedPlugin && selectedPlugin.id === plugin.id }"
      @click="onSelectLocal(plugin)"
    >
      <div class="plugin-item-icon">
        <font-awesome-icon :icon="faCubes" class="plugin-icon" />
      </div>
      <div class="plugin-item-content">
        <div class="plugin-title">
          <div class="plugin-name">{{ plugin.plugin_name }}</div>
          <n-tag
            round
            :bordered="false"
            size="small"
            v-if="plugin.platform !== 'General'"
            :color="tagColor"
          >
            <span v-if="plugin.platform === 'Windows'">Windows</span>
            <span v-if="plugin.platform === 'Mac'">Mac</span>
            <template #avatar>
              <font-awesome-icon
                :icon="faWindows"
                v-if="plugin.platform === 'Windows'"
                class="platform-icon"
              />
              <font-awesome-icon
                :icon="faApple"
                v-if="plugin.platform === 'Mac'"
                class="platform-icon"
              />
            </template>
          </n-tag>
        </div>
        <div class="plugin-info">
          <div class="plugin-version">
            <font-awesome-icon :icon="['fas', 'version']" class="version-icon" />
            {{ plugin.version }}
          </div>
        </div>
      </div>
      <div class="plugin-item-btn">
        <n-progress
          type="line"
          :show-indicator="false"
          processing
          :percentage="100"
          v-if="loadingMap.has(plugin.plugin_id)"
        />
        <n-button
          round
          ghost
          size="small"
          v-else-if="hasUpdate(plugin.plugin_id)"
          @click="onUpdate(plugin)"
        >
          {{ currentLanguage.pages.pluginStore.updateBtn }}
        </n-button>
        <n-button
          round
          size="small"
          v-else-if="plugin.enable === 1"
          @click="togglePluginEnable(plugin.plugin_id, false)"
        >
          {{ currentLanguage.pages.pluginStore.disableBtn }}
        </n-button>
        <n-button round size="small" v-else @click="togglePluginEnable(plugin.plugin_id, true)">
          {{ currentLanguage.pages.pluginStore.enableBtn }}
        </n-button>
      </div>
    </div>
    <div v-else class="no-plugins-container">
      <n-button text @click="tabValue = 'store'">
        {{ currentLanguage.pages.pluginStore.localNoPluginHint }}
      </n-button>
    </div>
  </div>
</template>

<style scoped>
.loading {
  display: flex;
  width: 100%;
  height: 100vh;
  align-content: center;
  justify-content: center;
}

.local-install-bar {
  padding: 10px;
  border-bottom: 1px solid var(--theme-universal-border);
  display: flex;
  justify-content: center;
}
</style>
