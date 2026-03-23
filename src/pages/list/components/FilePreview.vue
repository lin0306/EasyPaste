<script lang="ts" setup>
import { NImage } from 'naive-ui'
import { filePathConvertFileName, isText } from '../../../utils/TextUtil.ts'
import { convertFileSrc } from '@tauri-apps/api/core'
import { isProgram } from '../../../utils/ProgramUtil.ts'
import { isVideo } from '../../../utils/VideoUtil.ts'
import { isImage } from '../../../utils/ImageUtil.ts'
import { isCode } from '../../../utils/CodeUtil.ts'
import { isAudio } from '../../../utils/AudioUtil.ts'
import { isExcel, isPDF, isPPT, isWord } from '../../../utils/OfficeUtil.ts'
import { isPackage } from '../../../utils/PackageUtil.ts'
import { displayThumbnailImage } from '../composables/FileDataComposable.ts'
import {
  faFileAudio,
  faFileCode,
  faFileLines,
  faFilePdf,
  faFileVideo,
  faFileWord,
  faFileZipper,
  faFolderClosed,
  faImage,
} from '@fortawesome/free-regular-svg-icons'
import { faTable } from '@fortawesome/free-solid-svg-icons'

const props = defineProps<{
  filePath: string
  isFolder?: boolean
  isExist?: boolean
}>()
</script>

<template>
  <div class="file-item">
    <font-awesome-icon v-if="!isExist" :icon="['fas', 'no-file']" class="file-not-exist-icon" />
    <font-awesome-icon v-else-if="isFolder" class="file-icon" :icon="faFolderClosed" />
    <n-image
      v-else-if="isImage(props.filePath) && displayThumbnailImage"
      :lazy="true"
      :preview-disabled="true"
      :src="convertFileSrc(props.filePath)"
      height="60px"
      object-fit="cover"
      width="100%"
    />
    <font-awesome-icon
      v-else-if="isImage(props.filePath) && !displayThumbnailImage"
      class="file-icon"
      :icon="faImage"
    />
    <font-awesome-icon v-else-if="isVideo(props.filePath)" class="file-icon" :icon="faFileVideo" />
    <font-awesome-icon v-else-if="isAudio(props.filePath)" class="file-icon" :icon="faFileAudio" />
    <font-awesome-icon v-else-if="isWord(props.filePath)" class="file-icon" :icon="faFileWord" />
    <font-awesome-icon v-else-if="isExcel(props.filePath)" class="file-icon" :icon="faTable" />
    <font-awesome-icon v-else-if="isPPT(props.filePath)" :icon="['fas', 'ppt']" class="file-icon" />
    <font-awesome-icon v-else-if="isPDF(props.filePath)" class="file-icon" :icon="faFilePdf" />
    <font-awesome-icon v-else-if="isText(props.filePath)" class="file-icon" :icon="faFileLines" />
    <font-awesome-icon
      v-else-if="isProgram(props.filePath)"
      :icon="['fas', 'exe']"
      class="file-icon"
    />
    <font-awesome-icon
      v-else-if="isPackage(props.filePath)"
      class="file-icon"
      :icon="faFileZipper"
    />
    <font-awesome-icon v-else-if="isCode(props.filePath)" class="file-icon" :icon="faFileCode" />
    <font-awesome-icon v-else :icon="['fas', 'unknown-file']" class="file-icon" />
    <span :class="{ 'file-not-exist-text': !props.isExist }">
      {{ filePathConvertFileName(filePath) }}
    </span>
  </div>
</template>

<style scoped>
.file-item {
  margin: 2px;
  padding: 3px;
  border: 1px solid var(--theme-universal-border);
  border-radius: 5px;
  font-size: 12px;
  width: 74px;
  display: grid;
  place-items: center;
  grid-template-rows: 1fr auto;
  position: relative;
}

.file-not-exist-icon {
  width: 60px;
  height: 60px;
  color: var(--theme-universal-delete);
}

.file-icon {
  width: 50px;
  height: 50px;
}

.file-item span {
  width: 75px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  /* 显示一行 */
  overflow: hidden;
  text-align: center;
  align-self: end;
  justify-self: center;
}

.file-not-exist-text {
  color: var(--theme-universal-delete);
  text-decoration: line-through;
}
</style>
