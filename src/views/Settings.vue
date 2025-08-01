<script setup lang="ts">
import {useMessage} from 'naive-ui';
import EditIcon from '../assets/icons/EditIcon.vue';
import TitleBar from '../components/TitleBar.vue';

import {invoke} from '@tauri-apps/api/core';
import {emit} from '@tauri-apps/api/event';
import {disable, enable, isEnabled} from '@tauri-apps/plugin-autostart';
import {isRegistered, unregister} from '@tauri-apps/plugin-global-shortcut';
import {error, info} from '@tauri-apps/plugin-log';
import {exit, relaunch} from '@tauri-apps/plugin-process';
import {computed, onMounted, reactive, ref} from 'vue';
import HintIcon from '../assets/icons/HintIcon.vue';
import {
  getSettings,
  getShortcutKeys,
  saveLanguageCache,
  saveUserShortcutKeys,
  updateUserSettings
} from '../configs/FileConfig';
import {getTray, languages, useLanguage} from '../configs/LanguageConfig';
import {convertRegisterKey, convertShow, formatKeyDisplay} from '../utils/ShortcutKeys';

const message = useMessage();
const {currentLanguage, toggleLanguage} = useLanguage();

// 重启确认弹窗状态
const restartModalVisible = ref(false);

// 菜单相关
const selectedKey = ref<string>('general');
const menuItems = computed(() => [
  {key: 'general', label: currentLanguage.value.pages.settings.generalMenu},
  {key: 'updater', label: currentLanguage.value.pages.settings.updaterMenu},
  {key: 'storage', label: currentLanguage.value.pages.settings.storageMenu},
  {key: 'shortcut', label: currentLanguage.value.pages.settings.shortcutMenu},
]);

// 配置相关
const originalConfig = reactive<Settings | any>({});

// 当前编辑的配置
const currentConfig = reactive<Settings | any>({});

// 配置相关
const originalShortcutKeys = reactive<ShortcutKeys | any>({});

// 当前编辑的配置
const currentShortcutKeys = reactive<ShortcutKeys | any>({});

// 语言选项
const languageOptions = languages.map(lang => ({
  value: lang.id,
  label: lang.name
}));

// 标签绑定按钮位置
const bindTagBtnShowLocation = computed(() => [{
  value: 'top-right',
  label: currentLanguage.value.pages.settings.topRight,
}, {
  value: 'bottom-right',
  label: currentLanguage.value.pages.settings.bottomRight,
}]);

// 自动检查更新方式
const autoUpdateMode = computed(() => [{
  value: 'timing',
  label: '定时检查'
}, {
  value: 'after-running',
  label: '启动时检查'
}])

// 是否有修改
const hasChanges = computed(() => {
  if (selectedKey.value === 'shortcut') {
    // 检查是否在编辑快捷键，或者原始快捷键和当前快捷键是否不同
    return JSON.stringify(originalShortcutKeys) !== JSON.stringify(currentShortcutKeys);
  }
  return JSON.stringify(originalConfig) !== JSON.stringify(currentConfig);
});

// 当前正在编辑的快捷键
const editingShortcut = ref<number | null>(null);
// 临时存储编辑中的按键
const tempKeys = ref<any[]>([]);
// 快捷键编辑弹窗状态
const shortcutModalVisible = ref(false);

// 开始编辑快捷键
function startEditShortcut(key: number) {
  editingShortcut.value = key;
  tempKeys.value = [...(currentShortcutKeys[key]?.key || [])];
  shortcutModalVisible.value = true;
  // 打开弹窗后添加全局按键监听
  document.addEventListener('keydown', handleKeyDown);
}

// 取消编辑快捷键
function cancelEditShortcut() {
  editingShortcut.value = null;
  tempKeys.value = [];
  shortcutModalVisible.value = false;
  // 关闭弹窗后移除全局按键监听
  document.removeEventListener('keydown', handleKeyDown);
}

// 确认编辑快捷键
function confirmEditShortcut() {
  const key = editingShortcut.value;
  if (key && tempKeys.value.length > 0) {
    currentShortcutKeys[key].key = [...tempKeys.value];
  }
  editingShortcut.value = null;
  tempKeys.value = [];
  shortcutModalVisible.value = false;
  // 关闭弹窗后移除全局按键监听
  document.removeEventListener('keydown', handleKeyDown);
}

// 处理按键事件
function handleKeyDown(event: any) {
  event.preventDefault();

  // 清除之前的按键
  tempKeys.value = [];

  // 添加修饰键
  if (event.ctrlKey) tempKeys.value.push('ctrl');
  if (event.shiftKey) tempKeys.value.push('shift');
  if (event.altKey) tempKeys.value.push('alt');
  if (event.metaKey) tempKeys.value.push('meta');

  // 添加主键（如果不是修饰键）
  const keyName = event.key.toLowerCase();
  if (!['control', 'shift', 'alt', 'meta'].includes(keyName) && keyName !== 'dead') {
    tempKeys.value.push(keyName === ' ' ? 'space' : keyName);
  }
}

// 保存配置
const saveConfig = async () => {
  if (!hasChanges.value) {
    return; // 如果没有修改，不做任何处理
  }
  if (selectedKey.value === 'general'
      || selectedKey.value === 'updater'
      || selectedKey.value === 'storage') {

    // 是否修改了【开机自启】
    const isUpdatePowerOnSelfStart = currentConfig.powerOnSelfStart !== originalConfig.powerOnSelfStart;
    // 是否修改了【替换全局热键】
    const isUpdateReplaceGlobalHotkey = currentConfig.replaceGlobalHotkey !== originalConfig.replaceGlobalHotkey;
    // 是否修改了【语言】
    const isUpdateLanguages = currentConfig.languages !== originalConfig.languages;
    // 是否修改了【启用标签】
    const isUpdateEnableTag = currentConfig.enableTag !== originalConfig.enableTag;
    // 是否修改了【标签绑定按钮位置】
    const isUpdateBindTagBtnShowLocation = currentConfig.bindTagBtnShowLocation !== originalConfig.bindTagBtnShowLocation;

    // 是否修改了【自动检查更新】
    const isUpdateAutoCheckUpdate = currentConfig.autoCheckUpdate !== originalConfig.autoCheckUpdate;
    // 是否修改了【自动更新方式】
    const isUpdateAutoUpdateMode = currentConfig.updateMode !== originalConfig.updateMode;
    // 是否修改了【自动更新时间间隔】
    const isUpdateAutoUpdateInterval = currentConfig.autoCheckUpdateInterval !== originalConfig.autoCheckUpdateInterval;

    // 是否修改了【最大存储条数】
    const isUpdateMaxHistoryItems = currentConfig.maxHistoryItems !== originalConfig.maxHistoryItems;
    // 是否修改了【自动清理天数】
    const isUpdateDataRetentionDays = currentConfig.dataRetentionDays !== originalConfig.dataRetentionDays;

    // 发送配置到主进程
    const isSuccess = await updateUserSettings(currentConfig);
    if (isSuccess) {
      if (isUpdateReplaceGlobalHotkey) {
        // 显示重启确认弹窗
        restartModalVisible.value = true;
      }
      // 是否修改了【语言】
      if (isUpdateLanguages) {
        // 更新语言
        await toggleLanguage(currentConfig.languages);
        // 保存语言
        await saveLanguageCache(getTray(currentConfig.languages));
        // 重新加载托盘菜单
        await invoke('reload_tray_menu');
      }
      // 是否修改了【开机自启】
      if (isUpdatePowerOnSelfStart) {
        const enabled = await isEnabled();
        if (currentConfig.powerOnSelfStart !== enabled) {
          if (currentConfig.powerOnSelfStart) {
            // 启用自启动
            await enable();
          } else {
            // 禁用自启动
            await disable();
          }
        }
      }
      // 是否修改了【自动检查更新】或者【自动更新方式】或者【自动更新时间间隔】
      if (isUpdateAutoCheckUpdate || isUpdateAutoUpdateMode || isUpdateAutoUpdateInterval) {
        // 发送更新了自动检查更新状态消息
        await emit('update-auto-check-update', {
          isUpdate: currentConfig.autoCheckUpdate,
          updateMode: currentConfig.updateMode,
          interval: currentConfig.autoCheckUpdateInterval
        });
      }
      // 是否修改了【启用标签】或者【标签位置】
      if (isUpdateEnableTag || isUpdateBindTagBtnShowLocation) {
        // 发送更新了启用标签状态消息
        await emit('update-tag-setting-state', {
          isShow: currentConfig.enableTag,
          location: currentConfig.bindTagBtnShowLocation,
        });
      }
      // 是否修改了【最大存储条数】或者【自动清理天数】
      if (isUpdateMaxHistoryItems || isUpdateDataRetentionDays) {
        await emit('update-data-history-restrict', {
          maxHistoryItems: currentConfig.maxHistoryItems,
          dataRetentionDays: currentConfig.dataRetentionDays
        });
      }
      message.success(currentLanguage.value.pages.settings.saveSuccessMsg);
      // 更新原始配置
      Object.assign(originalConfig, currentConfig);
    } else {
      message.error(currentLanguage.value.pages.settings.saveFailedMsg);
    }
  }
  if (selectedKey.value === 'shortcut') {
    //  // 是否修改了【唤醒程序】快捷键
    const isUpdateWakeUpRoutine = originalShortcutKeys.wakeUpRoutine.key !== currentShortcutKeys.wakeUpRoutine.key;
    const keys: string[] = originalShortcutKeys.wakeUpRoutine.key;
    // 发送快捷键配置到主进程
    try {
      const isSuccess = await saveUserShortcutKeys(JSON.stringify(currentShortcutKeys));
      if (isSuccess) {
        message.success(currentLanguage.value.pages.settings.saveSuccessMsg);
        // 更新原始快捷键配置，使用深拷贝确保两个对象不共享引用
        Object.assign(originalShortcutKeys, JSON.parse(JSON.stringify(currentShortcutKeys)));
        // 重新注册【唤醒程序】快捷键
        if (isUpdateWakeUpRoutine) {
          info("唤醒程序快捷键已修改，重新注册");
          // 重新注册快捷键
          const registerKey = convertRegisterKey(keys);
          if (await isRegistered(registerKey)) {
            // 如果已经注册了快捷键，需要先取消注册，再重新注册
            await unregister(registerKey);
          }
          await emit('update-open-window-key', {keys: currentShortcutKeys});
        }
        // 关闭编辑模式
        editingShortcut.value = null;
      } else {
        message.error(currentLanguage.value.pages.settings.saveFailedMsg);
      }
    } catch (er) {
      error('保存快捷键设置出错:' + er);
      message.error(currentLanguage.value.pages.settings.shortcutSaveErrorMsg + er);
    }
  }
};

// 重置配置
const resetConfig = () => {
  if (selectedKey.value === 'shortcut') {
    Object.assign(currentShortcutKeys, originalShortcutKeys);
    // 关闭编辑模式
    editingShortcut.value = null;
    message.info(currentLanguage.value.pages.settings.resetSuccessMsg);
  }
  if (selectedKey.value === 'general') {
    Object.assign(currentConfig, originalConfig);
    message.info(currentLanguage.value.pages.settings.resetSuccessMsg);
  }
};

// 处理重启应用
const handleRestart = async () => {
  restartModalVisible.value = false;
  // 触发重启应用
  // exits the app with the given status code
  await exit(0);

  // restarts the app
  await relaunch();
};

// 加载配置
onMounted(async () => {
  // 初始化用户配置
  const settings = await getSettings();
  Object.assign(originalConfig, settings);
  Object.assign(currentConfig, settings);

  // 初始化快捷键配置
  const shortcutKeys = await getShortcutKeys();
  // 使用深拷贝，避免更新一个后另外一个也会同时更新
  Object.assign(originalShortcutKeys, JSON.parse(JSON.stringify(shortcutKeys)));
  Object.assign(currentShortcutKeys, JSON.parse(JSON.stringify(shortcutKeys)));
});
</script>
<template>
  <div class="settings-container">
    <titleBar :title="currentLanguage.pages.settings.title" :showCloseBtn="true" :dev-tool="`settings`"/>

    <div class="settings-content">
      <!-- 左侧菜单 -->
      <div class="settings-menu">
        <n-menu v-model:value="selectedKey" :options="menuItems" mode="vertical"/>
      </div>

      <!-- 右侧内容 -->
      <div class="settings-form">
        <!-- 通用设置 -->
        <div v-if="selectedKey === 'general'" class="settings-section">
          <h2>{{ currentLanguage.pages.settings.generalTitle }}</h2>
          <div class="form-item">
            <span class="label">{{ currentLanguage.pages.settings.powerOnSelfStart }}</span>
            <n-switch v-model:value="currentConfig.powerOnSelfStart"/>
          </div>
          <!-- todo 暂时没有办法替换Windows默认的剪贴板程序 -->
          <!-- <div class="form-item">
<span class="label">{{ currentLanguage.pages.settings.replaceGlobalHotkey }}</span>
<n-switch v-model:value="currentConfig.replaceGlobalHotkey" />
</div> -->
          <div class="form-item">
            <span class="label">{{ currentLanguage.pages.settings.languages }}</span>
            <n-select class="select" v-model:value="currentConfig.languages" :options="languageOptions"/>
          </div>
          <div class="form-item">
            <span class="label">{{ currentLanguage.pages.settings.enableTag }}</span>
            <n-switch v-model:value="currentConfig.enableTag"/>
          </div>
          <div class="form-item" v-if="currentConfig.enableTag">
            <span class="label">{{ currentLanguage.pages.settings.bindTagBtnShowLocation }}</span>
            <n-select class="select" v-model:value="currentConfig.bindTagBtnShowLocation"
                      :options="bindTagBtnShowLocation"/>
          </div>
        </div>

        <!-- 更新设置 -->
        <div v-if="selectedKey === 'updater'" class="settings-section">
          <h2>{{ currentLanguage.pages.settings.generalTitle }}</h2>
          <div class="form-item">
            <span class="label">{{ currentLanguage.pages.settings.autoCheckUpdate }}</span>
            <n-switch v-model:value="currentConfig.autoCheckUpdate"/>
          </div>
          <div class="form-item" v-if="currentConfig.autoCheckUpdate">
            <span class="label">{{ currentLanguage.pages.settings.checkUpdateMode }}</span>
            <n-select class="select" v-model:value="currentConfig.updateMode" :options="autoUpdateMode"/>
          </div>
          <div class="line" v-if="currentConfig.autoCheckUpdate && currentConfig.updateMode === 'timing'">
            <div class="main-item">
              <span class="label">{{ currentLanguage.pages.settings.timeInterval }}</span>
              <n-input-number v-model:value="currentConfig.autoCheckUpdateInterval" :min="1" :max="720">
                <template #suffix>
                  {{ currentLanguage.pages.settings.timeIntervalUnit }}
                </template>
              </n-input-number>
            </div>
            <div class="second-item">
              <div class="hint">
                <HintIcon class="hint-icon"/>
                {{ currentLanguage.pages.settings.timeIntervalHint }}
              </div>
            </div>
          </div>
        </div>

        <!-- 存储设置 -->
        <div v-if="selectedKey === 'storage'" class="settings-section">
          <h2>{{ currentLanguage.pages.settings.storageTitle }}</h2>
          <div class="line">
            <div class="main-item">
              <span class="label">{{ currentLanguage.pages.settings.maxHistoryItems }}</span>
              <n-input-number v-model:value="currentConfig.maxHistoryItems" :min="0" :max="10000"/>
            </div>
            <div class="second-item">
              <div class="hint">
                <HintIcon class="hint-icon"/>
                {{ currentLanguage.pages.settings.maxHistoryItemsHint }}
              </div>
            </div>
          </div>
          <div class="line">
            <div class="main-item">
              <span class="label">{{ currentLanguage.pages.settings.dataRetentionDays }}</span>
              <n-input-number v-model:value="currentConfig.dataRetentionDays" :min="0" :max="365"/>
            </div>
            <div class="second-item">
              <div class="hint">
                <HintIcon class="hint-icon"/>
                {{ currentLanguage.pages.settings.dataRetentionDaysHint }}
              </div>
            </div>
          </div>
        </div>

        <!-- 快捷键设置 -->
        <div v-if="selectedKey === 'shortcut'" class="settings-section">
          <h2>{{ currentLanguage.pages.settings.shortcutTitle }}</h2>

          <div v-for="(shortcut, key) in currentShortcutKeys" :key="key" class="form-item shortcut-item">
            <span class="label">{{ currentLanguage.pages.settings[key] }}</span>
            <!-- 显示当前快捷键 -->
            <div class="shortcut-display">
              <div class="shortcut-keys">
                <template v-for="(k, index) in shortcut.key" :key="index">
                  <span class="key-badge">{{ formatKeyDisplay(k) }}</span>
                  <span v-if="index < shortcut.key.length - 1" class="key-plus">+</span>
                </template>
              </div>
              <span class="edit-icon" @click="startEditShortcut(key)">
                <EditIcon/>
              </span>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="settings-footer">
          <n-button @click="resetConfig" :disabled="!hasChanges">
            {{ currentLanguage.pages.settings.resetBtn }}
          </n-button>
          <n-button type="primary" :disabled="!hasChanges" @click="saveConfig">
            {{ currentLanguage.pages.settings.saveBtn }}
          </n-button>
        </div>
      </div>
    </div>

    <!-- 重启确认弹窗 -->
    <n-modal v-model:show="restartModalVisible" :title="currentLanguage.pages.settings.restartModalTitle"
             preset="dialog">
      <p>{{ currentLanguage.pages.settings.restartModalContent }}</p>
      <template #action>
        <n-button @click="restartModalVisible = false">
          {{ currentLanguage.pages.settings.restartModalCancelBtn }}
        </n-button>
        <n-button type="primary" @click="handleRestart">
          {{ currentLanguage.pages.settings.restartModalConfirmBtn }}
        </n-button>
      </template>
    </n-modal>

    <!-- 快捷键编辑弹窗 -->
    <n-modal v-model:show="shortcutModalVisible" :title="currentLanguage.pages.settings.editHotkeyModalTitle"
             preset="dialog">
      <div class="shortcut-modal-content">
        <p>{{ currentLanguage.pages.settings.editHotkeyModalContent }}</p>
        <div class="shortcut-keys">
          {{
            convertShow(tempKeys) || currentLanguage.pages.settings.editHotkeyModalHint
          }}
        </div>
      </div>
      <template #action>
        <n-button @click="cancelEditShortcut">
          {{ currentLanguage.pages.settings.editHotkeyModalCancelBtn }}
        </n-button>
        <n-button type="primary" :disabled="tempKeys.length === 0" @click="confirmEditShortcut">
          {{ currentLanguage.pages.settings.editHotkeyModalConfirmBtn }}
        </n-button>
      </template>
    </n-modal>
  </div>
</template>

<style scoped>
.settings-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.settings-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.settings-menu {
  width: 150px;
  border-right: 1px solid var(--theme-border);
  background-color: var(--theme-menuItemBackground);
}

.settings-form {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.settings-section {
  margin-bottom: 20px;
}

.settings-section h2 {
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 500;
}

.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  justify-content: space-between;
}

.label {
  width: 200px;
  margin-right: 16px;
}

.settings-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--theme-divider);
  position: fixed;
  bottom: 0;
  background-color: var(--theme-background);
  width: 65%;
}

.shortcut-modal-content {
  padding: 16px 0;
}

.shortcut-keys {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}


/* 快捷键相关样式 */
.shortcut-item {
  margin-bottom: 0px;
}

.shortcut-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  border-radius: 6px;
  background-color: var(--theme-background-secondary);
  transition: background-color 0.2s;
}


.key-plus {
  font-weight: bold;
  opacity: 0.7;
  font-size: 14px;
}

.shortcut-display:hover {
  background-color: var(--theme-background-hover);
}

.key-badge {
  display: inline-block;
  padding: 4px 10px;
  background-color: var(--theme-divider);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--theme-text);
  /* box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
border: 1px solid rgba(255, 255, 255, 0.1); */
}

.edit-icon {
  width: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0.5;
  margin-left: 10px;
  cursor: pointer;
}

.edit-icon:hover {
  opacity: 1;
}

.shortcut-edit {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shortcut-input {
  padding: 8px 12px;
  border: 1px solid var(--theme-divider);
  border-radius: 4px;
  background-color: var(--theme-background-secondary);
  cursor: text;
  min-height: 36px;
  outline: none;
}

.shortcut-input:focus {
  border-color: var(--theme-primary);
}

.shortcut-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.shortcut-modal-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 10px 0;
}

.shortcut-hint {
  color: var(--theme-secondary);
  font-size: 14px;
  margin: 0;
}

.right {
  justify-content: flex-end !important;
}

.setting-label {
  font-size: 14px;
  min-width: 90px;
  margin-right: 5px;
}

.sub-label {
  min-width: 0px !important;
}

.window-size-inputs {
  display: flex;
  gap: 16px;
  width: 70%;
}

.size-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.setting-description {
  color: var(--theme-secondary);
  font-size: 14px;
  margin-top: 8px;
}

.select {
  width: 30%;
}

.line {
  margin-bottom: 16px;
}

.main-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hint {
  display: flex;
  font-size: 11px;
  opacity: 0.5;
  align-items: center;
  justify-content: flex-start;
  flex-direction: row;
  color: var(--theme-text);
}

.hint-icon {
  width: 12px;
  margin-right: 4px;
}
</style>
