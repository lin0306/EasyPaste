<script setup lang="ts">
import { currentLanguage } from '../../../../services/LanguageService.ts'

// const props = defineProps<{
//   filePath: string
// }>();
</script>

<template>
  <div class="no-preview-container">
    <font-awesome-icon :icon="['fas', 'nonsupport-preview-file']" class="no-preview-icon" />
    <span class="no-preview-text">{{ currentLanguage.pages.preview.cannotPreviewRtf }}</span>
  </div>
</template>

<style scoped></style>
