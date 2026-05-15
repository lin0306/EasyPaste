<script setup lang="ts">
import { currentConfig, onLoading, originalConfig } from '../composables/SettingsDataComposable.ts'
import { currentLanguage } from '../../../services/LanguageService.ts'
import { onMounted } from 'vue'
import {
  getAlwaysOnTop,
  getAutoGoToLatestData,
  getAutoHideWindow,
  getDisplayDetailTime,
  getDisplayThumbnailImage,
  getSearchModel,
  getWindowSize,
  saveAlwaysOnTop,
  saveAutoGoToLatestData,
  saveAutoHideWindow,
  saveDisplayDetailTime,
  saveDisplayThumbnailImage,
  saveSearchModel,
  saveWindowSize,
} from '../../../store/Settings.ts'
import { error } from '@tauri-apps/plugin-log'
import { emit } from '@tauri-apps/api/event'
import { useMessage } from 'naive-ui'
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { SETTINGS } from '../../../constants/UserSettingsConstant.ts'
import { faFloppyDisk } from '@fortawesome/free-regular-svg-icons'

const message = useMessage()

// 动画速度选项
const searchModelOptions = computed(() => [
  {
    label: currentLanguage.value.pages.settings.simpleSearch,
    value: SETTINGS.SEARCH.MODEL.SIMPLE,
  },
  {
    label: currentLanguage.value.pages.settings.advancedSearch,
    value: SETTINGS.SEARCH.MODEL.ADVANCED,
  },
])

// 是否改变窗口大小
const isChangeWindowSize = computed(() => {
  return (
    originalConfig.windowHeight !== currentConfig.windowHeight ||
    originalConfig.windowWidth !== currentConfig.windowWidth
  )
})

/**
 * 保存窗口大小
 */
const onSaveWindowSize = async () => {
  onLoading.value = true
  try {
    await saveWindowSize(currentConfig.windowWidth, currentConfig.windowHeight)
    originalConfig.windowWidth = currentConfig.windowWidth
    originalConfig.windowHeight = currentConfig.windowHeight
    // 发送更新了启用标签状态消息
    await emit('update-window-size', {
      width: currentConfig.windowWidth,
      height: currentConfig.windowHeight,
    })
  } catch (e) {
    error('修改窗口大小设置出错:' + e)
    message.error(currentLanguage.value.pages.settings.saveFailedMsg)
    currentConfig.windowWidth = originalConfig.windowWidth
    currentConfig.windowHeight = originalConfig.windowHeight
  } finally {
    onLoading.value = false
  }
}

/**
 * 修改自动隐藏窗口配置
 * @param autoHideWindow 是否自动隐藏窗口
 */
const onChangeAutoHideWindow = async (autoHideWindow: boolean): Promise<void> => {
  onLoading.value = true
  try {
    await saveAutoHideWindow(autoHideWindow)
    originalConfig.autoHideWindow = autoHideWindow
    currentConfig.autoHideWindow = autoHideWindow
    // 发送更新了启用标签状态消息
    await emit('update-auto-hide-window', { isAutoHide: currentConfig.autoHideWindow })
  } catch (e) {
    error('修改自动隐藏窗口设置出错:' + e)
    message.error(currentLanguage.value.pages.settings.saveFailedMsg)
    currentConfig.autoHideWindow = originalConfig.autoHideWindow
  } finally {
    onLoading.value = false
  }
}

/**
 * 修改窗口置顶配置
 * @param alwaysOnTop 是否置顶
 */
const onChangeAlwaysOnTop = async (alwaysOnTop: boolean): Promise<void> => {
  onLoading.value = true
  try {
    await saveAlwaysOnTop(alwaysOnTop)
    // 发送更新了窗口置顶状态消息
    await emit('update-always-on-top', { isTop: currentConfig.alwaysOnTop })
    originalConfig.alwaysOnTop = alwaysOnTop
    currentConfig.alwaysOnTop = alwaysOnTop
  } catch (e) {
    error('修改窗口置顶设置出错:' + e)
    message.error(currentLanguage.value.pages.settings.saveFailedMsg)
    currentConfig.alwaysOnTop = originalConfig.alwaysOnTop
  } finally {
    onLoading.value = false
  }
}

/**
 * 修改是否自动跳转到最新数据
 * @param autoGoToLatestData 是否自动跳转到最新数据
 */
const onChangeAutoGoToLatestData = async (autoGoToLatestData: boolean): Promise<void> => {
  onLoading.value = true
  try {
    await saveAutoGoToLatestData(autoGoToLatestData)
    originalConfig.autoGoToLatestData = autoGoToLatestData
    currentConfig.autoGoToLatestData = autoGoToLatestData
    // 发送更新了启用标签状态消息
    await emit('update-auto-go-to-latest-data', {
      isGoToLatestData: currentConfig.autoGoToLatestData,
    })
  } catch (e) {
    error('修改自动跳转到最新数据设置出错:' + e)
    message.error(currentLanguage.value.pages.settings.saveFailedMsg)
    currentConfig.autoGoToLatestData = originalConfig.autoGoToLatestData
  } finally {
    onLoading.value = false
  }
}

/**
 * 修改是否显示图片缩略图
 * @param displayThumbnailImage 是否显示图片缩略图
 */
const onChangeDisplayThumbnailImage = async (displayThumbnailImage: boolean): Promise<void> => {
  onLoading.value = true
  try {
    await saveDisplayThumbnailImage(displayThumbnailImage)
    originalConfig.displayThumbnailImage = displayThumbnailImage
    currentConfig.displayThumbnailImage = displayThumbnailImage
    // 发送更新了启用标签状态消息
    await emit('update-display-thumbnail-image', {
      displayThumbnailImage: currentConfig.displayThumbnailImage,
    })
  } catch (e) {
    error('修改是否显示图片缩略图设置出错:' + e)
    message.error(currentLanguage.value.pages.settings.saveFailedMsg)
    currentConfig.displayThumbnailImage = originalConfig.displayThumbnailImage
  } finally {
    onLoading.value = false
  }
}

/**
 * 修改是否显示图片缩略图
 * @param displayDetailTime 是否显示详细时间
 */
const onChangeDisplayDetailTime = async (displayDetailTime: boolean): Promise<void> => {
  onLoading.value = true
  try {
    await saveDisplayDetailTime(displayDetailTime)
    originalConfig.displayDetailTime = displayDetailTime
    currentConfig.displayDetailTime = displayDetailTime
    // 发送更新了启用标签状态消息
    await emit('update-display-detail-time', { displayDetailTime: currentConfig.displayDetailTime })
  } catch (e) {
    error('修改是否显示详细时间设置出错:' + e)
    message.error(currentLanguage.value.pages.settings.saveFailedMsg)
    currentConfig.displayDetailTime = originalConfig.displayDetailTime
  } finally {
    onLoading.value = false
  }
}

/**
 * 修改搜索模式
 * @param searchModel 搜索模式
 */
const onChangeSearchModel = async (searchModel: string): Promise<void> => {
  onLoading.value = true
  try {
    await saveSearchModel(searchModel)
    originalConfig.searchModel = searchModel
    currentConfig.searchModel = searchModel
    // 发送更新了启用标签状态消息
    await emit('update-search-model', { searchModel: currentConfig.searchModel })
  } catch (e) {
    error('修改搜索模式出错:' + e)
    message.error(currentLanguage.value.pages.settings.saveFailedMsg)
    currentConfig.searchModel = originalConfig.searchModel
  } finally {
    onLoading.value = false
  }
}

// 加载配置
onMounted(async () => {
  try {
    // 初始化用户配置
    const windowSize = await getWindowSize()
    originalConfig.windowWidth = windowSize.width
    currentConfig.windowWidth = windowSize.width
    originalConfig.windowHeight = windowSize.height
    currentConfig.windowHeight = windowSize.height

    const autoHideWindow = await getAutoHideWindow()
    originalConfig.autoHideWindow = autoHideWindow
    currentConfig.autoHideWindow = autoHideWindow

    const alwaysOnTop = await getAlwaysOnTop()
    originalConfig.alwaysOnTop = alwaysOnTop
    currentConfig.alwaysOnTop = alwaysOnTop

    const displayThumbnailImage = await getDisplayThumbnailImage()
    originalConfig.displayThumbnailImage = displayThumbnailImage
    currentConfig.displayThumbnailImage = displayThumbnailImage

    const autoGoToLatestData = await getAutoGoToLatestData()
    originalConfig.autoGoToLatestData = autoGoToLatestData
    currentConfig.autoGoToLatestData = autoGoToLatestData

    const displayDetailTime = await getDisplayDetailTime()
    originalConfig.displayDetailTime = displayDetailTime
    currentConfig.displayDetailTime = displayDetailTime

    const searchModel = await getSearchModel()
    originalConfig.searchModel = searchModel
    currentConfig.searchModel = searchModel
  } catch (e) {
    console.error('页面初始化失败:', e)
    error('页面初始化失败：' + e)
    message.error(currentLanguage.value.pages.settings.initFailedHint)
  }
})
</script>

<template>
  <div class="settings-section">
    <n-divider title-placement="left">{{
      currentLanguage.pages.settings.mainWindowTitle
    }}</n-divider>
    <div class="form-item">
      <span class="label">窗口大小</span>
      <n-input-group class="input-group">
        <n-input-number
          :style="{ width: '50%' }"
          :min="350"
          :max="800"
          v-model:value="currentConfig.windowWidth"
        />
        <n-input-group-label>x</n-input-group-label>
        <n-input-number
          :style="{ width: '50%' }"
          :min="550"
          :max="1000"
          v-model:value="currentConfig.windowHeight"
        />
        <n-input-group-label
          v-if="isChangeWindowSize"
          @click="onSaveWindowSize"
          :loading="onLoading"
          class="save-btn"
        >
          <font-awesome-icon :icon="faFloppyDisk" />
        </n-input-group-label>
      </n-input-group>
    </div>
    <div class="form-item">
      <span class="label">{{ currentLanguage.pages.settings.autoHideWindow }}</span>
      <n-switch
        v-model:value="currentConfig.autoHideWindow"
        :loading="onLoading"
        :disabled="onLoading"
        @update:value="onChangeAutoHideWindow"
      />
    </div>
    <div class="form-item" v-if="!currentConfig.autoHideWindow">
      <span class="label">{{ currentLanguage.pages.settings.alwaysOnTop }}</span>
      <n-switch
        v-model:value="currentConfig.alwaysOnTop"
        :loading="onLoading"
        :disabled="onLoading"
        @update:value="onChangeAlwaysOnTop"
      />
    </div>
    <div class="line">
      <div class="main-item">
        <span class="label">{{ currentLanguage.pages.settings.autoGoToLatestData }}</span>
        <n-switch
          v-model:value="currentConfig.autoGoToLatestData"
          :loading="onLoading"
          :disabled="onLoading"
          @update:value="onChangeAutoGoToLatestData"
        />
      </div>
      <div class="second-item">
        <div class="hint">
          <font-awesome-icon :icon="faCircleInfo" class="hint-icon" />
          <span class="hint-text">
            {{ currentLanguage.pages.settings.autoGoToLatestDataHint }}
          </span>
        </div>
      </div>
    </div>
    <div class="form-item">
      <span class="label">{{ currentLanguage.pages.settings.displayThumbnailImage }}</span>
      <n-switch
        v-model:value="currentConfig.displayThumbnailImage"
        :loading="onLoading"
        :disabled="onLoading"
        @update:value="onChangeDisplayThumbnailImage"
      />
    </div>
    <div class="form-item">
      <span class="label">{{ currentLanguage.pages.settings.displayDetailTime }}</span>
      <n-switch
        v-model:value="currentConfig.displayDetailTime"
        :loading="onLoading"
        :disabled="onLoading"
        @update:value="onChangeDisplayDetailTime"
      />
    </div>
    <div class="form-item">
      <span class="label">{{ currentLanguage.pages.settings.searchMode }}</span>
      <n-select
        class="select"
        v-model:value="currentConfig.searchModel"
        :options="searchModelOptions"
        :loading="onLoading"
        :disabled="onLoading"
        @update:value="onChangeSearchModel"
      />
    </div>
  </div>
</template>

<style scoped></style>
