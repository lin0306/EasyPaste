<script setup lang="ts">
import { currentConfig, onLoading, originalConfig } from '../composables/SettingsDataComposable.ts'
import { NText, SelectRenderLabel, SelectRenderTag, useMessage } from 'naive-ui'
import { computed, onMounted } from 'vue'
import {
  getAnimationSpeedLevel,
  getBackgroundAnimationEffect,
  getEnableAnimationEffects,
  getTheme,
  saveAnimationDuration,
  saveAnimationSpeedLevel,
  saveBackgroundAnimationEffect,
  saveEnableAnimationEffects,
} from '../../../store/Settings.ts'
import { emit } from '@tauri-apps/api/event'
import { error } from '@tauri-apps/plugin-log'
import { getSpeedDuration, SETTINGS } from '../../../constants/UserSettingsConstant.ts'
import { currentThemeId, themeColors, themes, toggleTheme } from '../../../services/ThemeService.ts'
import { currentLanguage } from '../../../services/LanguageService.ts'
import { openThemeEditorWindow } from '../../../services/WindowService.ts'
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons'
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'

const message = useMessage()

const themeList = computed(() => {
  return themes.value.sort(t => {
    if (t.id === 'custom') {
      return 1
    }
    return 0
  })
})

// 动画速度选项
const animationSpeedOptions = computed(() => [
  {
    label: currentLanguage.value.pages.settings.transitionSpeedFast,
    value: SETTINGS.THEME.ANIMATION.SPEED.FAST.key,
  },
  {
    label: currentLanguage.value.pages.settings.transitionSpeedNormal,
    value: SETTINGS.THEME.ANIMATION.SPEED.NORMAL.key,
  },
  {
    label: currentLanguage.value.pages.settings.transitionSpeedSlow,
    value: SETTINGS.THEME.ANIMATION.SPEED.SLOW.key,
  },
])

// 背景动画效果选项
const backgroundAnimationOptions = computed(() => [
  {
    label: currentLanguage.value.pages.settings.none,
    value: SETTINGS.THEME.BACKGROUND_ANIMATION.EFFECT_OPTIONS.NONE,
  },
  {
    label: currentLanguage.value.pages.settings.star,
    value: SETTINGS.THEME.BACKGROUND_ANIMATION.EFFECT_OPTIONS.STAR,
    hint: currentLanguage.value.pages.settings.starHint,
  },
  {
    label: currentLanguage.value.pages.settings.starrySky,
    value: SETTINGS.THEME.BACKGROUND_ANIMATION.EFFECT_OPTIONS.STARRY_SKY,
    hint: currentLanguage.value.pages.settings.starrySkyHint,
  },
  {
    label: currentLanguage.value.pages.settings.orb,
    value: SETTINGS.THEME.BACKGROUND_ANIMATION.EFFECT_OPTIONS.ORB,
    hint: currentLanguage.value.pages.settings.orbHint,
  },
  {
    label: currentLanguage.value.pages.settings.aurora,
    value: SETTINGS.THEME.BACKGROUND_ANIMATION.EFFECT_OPTIONS.AURORA,
    hint: currentLanguage.value.pages.settings.auroraHint,
  },
  {
    label: currentLanguage.value.pages.settings.ember,
    value: SETTINGS.THEME.BACKGROUND_ANIMATION.EFFECT_OPTIONS.EMBER,
    hint: currentLanguage.value.pages.settings.emberHint,
  },
])

/**
 * 背景动画下拉选项展示效果
 * @param option
 */
const backgroundAnimationRenderLabel: SelectRenderLabel = option => {
  if (option.hint) {
    return h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          maxWidth: '350px',
        },
      },
      [
        h(
          'div',
          {
            style: {
              marginLeft: '12px',
              padding: '4px 0',
              flex: 1,
              minWidth: 0,
            },
          },
          [
            h('div', { style: { color: themeColors.value.universal.text } }, [
              option.label as string,
            ]),
            h(
              NText,
              {
                depth: 3,
                tag: 'div',
                style: {
                  color: themeColors.value.universal.textHint,
                  fontSize: '12px',
                  whiteSpace: 'normal',
                  wordWrap: 'break-word',
                  wordBreak: 'break-word',
                  lineHeight: '1.4',
                  marginTop: '2px',
                },
              },
              {
                default: () => option.hint,
              }
            ),
          ]
        ),
      ]
    )
  } else {
    return h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
        },
      },
      [
        h(
          'div',
          {
            style: {
              marginLeft: '12px',
              padding: '4px 0',
            },
          },
          [h('div', null, [option.label as string])]
        ),
      ]
    )
  }
}

/**
 * 背景动画选择项展示效果
 * @param option
 */
const backgroundAnimationRenderSingleSelectTag: SelectRenderTag = ({ option }) => {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
      },
    },
    [option.label as string]
  )
}

/**
 * 修改是否启用动画效果
 * @param enableAnimationEffects 是否启用动画效果
 */
const onChangeEnableAnimationEffects = async (enableAnimationEffects: boolean): Promise<void> => {
  onLoading.value = true
  try {
    await saveEnableAnimationEffects(enableAnimationEffects)
    // 停用动画效果，动画持续时间置0
    if (!enableAnimationEffects) {
      await saveAnimationDuration(0)
    } else {
      await saveAnimationDuration(getSpeedDuration(currentConfig.animationSpeedLevel))
    }
    originalConfig.enableAnimationEffects = enableAnimationEffects
    currentConfig.enableAnimationEffects = enableAnimationEffects
    if (!enableAnimationEffects) {
      currentConfig.animationDuration = 0
      originalConfig.animationDuration = 0
    } else {
      currentConfig.animationDuration = getSpeedDuration(currentConfig.animationSpeedLevel)
      originalConfig.animationDuration = getSpeedDuration(currentConfig.animationSpeedLevel)
    }
    // 发送全局消息
    await emit('update-animation-effect', {
      isEnable: enableAnimationEffects,
      duration: currentConfig.animationDuration,
      backgroundAnimationEffect: currentConfig.backgroundAnimationEffect,
    })
  } catch (e) {
    error('修改是否启用动画效果设置出错:' + e)
    message.error(currentLanguage.value.pages.settings.saveFailedMsg)
    currentConfig.enableAnimationEffects = originalConfig.enableAnimationEffects
  } finally {
    // 设置动画持续时长
    document.documentElement.style.setProperty(
      '--animation-duration',
      currentConfig.animationDuration + 'ms'
    )
    onLoading.value = false
  }
}

/**
 * 修改动画速度级别
 * @param animationSpeedLevel 动画速度级别
 */
const onChangeAnimationSpeedLevel = async (animationSpeedLevel: string): Promise<void> => {
  if (animationSpeedLevel === originalConfig.animationSpeedLevel) {
    return
  }
  onLoading.value = true
  try {
    const duration = getSpeedDuration(animationSpeedLevel)
    await saveAnimationDuration(duration)
    await saveAnimationSpeedLevel(animationSpeedLevel)

    originalConfig.animationSpeedLevel = animationSpeedLevel
    currentConfig.animationSpeedLevel = animationSpeedLevel
    // 发送全局消息
    await emit('update-animation-effect', {
      isEnable: currentConfig.enableAnimationEffects,
      duration: duration,
      backgroundAnimationEffect: currentConfig.backgroundAnimationEffect,
    })
  } catch (e) {
    error('修改动画速度级别设置出错:' + e)
    message.error(currentLanguage.value.pages.settings.saveFailedMsg)
    currentConfig.animationSpeedLevel = originalConfig.animationSpeedLevel
  } finally {
    // 设置动画持续时长
    document.documentElement.style.setProperty(
      '--animation-duration',
      currentConfig.animationDuration + 'ms'
    )
    onLoading.value = false
  }
}

/**
 * 修改背景动画效果
 * @param backgroundAnimationEffect 背景动画效果
 */
const onChangeBackgroundAnimationEffect = async (
  backgroundAnimationEffect: string
): Promise<void> => {
  if (backgroundAnimationEffect === originalConfig.backgroundAnimationEffect) {
    return
  }
  onLoading.value = true
  try {
    await saveBackgroundAnimationEffect(backgroundAnimationEffect)

    originalConfig.backgroundAnimationEffect = backgroundAnimationEffect
    currentConfig.backgroundAnimationEffect = backgroundAnimationEffect
    // 发送全局消息
    await emit('update-animation-effect', {
      isEnable: currentConfig.enableAnimationEffects,
      duration: currentConfig.animationDuration,
      backgroundAnimationEffect: currentConfig.backgroundAnimationEffect,
    })
  } catch (e) {
    error('修改动画速度级别设置出错:' + e)
    message.error(currentLanguage.value.pages.settings.saveFailedMsg)
    currentConfig.backgroundAnimationEffect = originalConfig.backgroundAnimationEffect
  } finally {
    onLoading.value = false
  }
}

/**
 * 打开主题编辑器页面
 */
const onEditTheme = async (): Promise<void> => {
  await openThemeEditorWindow()
}

// 加载配置
onMounted(async () => {
  try {
    // 初始化用户配置
    const theme = await getTheme()
    originalConfig.theme = theme
    currentConfig.theme = theme

    const enableAnimationEffects = await getEnableAnimationEffects()
    originalConfig.enableAnimationEffects = enableAnimationEffects
    currentConfig.enableAnimationEffects = enableAnimationEffects

    const animationSpeedLevel = await getAnimationSpeedLevel()
    originalConfig.animationSpeedLevel = animationSpeedLevel
    currentConfig.animationSpeedLevel = animationSpeedLevel

    const backgroundAnimationEffect = await getBackgroundAnimationEffect()
    originalConfig.backgroundAnimationEffect = backgroundAnimationEffect
    currentConfig.backgroundAnimationEffect = backgroundAnimationEffect
  } catch (e) {
    console.error('页面初始化失败:', e)
    error('页面初始化失败：' + e)
    message.error(currentLanguage.value.pages.settings.initFailedHint)
  }
})
</script>

<template>
  <div class="settings-section">
    <n-divider title-placement="left">{{ currentLanguage.pages.settings.themesTitle }}</n-divider>
    <div class="themes-line">
      <div
        v-for="theme in themeList"
        class="theme-block"
        :style="{
          backgroundColor: theme.colors.universal.background,
          border: theme.id === currentThemeId ? '2px solid ' + theme.colors.universal.primary : '',
        }"
        :class="{ 'theme-selected': theme.id === currentThemeId }"
        @click="toggleTheme(theme.id)"
      >
        <div
          class="theme-title"
          :style="{ backgroundColor: theme.colors.titleBar.backgroundColor }"
        ></div>

        <!-- 预设主题 -->
        <div class="theme-content" v-if="theme.id !== 'custom'">
          <div
            class="theme-content-line"
            :style="{ backgroundColor: theme.colors.universal.secondary }"
          >
            <div :style="{ color: theme.colors.universal.text }" class="theme-name">
              {{ currentLanguage.pages.settings.colors[theme.id] }}
            </div>
          </div>
          <div
            class="theme-content-line"
            :style="{ backgroundColor: theme.colors.universal.secondary }"
          ></div>
        </div>

        <!-- 自定义主题 -->
        <div class="theme-content" v-if="theme.id === 'custom'">
          <n-button
            dashed
            @click.stop="onEditTheme"
            :color="theme.colors.button.primary.backgroundColor"
          >
            <font-awesome-icon :icon="faPenToSquare" />
          </n-button>
          <div
            class="theme-content-line"
            :style="{ backgroundColor: theme.colors.universal.secondary }"
          ></div>
        </div>
      </div>
    </div>

    <n-divider title-placement="left">{{
      currentLanguage.pages.settings.animationTitle
    }}</n-divider>

    <!-- 动画配置选项 -->
    <div class="form-item">
      <span class="label">{{ currentLanguage.pages.settings.enableAnimationEffects }}</span>
      <div class="switch-with-status">
        <n-switch
          v-model:value="currentConfig.enableAnimationEffects"
          :loading="onLoading"
          @update:value="onChangeEnableAnimationEffects"
        />
      </div>
    </div>

    <!-- 配置动画速度 -->
    <div class="line" v-if="currentConfig.enableAnimationEffects">
      <div class="main-item">
        <span class="label">{{ currentLanguage.pages.settings.transitionSpeed }}</span>
        <n-select
          class="select"
          v-model:value="currentConfig.animationSpeedLevel"
          :loading="onLoading"
          :options="animationSpeedOptions"
          @update:value="onChangeAnimationSpeedLevel"
        />
      </div>
      <div class="second-item">
        <div class="hint">
          <font-awesome-icon :icon="faCircleInfo" class="hint-icon" />
          <span class="hint-text">
            {{ currentLanguage.pages.settings.animationHint }}
          </span>
        </div>
      </div>
    </div>

    <!-- 配置背景动效 -->
    <div class="line" v-if="currentConfig.enableAnimationEffects">
      <div class="main-item">
        <span class="label">{{ currentLanguage.pages.settings.backgroundAnimationEffect }}</span>
        <n-select
          class="select"
          v-model:value="currentConfig.backgroundAnimationEffect"
          :loading="onLoading"
          @update:value="onChangeBackgroundAnimationEffect"
          :options="backgroundAnimationOptions"
          :render-label="backgroundAnimationRenderLabel"
          :render-tag="backgroundAnimationRenderSingleSelectTag"
        />
      </div>
      <div class="second-item">
        <div class="hint">
          <font-awesome-icon :icon="faCircleInfo" class="hint-icon" />
          <span class="hint-text">
            {{ currentLanguage.pages.settings.backgroundAnimationEffectHint }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.themes-line {
  display: flex;
  gap: 13px;
  margin: 15px 5px;
  align-items: center;
}

.theme-block {
  width: 70px;
  height: 70px;
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--theme-universal-border);
}

.theme-title {
  width: 100%;
  height: 10px;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
}

.theme-name {
  font-size: 12px;
  text-align: center;
}

.theme-content {
  height: 50px;
  display: flex;
  margin: 5px;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
}

.theme-content-line {
  width: 95%;
  padding: 5px 0;
  border-radius: 4px;
  box-shadow: 0 2px 8px var(--theme-universal-border);
}

.theme-selected {
  transform: scale(1.05);
}
</style>
