<script setup lang="ts">
import { convertFileSize } from '../../../utils/FileUtil.ts'
import {
  hasUpdate,
  install,
  isInstall,
  loadingMap,
  onSelectStore,
  pluginStore,
  selectedPlugin,
  storeListLoading,
  update,
} from '../composables/PluginComponsables.ts'
import { useMessage } from 'naive-ui'
import { currentLanguage } from '../../../services/LanguageService.ts'
import { faCubes } from '@fortawesome/free-solid-svg-icons'
import { faApple, faWindows } from '@fortawesome/free-brands-svg-icons'
import { computed } from 'vue'
import { themeColors } from '../../../services/ThemeService.ts'

const message = useMessage()

const tagColor = computed(() => {
  return { color: themeColors.value.universal.border, textColor: themeColors.value.universal.text }
})

const onInstall = async (plugin: StorePlugin): Promise<void> => {
  await install(plugin.id, message)
}

const onUpdate = async (plugin: StorePlugin): Promise<void> => {
  await update(plugin.id, message)
}
</script>

<template>
  <div class="plugin-list">
    <div v-if="storeListLoading" class="loading">
      <n-spin size="large" />
    </div>
    <div
      v-else-if="pluginStore && pluginStore.length > 0"
      class="plugin-item"
      v-for="plugin in pluginStore"
      :key="plugin.id"
      :class="{ 'item-selected': selectedPlugin && selectedPlugin.pluginId === plugin.id }"
      @click="onSelectStore(plugin)"
    >
      <div class="plugin-item-icon">
        <font-awesome-icon :icon="faCubes" class="plugin-icon" />
      </div>
      <div class="plugin-item-content">
        <div class="plugin-title">
          <div class="plugin-name">{{ plugin.name }}</div>
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
          <div class="plugin-size">{{ convertFileSize(plugin.size) }}</div>
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
          v-if="loadingMap.has(plugin.id)"
        />
        <n-button
          round
          ghost
          size="small"
          v-else-if="hasUpdate(plugin.id)"
          @click="onUpdate(plugin)"
        >
          {{ currentLanguage.pages.pluginStore.updateBtn }}
        </n-button>
        <n-button
          round
          size="small"
          type="primary"
          v-else-if="!isInstall(plugin.id)"
          @click="onInstall(plugin)"
        >
          {{ currentLanguage.pages.pluginStore.installBtn }}
        </n-button>
        <n-button round text size="small" disabled v-else>
          {{ currentLanguage.pages.pluginStore.installedBtn }}
        </n-button>
      </div>
    </div>
    <div v-else class="no-plugins-container">
      {{ currentLanguage.pages.pluginStore.storeNoPluginHint }}
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
</style>
