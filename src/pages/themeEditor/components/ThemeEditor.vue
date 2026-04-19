<script setup lang="ts">
import {
  applyPreviewThemeToDOM,
  forbidCalculate,
  themeConfig,
} from '../composables/ThemeEditorDataComposable.ts'
import { watch } from 'vue'
import { calculateButtonColors } from '../../../utils/ColorUtil.ts'
import { currentLanguage } from '../../../services/LanguageService.ts'
import { ColorPickerMode } from 'naive-ui/es/color-picker/src/utils'

// 颜色模式
const colorModes = ['rgb'] as ColorPickerMode[]

watch(
  () => themeConfig.universal.primary,
  newVal => {
    if (!newVal) {
      return
    }
    if (forbidCalculate.value) {
      return
    }
    const colors = calculateButtonColors(newVal)
    themeConfig.button.primary.backgroundColor = newVal
    themeConfig.button.primary.disabledBackgroundColor = colors.disabledBgColor
    themeConfig.button.primary.hoverBackgroundColor = colors.hoverBgColor
    themeConfig.button.primary.textColor = colors.textColor
    themeConfig.button.primary.disabledTextColor = colors.disabledTextColor
    themeConfig.button.primary.hoverTextColor = colors.hoverTextColor
    themeConfig.select.options.optionColorActive = newVal
    themeConfig.select.options.optionColorActivePending = colors.hoverBgColor
    applyPreviewThemeToDOM(themeConfig)
  }
)

watch(
  () => themeConfig.universal.secondary,
  newVal => {
    if (!newVal) {
      return
    }
    if (forbidCalculate.value) {
      return
    }
    const colors = calculateButtonColors(newVal)
    themeConfig.button.normal.backgroundColor = newVal
    themeConfig.button.normal.disabledBackgroundColor = colors.disabledBgColor
    themeConfig.button.normal.hoverBackgroundColor = colors.hoverBgColor
    themeConfig.button.normal.textColor = colors.textColor
    themeConfig.button.normal.disabledTextColor = colors.disabledTextColor
    themeConfig.button.normal.hoverTextColor = colors.hoverTextColor
    themeConfig.select.options.optionColorPending = newVal
    applyPreviewThemeToDOM(themeConfig)
  }
)

watch(
  () => themeConfig.universal.delete,
  newVal => {
    if (!newVal) {
      return
    }
    if (forbidCalculate.value) {
      return
    }
    const colors = calculateButtonColors(newVal)
    themeConfig.button.error.backgroundColor = newVal
    themeConfig.button.error.disabledBackgroundColor = colors.disabledBgColor
    themeConfig.button.error.hoverBackgroundColor = colors.hoverBgColor
    themeConfig.button.error.textColor = colors.textColor
    themeConfig.button.error.disabledTextColor = colors.disabledTextColor
    themeConfig.button.error.hoverTextColor = colors.hoverTextColor
    applyPreviewThemeToDOM(themeConfig)
  }
)

watch(themeConfig, newVal => {
  if (!newVal) {
    return
  }
  applyPreviewThemeToDOM(newVal)
})
</script>

<template>
  <div class="theme-editor">
    <n-collapse>
      <n-collapse-item
        :title="currentLanguage.pages.themeEditor.editor.global.title"
        name="1"
      >
        <div class="sectorization">
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.global.primaryColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.universal.primary"
                @click="forbidCalculate = false"
                placement="left-end"
              />
            </div>
          </div>
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.global.secondaryColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.universal.secondary"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.global.backgroundColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.universal.background"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.global.deleteColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.universal.delete"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.global.textColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.universal.text"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.global.hintTextColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.universal.textHint"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
          <div class="color-line">
            <div class="color-line">
              {{ currentLanguage.pages.themeEditor.editor.global.borderColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.universal.border"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
        </div>
      </n-collapse-item>
      <n-collapse-item
        :title="currentLanguage.pages.themeEditor.editor.button.title"
        name="2"
      >
        <div class="sectorization">
          <!-- 主按钮颜色配置 -->
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.button.primary.bgColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.button.primary.backgroundColor"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.button.primary.hoverBgColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.button.primary.hoverBackgroundColor"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.button.primary.disableBgColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.button.primary.disabledBackgroundColor"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.button.primary.textColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.button.primary.textColor"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.button.primary.textHoverColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.button.primary.hoverTextColor"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
          <div class="color-line">
            <div class="color-label">
              {{
                currentLanguage.pages.themeEditor.editor.button.primary.textDisableColor
              }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.button.primary.disabledTextColor"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
          <!-- 次按钮颜色配置 -->
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.button.normal.bgColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.button.normal.backgroundColor"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.button.normal.hoverBgColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.button.normal.hoverBackgroundColor"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.button.normal.disableBgColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.button.normal.disabledBackgroundColor"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.button.normal.textColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.button.normal.textColor"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.button.normal.textHoverColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.button.normal.hoverTextColor"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.button.normal.textDisableColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.button.normal.disabledTextColor"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
          <!-- 异常按钮颜色配置 -->
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.button.error.bgColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.button.error.backgroundColor"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.button.error.hoverBgColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.button.error.hoverBackgroundColor"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.button.error.disableBgColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.button.error.disabledBackgroundColor"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.button.error.textColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.button.error.textColor"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.button.error.textHoverColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.button.error.hoverTextColor"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.button.error.textDisableColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.button.error.disabledTextColor"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
        </div>
      </n-collapse-item>
      <n-collapse-item
        :title="currentLanguage.pages.themeEditor.editor.select.title"
        name="3"
      >
        <div class="sectorization">
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.select.hoverBgColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.select.options.optionColorPending"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.select.activeBgColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.select.options.optionColorActive"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.select.activeHoverBgColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.select.options.optionColorActivePending"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
        </div>
      </n-collapse-item>
      <n-collapse-item
        :title="currentLanguage.pages.themeEditor.editor.titleBar.title"
        name="4"
      >
        <div class="sectorization">
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.titleBar.bgColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.titleBar.backgroundColor"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.titleBar.btnHoverBgColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.titleBar.btnHoverBackgroundColor"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.titleBar.closeBtnHoverBgColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.titleBar.closeBtnHoverBackgroundColor"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
        </div>
      </n-collapse-item>
      <n-collapse-item
        :title="currentLanguage.pages.themeEditor.editor.menuBar.title"
        name="5"
      >
        <div class="sectorization">
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.menuBar.bgColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.menuBar.background"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.menuBar.hoverBgColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.menuBar.itemHover"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.menuBar.activeBgColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.menuBar.itemActive"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
        </div>
      </n-collapse-item>
      <n-collapse-item
        :title="currentLanguage.pages.themeEditor.editor.customCard.title"
        name="6"
      >
        <div class="sectorization">
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.customCard.bgColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.customCard.background"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.customCard.hoverBgColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.customCard.backgroundHover"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
        </div>
      </n-collapse-item>
      <n-collapse-item
        :title="currentLanguage.pages.themeEditor.editor.audio.title"
        name="7"
      >
        <div class="sectorization">
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.audio.waveColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.wavesurfer.waveColor"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.audio.cursorColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.wavesurfer.cursorColor"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.audio.progressColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.wavesurfer.progressColor"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
        </div>
      </n-collapse-item>
      <n-collapse-item
        :title="currentLanguage.pages.themeEditor.editor.textEditor.title"
        name="8"
      >
        <div class="sectorization">
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.textEditor.bgColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.editor.backgroundColor"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
          <div class="color-line">
            <div class="color-label">
              {{ currentLanguage.pages.themeEditor.editor.textEditor.lineNumberBgColor }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.editor.lineNumberBackgroundColor"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
          <div class="color-line">
            <div class="color-label">
              {{
                currentLanguage.pages.themeEditor.editor.textEditor.lineNumberActiveBgColor
              }}
            </div>
            <div class="color-select">
              <n-color-picker
                :modes="colorModes"
                v-model:value="themeConfig.editor.lineNumberBackgroundColorActive"
                @click="forbidCalculate = false"
                :placement="'left-end'"
              />
            </div>
          </div>
        </div>
      </n-collapse-item>
    </n-collapse>
  </div>
</template>

<style scoped>
.theme-editor {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}

.sectorization {
  padding: 0 10px;
}

.color-line {
  display: flex;
  justify-content: space-between;
  margin: 3px 0;
}

.color-label {
  max-width: 55%;
  display: flex;
  align-items: center;
  justify-content: left;
}

.color-select {
  width: 45%;
}
</style>
