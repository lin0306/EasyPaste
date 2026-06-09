<script setup lang="ts">
import { onMounted } from 'vue'
import { NButton, NInput, NCheckbox } from 'naive-ui'
import { faFolderOpen } from '@fortawesome/free-regular-svg-icons'
import ExportForm from './components/ExportForm.vue'
import ExportProgress from './components/ExportProgress.vue'
import { useDataExport } from './composables/useDataExport'
import { currentLanguage } from '@/services/LanguageService.ts'

// 定义 emit 用于更新父组件（DefaultLayout）的 TitleBar 配置
defineEmits<{
  (e: 'update-title-config', config: any): void
}>()

const {
  options,
  hasSelected,
  selectAll,
  indeterminate,
  changeAll,
  stats,
  pageLoading,
  loadStats,
  exportPath,
  selectExportFolder,
  handleExport,
  cancelExport,
  exportModalVisible,
  exportSteps,
  resultModalVisible,
  resultZipPath,
  cancelling,
} = useDataExport()

onMounted(() => {
  loadStats()
})
</script>

<template>
  <div class="data-export-container">
    <!-- 内容滚动区 -->
    <div class="data-export-scroll-area">
      <ExportForm
        :options="options"
        :stats="stats"
        :page-loading="pageLoading"
        @update:options="Object.assign(options, $event)"
      />
    </div>

    <!-- 导出栏（固定在底部） -->
    <div class="export-footer">
      <div class="export-path-group">
        <NCheckbox
          :checked="selectAll"
          :indeterminate="indeterminate"
          :disabled="pageLoading"
          @update:checked="changeAll"
        />
        <span class="path-label">{{ currentLanguage.pages.dataExport.exportPath }}</span>
        <NInput :value="exportPath" readonly placeholder="" class="path-input">
          <template #suffix>
            <font-awesome-icon
              :icon="faFolderOpen"
              class="select-file-icon"
              @click="selectExportFolder"
            />
          </template>
        </NInput>
      </div>
      <NButton
        type="primary"
        :disabled="pageLoading || !hasSelected || !exportPath"
        @click="handleExport"
      >
        {{ currentLanguage.pages.dataExport.exportBtn }}
      </NButton>
    </div>

    <!-- 进度弹窗 -->
    <ExportProgress
      v-model:visible="exportModalVisible"
      v-model:result-visible="resultModalVisible"
      :steps="exportSteps"
      :result-path="resultZipPath"
      :cancelling="cancelling"
      @cancel="cancelExport"
    />
  </div>
</template>

<style scoped>
.data-export-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--theme-universal-background);
  color: var(--theme-universal-text);
  overflow: hidden;
}

.data-export-scroll-area {
  flex: 1;
  overflow-y: auto;
}

.export-footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background-color: var(--theme-custom-card-background);
  border-top: 1px solid var(--theme-universal-border);
  gap: 12px;
}

.export-path-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.path-label {
  font-size: 13px;
  white-space: nowrap;
  flex-shrink: 0;
}

.path-input {
  flex: 1;
  min-width: 0;
}

.select-file-icon {
  width: 16px;
  opacity: 0.65;
  cursor: pointer;
}

.select-file-icon:hover {
  opacity: 1;
}

:deep(.path-input .n-input-wrapper) {
  padding-right: 4px;
}
</style>
