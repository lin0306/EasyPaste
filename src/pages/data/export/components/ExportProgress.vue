<script setup lang="ts">
import { NModal, NSteps, NStep, NButton, NSpin } from 'naive-ui'
import { currentLanguage } from '@/services/LanguageService.ts'
import { invoke } from '@tauri-apps/api/core'

const props = defineProps<{
  visible: boolean
  steps: ExportStep[]
  resultVisible: boolean
  resultPath: string
  cancelling?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'update:resultVisible', val: boolean): void
  (e: 'cancel'): void
}>()

const isProcess = computed(() => {
  if (props.cancelling) {
    return false
  }
  for (let step of props.steps) {
    if (step.status !== 'finish') {
      return true
    }
  }
})

async function openResultFolder() {
  if (props.resultPath) {
    await invoke('open_folder', { path: props.resultPath })
  }
}
</script>

<template>
  <!-- 步骤条弹窗 -->
  <NModal
    preset="card"
    :show="visible"
    :mask-closable="false"
    :closable="false"
    style="width: 80%"
    :auto-focus="false"
    :title="currentLanguage.pages.dataExport.title"
    @update:show="emit('update:visible', $event)"
  >
    <div class="steps-modal-content">
      <NSteps vertical size="small">
        <NStep v-for="step in steps" :key="step.key" :status="step.status">
          <template #icon>
            <NSpin v-if="step.status === 'process'" :size="14" class="step-spin" />
          </template>
          <template #title>
            <span>{{ step.title }}</span>
          </template>
        </NStep>
      </NSteps>
    </div>
    <template #footer v-if="isProcess">
      <div class="cancel-row">
        <NButton size="small" :loading="cancelling" @click="emit('cancel')">
          {{ currentLanguage.pages.dataExport.cancelBtn }}
        </NButton>
      </div>
    </template>
  </NModal>

  <!-- 结果弹窗 -->
  <NModal
    :show="resultVisible"
    :mask-closable="false"
    preset="dialog"
    :title="currentLanguage.pages.dataExport.exportSuccessTitle"
    :positive-text="currentLanguage.pages.dataExport.openInFolder"
    :negative-text="currentLanguage.pages.dataExport.doneBtn"
    @update:show="emit('update:resultVisible', $event)"
    @positive-click="openResultFolder"
  >
    <div class="result-content">
      <p>{{ currentLanguage.pages.dataExport.exportSuccessMsg }}</p>
      <p class="result-path">{{ resultPath }}</p>
    </div>
  </NModal>
</template>

<style scoped>
.steps-modal-content {
  max-height: 55vh;
  overflow-y: auto;
  padding: 16px 20px;
  background-color: var(--theme-universal-background);
  border-radius: var(--n-border-radius);
}

.step-spin {
  flex-shrink: 0;
}

.cancel-row {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.result-content {
  padding: 4px 0;
}

.result-path {
  font-size: 12px;
  color: var(--theme-universal-text-hint);
  word-break: break-all;
  margin-top: 4px;
}
</style>
