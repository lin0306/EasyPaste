<script setup lang="ts">
import { computed } from 'vue'
import { NCheckbox, NCollapse, NCollapseItem, NSpin } from 'naive-ui'
import { currentLanguage } from '@/services/LanguageService.ts'
import { faClipboard, faPuzzlePiece, faSliders, faTags } from '@fortawesome/free-solid-svg-icons'

const props = defineProps<{
  options: ExportOptions
  stats: ExportStats
  pageLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:options', val: ExportOptions): void
}>()

const t = computed(() => currentLanguage.value.pages.dataExport)

// ========== 分区映射 ==========
type SectionName = 'clipboard' | 'tags' | 'settings' | 'plugins'

const SECTION_KEYS: Record<SectionName, (keyof ExportOptions)[]> = {
  clipboard: ['textItems', 'imageItems', 'imageFiles', 'fileItems'],
  tags: ['tags', 'itemTags'],
  settings: ['settings', 'shortcutKeys', 'customTheme'],
  plugins: ['pluginsStore', 'pluginsLocal', 'pluginConfig'],
}

function isSectionAllChecked(name: SectionName): boolean {
  return SECTION_KEYS[name].every(k => props.options[k])
}

function isIndeterminate(name: SectionName): boolean {
  return SECTION_KEYS[name].some(k => props.options[k]) && !isSectionAllChecked(name)
}

function toggleSection(name: SectionName, checked: boolean) {
  const patch = {} as ExportOptions
  SECTION_KEYS[name].forEach(k => {
    patch[k] = checked
  })
  // 取消面板时的级联处理
  if (!checked) {
    if (name === 'clipboard') patch.imageFiles = false
    if (name === 'tags') patch.itemTags = false
    if (name === 'plugins') patch.pluginConfig = false
  }
  emit('update:options', { ...props.options, ...patch })
}

// ========== 工具函数 ==========
function updateOptions(patch: Partial<ExportOptions>) {
  emit('update:options', { ...props.options, ...patch })
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + units[i]
}

function onTagToggle(checked: boolean) {
  if (!checked) updateOptions({ itemTags: false })
}

function onImageToggle(checked: boolean) {
  if (!checked) updateOptions({ imageFiles: false })
}

function onPluginToggle() {
  if (!props.options.pluginsStore && !props.options.pluginsLocal) {
    updateOptions({ pluginConfig: false })
  }
}
</script>

<template>
  <div class="export-form">
    <NCollapse :default-expanded-names="['clipboard', 'tags', 'settings', 'plugins']">
      <!-- ========== 剪贴板记录 ========== -->
      <NCollapseItem name="clipboard">
        <template #header>
          <div class="collapse-header-row">
            <span class="collapse-header">
              <font-awesome-icon :icon="faClipboard" class="header-icon" />
              {{ t.sectionClipboard }}
            </span>
            <NCheckbox
              size="small"
              :checked="isSectionAllChecked('clipboard')"
              :indeterminate="isIndeterminate('clipboard')"
              @update:checked="toggleSection('clipboard', $event)"
              @click.stop
            />
          </div>
        </template>
        <div class="section-body">
          <div class="check-row">
            <NCheckbox
              :checked="options.textItems"
              :disabled="pageLoading"
              @update:checked="updateOptions({ textItems: $event })"
            >
              {{ t.textItems }}
            </NCheckbox>
            <span class="stat-badge">
              <NSpin v-if="pageLoading" size="small" />
              <template v-else>{{ stats.textCount }} {{ t.unitItems }}</template>
            </span>
          </div>
          <div class="hint-line">
            <span class="hint-text">{{ t.textItemsHint }}</span>
          </div>

          <div class="check-row">
            <NCheckbox
              :checked="options.imageItems"
              :disabled="pageLoading"
              @update:checked="
                (v: boolean) => {
                  updateOptions({ imageItems: v })
                  onImageToggle(v)
                }
              "
            >
              {{ t.imageItems }}
            </NCheckbox>
            <span class="stat-badge">
              <NSpin v-if="pageLoading" size="small" />
              <template v-else>{{ stats.imageCount }} {{ t.unitItems }}</template>
            </span>
          </div>
          <div class="check-row">
            <NCheckbox
              :checked="options.imageFiles"
              @update:checked="updateOptions({ imageFiles: $event })"
            >
              {{ t.imageFiles }}
            </NCheckbox>
            <span v-if="stats.imageSize > 0" class="stat-badge">{{
              formatSize(stats.imageSize)
            }}</span>
          </div>
          <div class="warning-line">
            <span class="warning-text">{{ t.imageFilesNoExportWarning }}</span>
          </div>

          <div class="check-row">
            <NCheckbox
              :checked="options.fileItems"
              :disabled="pageLoading"
              @update:checked="updateOptions({ fileItems: $event })"
            >
              {{ t.fileItems }}
            </NCheckbox>
            <span class="stat-badge">
              <NSpin v-if="pageLoading" size="small" />
              <template v-else>{{ stats.fileCount }} {{ t.unitItems }}</template>
            </span>
          </div>
          <div class="warning-line">
            <span class="warning-text">{{ t.fileItemsNoExportWarning }}</span>
          </div>
        </div>
      </NCollapseItem>

      <!-- ========== 标签 ========== -->
      <NCollapseItem name="tags">
        <template #header>
          <div class="collapse-header-row">
            <span class="collapse-header">
              <font-awesome-icon :icon="faTags" class="header-icon" />
              {{ t.sectionTags }}
            </span>
            <NCheckbox
              size="small"
              :checked="isSectionAllChecked('tags')"
              :indeterminate="isIndeterminate('tags')"
              @update:checked="toggleSection('tags', $event)"
              @click.stop
            />
          </div>
        </template>
        <div class="section-body">
          <div class="check-row">
            <NCheckbox
              :checked="options.tags"
              :disabled="pageLoading"
              @update:checked="
                (v: boolean) => {
                  updateOptions({ tags: v })
                  onTagToggle(v)
                }
              "
            >
              {{ t.tags }}
            </NCheckbox>
            <span class="stat-badge">
              <NSpin v-if="pageLoading" size="small" />
              <template v-else>{{ stats.tagCount }} {{ t.unitTags }}</template>
            </span>
          </div>

          <div v-if="options.tags" class="check-row">
            <NCheckbox
              :checked="options.itemTags"
              :disabled="pageLoading"
              @update:checked="updateOptions({ itemTags: $event })"
            >
              {{ t.itemTags }}
            </NCheckbox>
            <span class="stat-badge">
              <NSpin v-if="pageLoading" size="small" />
              <template v-else>{{ stats.itemTagCount }} {{ t.unitItems }}</template>
            </span>
          </div>
          <div v-if="options.tags && stats.itemTagCount === 0 && !pageLoading" class="hint-line">
            <span class="hint-text">{{ t.itemTagsNoRecords }}</span>
          </div>
        </div>
      </NCollapseItem>

      <!-- ========== 配置数据 ========== -->
      <NCollapseItem name="settings">
        <template #header>
          <div class="collapse-header-row">
            <span class="collapse-header">
              <font-awesome-icon :icon="faSliders" class="header-icon" />
              {{ t.sectionSettings }}
            </span>
            <NCheckbox
              size="small"
              :checked="isSectionAllChecked('settings')"
              :indeterminate="isIndeterminate('settings')"
              @update:checked="toggleSection('settings', $event)"
              @click.stop
            />
          </div>
        </template>
        <div class="section-body">
          <div class="check-row">
            <NCheckbox
              :checked="options.settings"
              :disabled="pageLoading"
              @update:checked="updateOptions({ settings: $event })"
            >
              {{ t.settings }}
            </NCheckbox>
            <span class="stat-badge">
              <NSpin v-if="pageLoading" size="small" />
              <template v-else>{{ stats.modifiedSettingsCount }} {{ t.unitSettings }}</template>
            </span>
          </div>
          <div v-if="!pageLoading && stats.modifiedSettingsCount === 0" class="hint-line">
            <span class="hint-text">{{ t.settingsNotModified }}</span>
          </div>

          <div class="check-row">
            <NCheckbox
              :checked="options.shortcutKeys"
              :disabled="pageLoading"
              @update:checked="updateOptions({ shortcutKeys: $event })"
            >
              {{ t.shortcutKeys }}
            </NCheckbox>
            <span class="stat-badge">
              <NSpin v-if="pageLoading" size="small" />
              <template v-else>{{ stats.modifiedShortcutCount }} {{ t.unitSettings }}</template>
            </span>
          </div>
          <div v-if="!pageLoading && stats.modifiedShortcutCount === 0" class="hint-line">
            <span class="hint-text">{{ t.shortcutKeysNotModified }}</span>
          </div>

          <div class="check-row">
            <NCheckbox
              :checked="options.customTheme"
              :disabled="pageLoading"
              @update:checked="updateOptions({ customTheme: $event })"
            >
              {{ t.customTheme }}
            </NCheckbox>
          </div>
          <div v-if="!pageLoading && !stats.customThemeModified" class="hint-line">
            <span class="hint-text">{{ t.customThemeNotModified }}</span>
          </div>
        </div>
      </NCollapseItem>

      <!-- ========== 插件 ========== -->
      <NCollapseItem name="plugins">
        <template #header>
          <div class="collapse-header-row">
            <span class="collapse-header">
              <font-awesome-icon :icon="faPuzzlePiece" class="header-icon" />
              {{ t.sectionPlugins }}
            </span>
            <NCheckbox
              size="small"
              :checked="isSectionAllChecked('plugins')"
              :indeterminate="isIndeterminate('plugins')"
              @update:checked="toggleSection('plugins', $event)"
              @click.stop
            />
          </div>
        </template>
        <div class="section-body">
          <div class="check-row">
            <NCheckbox
              :checked="options.pluginsStore"
              :disabled="pageLoading"
              @update:checked="
                (v: boolean) => {
                  updateOptions({ pluginsStore: v })
                  onPluginToggle()
                }
              "
            >
              {{ t.pluginsStore }}
            </NCheckbox>
            <span class="stat-badge">
              <NSpin v-if="pageLoading" size="small" />
              <template v-else>{{ stats.pluginsStoreCount }} {{ t.unitPlugins }}</template>
            </span>
          </div>
          <div class="hint-line">
            <span class="hint-text">{{ t.pluginsStoreHint }}</span>
          </div>

          <div class="check-row">
            <NCheckbox
              :checked="options.pluginsLocal"
              :disabled="pageLoading"
              @update:checked="
                (v: boolean) => {
                  updateOptions({ pluginsLocal: v })
                  onPluginToggle()
                }
              "
            >
              {{ t.pluginsLocal }}
            </NCheckbox>
            <span class="stat-badge">
              <NSpin v-if="pageLoading" size="small" />
              <template v-else>{{ stats.pluginsLocalCount }} {{ t.unitPlugins }}</template>
            </span>
          </div>
          <div class="hint-line">
            <span class="hint-text">{{ t.pluginsLocalHint }}</span>
          </div>

          <div class="check-row">
            <NCheckbox
              :checked="options.pluginConfig"
              :disabled="pageLoading || (!options.pluginsStore && !options.pluginsLocal)"
              @update:checked="updateOptions({ pluginConfig: $event })"
            >
              {{ t.pluginConfig }}
            </NCheckbox>
          </div>
        </div>
      </NCollapseItem>
    </NCollapse>
  </div>
</template>

<style scoped>
.export-form {
  padding: 8px;
}

/* ========== 折叠面板 header ========== */
.collapse-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
}

.collapse-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--theme-universal-text);
}

.header-icon {
  font-size: 13px;
  opacity: 0.75;
}

/* ========== 内容区 ========== */
.section-body {
  padding: 0 4px 4px;
}

.check-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
}

.stat-badge {
  font-size: 12px;
  color: var(--theme-universal-text-hint);
  background-color: var(--theme-universal-background);
  padding: 1px 8px;
  border-radius: 10px;
}

.hint-line {
  padding-left: 24px;
  margin-bottom: 4px;
}

.hint-text {
  font-size: 11px;
  color: var(--theme-universal-text-hint);
}

.warning-line {
  padding-left: 24px;
  margin-bottom: 4px;
}

.warning-text {
  font-size: 11px;
  color: var(--theme-button-error-text-color);
  opacity: 0.85;
}
</style>
