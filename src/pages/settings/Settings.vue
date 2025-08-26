<script setup lang="ts">
import {useMessage} from 'naive-ui';
import EditIcon from '../../assets/icons/EditIcon.vue';
import TitleBar from '../../components/TitleBar.vue';

import {invoke} from '@tauri-apps/api/core';
import {emit} from '@tauri-apps/api/event';
import {disable, enable, isEnabled} from '@tauri-apps/plugin-autostart';
import {isRegistered, register, unregister} from '@tauri-apps/plugin-global-shortcut';
import {error, info} from '@tauri-apps/plugin-log';
import {computed, onMounted, reactive, ref} from 'vue';
import HintIcon from '../../assets/icons/HintIcon.vue';
import {saveLanguageCache} from '../../services/FileService.ts';
import {getTray, languages, useLanguage} from '../../services/LanguageService.ts';
import {convertRegisterKey, convertShow, formatKeyDisplay} from '../../utils/ShortcutKeys.ts';
import {getWakeUpRoutineKeyAvailable} from "../../store/ShortcutKeyAvailableStatus.ts";
import PassedIcon from "../../assets/icons/PassedIcon.vue";
import ErrorIcon from "../../assets/icons/ErrorIcon.vue";
import {isMac} from "../../data/SystemParams.ts";
import {openLink} from "../../utils/link.ts";
import {
  getAlwaysOnTop,
  getAutoCheckUpdate,
  getAutoCheckUpdateInterval,
  getAutoHideWindow,
  getBindTagBtnShowLocation,
  getDataRetentionDays,
  getEnableTag,
  getMaxHistoryItems,
  getNewVersionAlertMode,
  getPowerOnSelfStart,
  getReplaceGlobalHotkey,
  getUpdateMode,
  saveAlwaysOnTop,
  saveAutoCheckUpdate,
  saveAutoCheckUpdateInterval,
  saveAutoHideWindow,
  saveBindTagBtnShowLocation,
  saveDataRetentionDays, saveEnableAnimationEffects,
  saveEnableTag,
  saveLanguage,
  saveMaxHistoryItems,
  saveNewVersionAlertMode, saveAnimationSpeedLevel,
  savePowerOnSelfStart,
  saveReplaceGlobalHotkey,
  saveUpdateMode
} from "../../store/Settings.ts";
import {getSearchKey, getWakeUpRoutine, saveSearchKey, saveWakeUpRoutineKey} from "../../store/ShortcutKeys.ts";

const message = useMessage();
const {currentLanguage, toggleLanguage} = useLanguage();

// 重启确认弹窗状态
const restartModalVisible = ref(false);

// 菜单相关
const selectedKey = ref<string>('general');
const menuItems = computed(() => [
  {key: 'general', label: currentLanguage.value.pages.settings.generalMenu},
  {key: 'themes', label: currentLanguage.value.pages.settings.themesMenu},
  {key: 'updater', label: currentLanguage.value.pages.settings.updaterMenu},
  {key: 'storage', label: currentLanguage.value.pages.settings.storageMenu},
  {key: 'shortcut', label: currentLanguage.value.pages.settings.shortcutMenu},
]);

// 配置相关
const originalConfig = reactive<Settings>({
  theme: "light",
  powerOnSelfStart: false,
  replaceGlobalHotkey: false,
  languages: "chinese",
  maxHistoryItems: 2000,
  dataRetentionDays: 30,
  autoCheckUpdate: true,
  updateMode: "timing",
  autoCheckUpdateInterval: 1,
  enableTag: true,
  bindTagBtnShowLocation: 'top-right',
  autoHideWindow: false,
  alwaysOnTop: true,
  newVersionAlertMode: 'toast',
  enableAnimationEffects: true,         // 默认启用动画
  pageTransitionDuration: 350,        // 默认动画时长
  animationSpeedLevel: 'normal', // 默认缓动函数
});

// 当前编辑的配置
const currentConfig = reactive<Settings>({
  theme: "light",
  powerOnSelfStart: false,
  replaceGlobalHotkey: false,
  languages: "chinese",
  maxHistoryItems: 2000,
  dataRetentionDays: 30,
  autoCheckUpdate: true,
  updateMode: "timing",
  autoCheckUpdateInterval: 1,
  enableTag: true,
  bindTagBtnShowLocation: 'top-right',
  autoHideWindow: false,
  alwaysOnTop: true,
  newVersionAlertMode: 'toast',
  enableAnimationEffects: true,         // 默认启用动画
  pageTransitionDuration: 350,        // 默认动画时长
  animationSpeedLevel: 'normal', // 默认缓动函数
});

// 配置相关
const originalShortcutKeys = reactive<ShortcutKeys>({
  search: {
    name: "搜索",
    key: [
      "ctrl",
      "f"
    ]
  },
  wakeUpRoutine: {
    name: "唤醒程序",
    key: [
      "alt",
      "c"
    ]
  }
});

// 当前编辑的配置
const currentShortcutKeys = reactive<ShortcutKeys>({
  search: {
    name: "搜索",
    key: [
      "ctrl",
      "f"
    ]
  },
  wakeUpRoutine: {
    name: "唤醒程序",
    key: [
      "alt",
      "c"
    ]
  }
});

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
  label: currentLanguage.value.pages.settings.regularCheck
}, {
  value: 'after-running',
  label: currentLanguage.value.pages.settings.afterRunningCheck
}])

// 更新提示显示方式
const updateHintMode = computed(() => [{
  value: 'toast',
  label: currentLanguage.value.pages.settings.toast
}, {
  value: 'dialog',
  label: currentLanguage.value.pages.settings.dialog
}])

// 动画速度选项
const transitionSpeedOptions = computed(() => [
  {
    label: currentLanguage.value.pages.settings.transitionSpeedFast,
    value: 'fast',
  },
  {
    label: currentLanguage.value.pages.settings.transitionSpeedNormal,
    value: 'normal',
  },
  {
    label: currentLanguage.value.pages.settings.transitionSpeedSlow,
    value: 'slow',
  },
]);

const onLoading = ref(false);

// 当前正在编辑的快捷键
const editingShortcut = ref<keyof ShortcutKeys | ''>('');
// 临时存储编辑中的按键
const tempKeys = ref<string[]>([]);
// 快捷键编辑弹窗状态
const shortcutModalVisible = ref(false);
// 快捷键是否可用
const availableKey = ref(true);
// 当前程序是否占用系统快捷键
const systemClipboardKeyOccupied = ref(false);
// 系统剪贴板是否启用
const systemClipboardEnable = ref(false);
// 系统剪贴板未启用的情况下，系统剪贴板快捷键是否被注册
const systemClipboardKeysRegistered = ref(false);
// 当前程序是否为管理员启动
const isAdminStart = ref(false);

/**
 * 开始编辑快捷键
 * @param key 快捷键类型
 */
function startEditShortcut(key: keyof ShortcutKeys) {
  editingShortcut.value = key;
  tempKeys.value = [...(currentShortcutKeys[key]?.key || [])];
  shortcutModalVisible.value = true;
  // 如果修改的是唤醒程序快捷键，需要检查快捷键是否可用
  if (key.toString() === 'wakeUpRoutine') {
    getWakeUpRoutineKeyAvailable().then(available => {
      if (available === undefined) {
        availableKey.value = true;
      } else {
        availableKey.value = available;
      }
    });
  } else {
    availableKey.value = true;
  }
  // 打开弹窗后添加全局按键监听
  document.addEventListener('keydown', handleKeyDown);
}

/**
 * 取消编辑快捷键
 */
function cancelEditShortcut() {
  editingShortcut.value = '';
  tempKeys.value = [];
  shortcutModalVisible.value = false;
  // 关闭弹窗后移除全局按键监听
  document.removeEventListener('keydown', handleKeyDown);
}

/**
 * 确认编辑快捷键
 */
async function confirmEditShortcut() {
  try {
    onLoading.value = true;
    const key = editingShortcut.value;
    if (key && tempKeys.value.length > 0) {
      currentShortcutKeys[key].key = [...tempKeys.value];
    }
    if (editingShortcut.value === 'wakeUpRoutine') {
      await saveWakeUpRoutineKey(currentShortcutKeys[key]);
      const keys: string[] = originalShortcutKeys.wakeUpRoutine.key;
      info("唤醒程序快捷键已修改，重新注册");
      // 重新注册快捷键
      const registerKey = convertRegisterKey(keys);
      if (await isRegistered(registerKey)) {
        // 如果已经注册了快捷键，需要先取消注册，再重新注册
        await unregister(registerKey);
      }
      await emit('update-open-window-key', {keys: currentShortcutKeys});
    }
    if (editingShortcut.value === 'search') {
      await saveSearchKey(currentShortcutKeys[key]);
    }
    originalShortcutKeys[editingShortcut.value].key = currentShortcutKeys[editingShortcut.value].key;
    editingShortcut.value = '';
    tempKeys.value = [];
    shortcutModalVisible.value = false;
    // 关闭弹窗后移除全局按键监听
    document.removeEventListener('keydown', handleKeyDown);
  } catch (e) {
    error('修改快捷键设置出错:' + e);
    message.error(currentLanguage.value.pages.settings.saveFailedMsg);
  } finally {
    onLoading.value = false;
  }
}

/**
 * 处理按键事件
 * @param event 事件
 */
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
  // 如果修改的是唤醒程序快捷键，需要检查快捷键是否可用
  if (editingShortcut.value && editingShortcut.value.toString() === 'wakeUpRoutine') {
    checkShortcutKeys();
  }
}

/**
 * 检查快捷键是否可用
 */
async function checkShortcutKeys() {
  const key = editingShortcut.value || "";
  const isUpdate = currentShortcutKeys[key].key === tempKeys.value;
  availableKey.value = !isUpdate || await isRegistered(convertRegisterKey(currentShortcutKeys[key].key));
}

/**
 * 更新系统快捷键
 */
async function updateToSystemShortcutKeys() {
  const key = ['meta', 'v'];
  // 没有找到注册表配置，直接修改快捷键
  info("唤醒程序快捷键已修改，重新注册");

  // 注销快捷键
  try {
    const keys: string[] = originalShortcutKeys.wakeUpRoutine.key;
    const registerKey = convertRegisterKey(keys);
    if (await isRegistered(registerKey)) {
      // 如果已经注册了快捷键，需要先取消注册，再重新注册
      await unregister(registerKey);
    }
  } catch (e) {
    info("快捷键注销失败" + e);
  }

  // 修改快捷键
  currentShortcutKeys.wakeUpRoutine.key = key;
  await emit('update-open-window-key', {keys: currentShortcutKeys});
}

/**
 * 修改开机自启配置
 * @param powerOnSelfStart 是否开机自启
 */
async function onChangePowerOnSelfStart(powerOnSelfStart: boolean) {
  onLoading.value = true;
  try {
    await savePowerOnSelfStart(powerOnSelfStart);
    const enabled = await isEnabled();
    if (powerOnSelfStart !== enabled) {
      if (powerOnSelfStart) {
        // 启用自启动
        await enable();
      } else {
        // 禁用自启动
        await disable();
      }
    }
    originalConfig.powerOnSelfStart = powerOnSelfStart;
    currentConfig.powerOnSelfStart = powerOnSelfStart;
  } catch (e) {
    error('修改自启动设置出错:' + e);
    message.error(currentLanguage.value.pages.settings.saveFailedMsg);
    currentConfig.powerOnSelfStart = originalConfig.powerOnSelfStart;
  } finally {
    onLoading.value = false;
  }
}

/**
 * 修改自动隐藏窗口配置
 * @param autoHideWindow 是否自动隐藏窗口
 */
async function onChangeAutoHideWindow(autoHideWindow: boolean) {
  onLoading.value = true;
  try {
    await saveAutoHideWindow(autoHideWindow);
    originalConfig.autoHideWindow = autoHideWindow;
    currentConfig.autoHideWindow = autoHideWindow;
    // 发送更新了启用标签状态消息
    await emit('update-auto-hide-window', {isAutoHide: currentConfig.autoHideWindow});
  } catch (e) {
    error('修改自动隐藏窗口设置出错:' + e);
    message.error(currentLanguage.value.pages.settings.saveFailedMsg);
    currentConfig.autoHideWindow = originalConfig.autoHideWindow;
  } finally {
    onLoading.value = false;
  }
}

/**
 * 修改窗口置顶配置
 * @param alwaysOnTop 是否置顶
 */
async function onChangeAlwaysOnTop(alwaysOnTop: boolean) {
  onLoading.value = true;
  try {
    await saveAlwaysOnTop(alwaysOnTop);
    // 发送更新了窗口置顶状态消息
    await emit('update-always-on-top', {isTop: currentConfig.alwaysOnTop});
    originalConfig.alwaysOnTop = alwaysOnTop;
    currentConfig.alwaysOnTop = alwaysOnTop;
  } catch (e) {
    error('修改窗口置顶设置出错:' + e);
    message.error(currentLanguage.value.pages.settings.saveFailedMsg);
    currentConfig.alwaysOnTop = originalConfig.alwaysOnTop;
  } finally {
    onLoading.value = false;
  }
}

/**
 * 修改替换全局热键配置
 * @param replaceGlobalHotkey 是否替换全局热键
 */
async function onChangeReplaceGlobalHotkey(replaceGlobalHotkey: boolean) {
  onLoading.value = true;
  try {
    // 打开替换全局热键
    if (currentConfig.replaceGlobalHotkey) {
      const enable = await invoke<boolean>('valid_clipboard_regedit');
      if (!enable) {
        await updateToSystemShortcutKeys();
      } else {
        // 有找到注册表配置，需要修改注册表，再修改快捷键
        const backupResult = await invoke<boolean>('backup_clipboard_regedit');
        if (!backupResult) {
          console.log("备份注册表失败");
          message.error(currentLanguage.value.pages.settings.enableReplaceGlobalHotkeyFailedMsg);
          // 回滚【替换全局热键】设置
          currentConfig.replaceGlobalHotkey = !currentConfig.replaceGlobalHotkey;
          return;
        } else {
          await updateToSystemShortcutKeys();
          // 显示重启确认弹窗
          restartModalVisible.value = true;
        }
      }
    } else {
      // 关闭全局热键，重置快捷键
      info("唤醒程序快捷键已修改，重新注册");
      const valid = await invoke<boolean>('valid_clipboard_backup_regedit');
      let isBackupSuccess = true;
      if (valid) {
        // 恢复注册表配置
        const backupResult = await invoke<boolean>('recover_clipboard_regedit');
        if (!backupResult) {
          console.log("恢复注册表失败");
          message.error(currentLanguage.value.pages.settings.disableReplaceGlobalHotkeyFailedMsg);
          // 回滚【替换全局热键】设置
          currentConfig.replaceGlobalHotkey = !currentConfig.replaceGlobalHotkey;
          isBackupSuccess = false;
        }
      }

      if (isBackupSuccess) {
        // 注销快捷键
        try {
          const keys: string[] = originalShortcutKeys.wakeUpRoutine.key;
          const registerKey = convertRegisterKey(keys);
          if (await isRegistered(registerKey)) {
            // 如果已经注册了快捷键，需要先取消注册，再重新注册
            await unregister(registerKey);
          }
        } catch (e) {
          info("快捷键注销失败" + e);
        }

        // 修改快捷键
        currentShortcutKeys.wakeUpRoutine.key = ['alt', 'c'];
        await emit('update-open-window-key', {keys: currentShortcutKeys});

        if (valid) {
          // 显示重启确认弹窗
          restartModalVisible.value = true;
        }
      } else {
        return;
      }
    }
    await saveReplaceGlobalHotkey(replaceGlobalHotkey);
    originalConfig.replaceGlobalHotkey = replaceGlobalHotkey;
    currentConfig.replaceGlobalHotkey = replaceGlobalHotkey;
  } catch (e) {
    error('修改窗口置顶设置出错:' + e);
    message.error(currentLanguage.value.pages.settings.saveFailedMsg);
    currentConfig.replaceGlobalHotkey = originalConfig.replaceGlobalHotkey;
  } finally {
    onLoading.value = false;
  }
}

/**
 * 修改语言
 * @param languages 语言
 */
async function onChangeLanguages(languages: string) {
  onLoading.value = true;
  try {
    await saveLanguage(languages);
    // 更新语言
    await toggleLanguage(currentConfig.languages);
    // 保存语言
    await saveLanguageCache(getTray(currentConfig.languages));
    // 重新加载托盘菜单
    await invoke('reload_tray_menu');
    originalConfig.languages = languages;
    currentConfig.languages = languages;
  } catch (e) {
    error('修改语言设置出错:' + e);
    message.error(currentLanguage.value.pages.settings.saveFailedMsg);
    currentConfig.languages = originalConfig.languages;
  } finally {
    onLoading.value = false;
  }
}

/**
 * 修改是否启用标签
 * @param enableTag 是否启用标签
 */
async function onChangeEnableTag(enableTag: boolean) {
  onLoading.value = true;
  try {
    await saveEnableTag(enableTag);
    // 发送更新了启用标签状态消息
    await emit('update-tag-setting-state', {
      isShow: currentConfig.enableTag,
      location: currentConfig.bindTagBtnShowLocation,
    });
    originalConfig.enableTag = enableTag;
    currentConfig.enableTag = enableTag;
  } catch (e) {
    error('修改是否启用标签设置出错:' + e);
    message.error(currentLanguage.value.pages.settings.saveFailedMsg);
    currentConfig.enableTag = originalConfig.enableTag;
  } finally {
    onLoading.value = false;
  }
}

/**
 * 修改标签按钮显示位置
 * @param bindTagBtnShowLocation 标签按钮显示位置
 */
async function onChangeBindTagBtnShowLocation(bindTagBtnShowLocation: string) {
  onLoading.value = true;
  try {
    await saveBindTagBtnShowLocation(bindTagBtnShowLocation);
    // 发送更新了启用标签状态消息
    await emit('update-tag-setting-state', {
      isShow: currentConfig.enableTag,
      location: currentConfig.bindTagBtnShowLocation,
    });
    originalConfig.bindTagBtnShowLocation = bindTagBtnShowLocation;
    currentConfig.bindTagBtnShowLocation = bindTagBtnShowLocation;
  } catch (e) {
    error('修改标签按钮显示位置设置出错:' + e);
    message.error(currentLanguage.value.pages.settings.saveFailedMsg);
    currentConfig.bindTagBtnShowLocation = originalConfig.bindTagBtnShowLocation;
  } finally {
    onLoading.value = false;
  }
}

/**
 * 修改自动检查更新
 * @param autoCheckUpdate 是否自动检查更新
 */
async function onChangeAutoCheckUpdate(autoCheckUpdate: boolean) {
  onLoading.value = true;
  try {
    await saveAutoCheckUpdate(autoCheckUpdate);
    // 发送更新了自动检查更新状态消息
    await emit('update-auto-check-update', {
      isUpdate: currentConfig.autoCheckUpdate,
      updateMode: currentConfig.updateMode,
      interval: currentConfig.autoCheckUpdateInterval
    });
    originalConfig.autoCheckUpdate = autoCheckUpdate;
    currentConfig.autoCheckUpdate = autoCheckUpdate;
  } catch (e) {
    error('修改自动检查更新设置出错:' + e);
    message.error(currentLanguage.value.pages.settings.saveFailedMsg);
    currentConfig.autoCheckUpdate = originalConfig.autoCheckUpdate;
  } finally {
    onLoading.value = false;
  }
}

/**
 * 修改更新模式
 * @param updateMode 更新模式
 */
async function onChangeUpdateMode(updateMode: string) {
  onLoading.value = true;
  try {
    await saveUpdateMode(updateMode);
    // 发送更新了自动检查更新状态消息
    await emit('update-auto-check-update', {
      isUpdate: currentConfig.autoCheckUpdate,
      updateMode: currentConfig.updateMode,
      interval: currentConfig.autoCheckUpdateInterval
    });
    originalConfig.updateMode = updateMode;
    currentConfig.updateMode = updateMode;
  } catch (e) {
    error('修改更新模式设置出错:' + e);
    message.error(currentLanguage.value.pages.settings.saveFailedMsg);
    currentConfig.updateMode = originalConfig.updateMode;
  } finally {
    onLoading.value = false;
  }
}

/**
 * 修改自动检查更新间隔
 */
async function onChangeAutoCheckUpdateInterval() {
  if (originalConfig.autoCheckUpdateInterval !== currentConfig.autoCheckUpdateInterval) {
    onLoading.value = true;
    try {
      await saveAutoCheckUpdateInterval(currentConfig.autoCheckUpdateInterval);
      // 发送更新了自动检查更新状态消息
      await emit('update-auto-check-update', {
        isUpdate: currentConfig.autoCheckUpdate,
        updateMode: currentConfig.updateMode,
        interval: currentConfig.autoCheckUpdateInterval
      });
      originalConfig.autoCheckUpdateInterval = currentConfig.autoCheckUpdateInterval;
    } catch (e) {
      error('修改自动检查更新间隔设置出错:' + e);
      message.error(currentLanguage.value.pages.settings.saveFailedMsg);
      currentConfig.autoCheckUpdateInterval = originalConfig.autoCheckUpdateInterval;
    } finally {
      onLoading.value = false;
    }
  }
}

/**
 * 修改新版本提示模式
 * @param newVersionAlertMode 新版本提示模式
 */
async function onChangeNewVersionAlertMode(newVersionAlertMode: string) {
  onLoading.value = true;
  try {
    await saveNewVersionAlertMode(newVersionAlertMode);
    // 发送更新了自动检查更新状态消息
    await emit('update-auto-check-update', {
      isUpdate: currentConfig.autoCheckUpdate,
      updateMode: currentConfig.updateMode,
      interval: currentConfig.autoCheckUpdateInterval
    });
    originalConfig.newVersionAlertMode = newVersionAlertMode;
    currentConfig.newVersionAlertMode = newVersionAlertMode;
  } catch (e) {
    error('修改新版本提示模式设置出错:' + e);
    message.error(currentLanguage.value.pages.settings.saveFailedMsg);
    currentConfig.newVersionAlertMode = originalConfig.newVersionAlertMode;
  } finally {
    onLoading.value = false;
  }
}

/**
 * 修改最大历史记录项数
 */
async function onChangeMaxHistoryItems() {
  if (currentConfig.maxHistoryItems !== originalConfig.maxHistoryItems) {
    onLoading.value = true;
    try {
      await saveMaxHistoryItems(currentConfig.maxHistoryItems);
      await emit('update-data-history-restrict', {
        maxHistoryItems: currentConfig.maxHistoryItems,
        dataRetentionDays: currentConfig.dataRetentionDays
      });
      originalConfig.maxHistoryItems = currentConfig.maxHistoryItems;
    } catch (e) {
      error('修改最大历史记录项数设置出错:' + e);
      message.error(currentLanguage.value.pages.settings.saveFailedMsg);
      currentConfig.maxHistoryItems = originalConfig.maxHistoryItems;
    } finally {
      onLoading.value = false;
    }
  }
}

/**
 * 修改数据保留天数
 */
async function onChangeDataRetentionDays() {
  if (currentConfig.dataRetentionDays !== originalConfig.dataRetentionDays) {
    onLoading.value = true;
    try {
      await saveDataRetentionDays(currentConfig.dataRetentionDays);
      await emit('update-data-history-restrict', {
        maxHistoryItems: currentConfig.maxHistoryItems,
        dataRetentionDays: currentConfig.dataRetentionDays
      });
      originalConfig.dataRetentionDays = currentConfig.dataRetentionDays;
    } catch (e) {
      error('修改数据保留天数设置出错:' + e);
      message.error(currentLanguage.value.pages.settings.saveFailedMsg);
      currentConfig.dataRetentionDays = originalConfig.dataRetentionDays;
    } finally {
      onLoading.value = false;
    }
  }
}

/**
 * 修改是否启用动画效果
 * @param enableAnimationEffects 是否启用动画效果
 */
async function onChangeEnableAnimationEffects(enableAnimationEffects: boolean) {
  onLoading.value = true;
  try {
    await saveEnableAnimationEffects(enableAnimationEffects);
    // todo 发送全局消息
    await emit('', {
      isEnable: currentConfig.enableAnimationEffects,
      speed: currentConfig.animationSpeedLevel,
    });
    originalConfig.enableAnimationEffects = enableAnimationEffects;
    currentConfig.enableAnimationEffects = enableAnimationEffects;
  } catch (e) {
    error('修改是否启用动画效果设置出错:' + e);
    message.error(currentLanguage.value.pages.settings.saveFailedMsg);
    currentConfig.enableAnimationEffects = originalConfig.enableAnimationEffects;
  } finally {
    onLoading.value = false;
  }
}

/**
 * 修改动画速度
 * @param animationSpeedLevel 动画速度
 */
async function onChangeAnimationSpeedLevel(animationSpeedLevel: string) {
  onLoading.value = true;
  try {
    await saveAnimationSpeedLevel(animationSpeedLevel);
    // todo 发送全局消息
    await emit('', {
      isEnable: currentConfig.enableAnimationEffects,
      speed: currentConfig.animationSpeedLevel,
    });
    originalConfig.animationSpeedLevel = animationSpeedLevel;
    currentConfig.animationSpeedLevel = animationSpeedLevel;
  } catch (e) {
    error('修改动画速度设置出错:' + e);
    message.error(currentLanguage.value.pages.settings.saveFailedMsg);
    currentConfig.animationSpeedLevel = originalConfig.animationSpeedLevel;
  } finally {
    onLoading.value = false;
  }
}

// 处理重启电脑
const handleRestart = async () => {
  restartModalVisible.value = false;

  await invoke('restart_computer');
};

// 加载配置
onMounted(async () => {
  try {
    // 初始化用户配置
    const powerOnSelfStart = await getPowerOnSelfStart();
    originalConfig.powerOnSelfStart = powerOnSelfStart;
    currentConfig.powerOnSelfStart = powerOnSelfStart;

    const replaceGlobalHotkey = await getReplaceGlobalHotkey();
    originalConfig.replaceGlobalHotkey = replaceGlobalHotkey;
    currentConfig.replaceGlobalHotkey = replaceGlobalHotkey;

    const maxHistoryItems = await getMaxHistoryItems();
    originalConfig.maxHistoryItems = maxHistoryItems;
    currentConfig.maxHistoryItems = maxHistoryItems;

    const dataRetentionDays = await getDataRetentionDays();
    originalConfig.dataRetentionDays = dataRetentionDays;
    currentConfig.dataRetentionDays = dataRetentionDays;

    const autoCheckUpdate = await getAutoCheckUpdate();
    originalConfig.autoCheckUpdate = autoCheckUpdate;
    currentConfig.autoCheckUpdate = autoCheckUpdate;

    const updateMode = await getUpdateMode();
    originalConfig.updateMode = updateMode;
    currentConfig.updateMode = updateMode;

    const autoCheckUpdateInterval = await getAutoCheckUpdateInterval();
    originalConfig.autoCheckUpdateInterval = autoCheckUpdateInterval;
    currentConfig.autoCheckUpdateInterval = autoCheckUpdateInterval;

    const enableTag = await getEnableTag();
    originalConfig.enableTag = enableTag;
    currentConfig.enableTag = enableTag;

    const bindTagBtnShowLocation = await getBindTagBtnShowLocation();
    originalConfig.bindTagBtnShowLocation = bindTagBtnShowLocation;
    currentConfig.bindTagBtnShowLocation = bindTagBtnShowLocation;

    const autoHideWindow = await getAutoHideWindow();
    originalConfig.autoHideWindow = autoHideWindow;
    currentConfig.autoHideWindow = autoHideWindow;

    const alwaysOnTop = await getAlwaysOnTop();
    originalConfig.alwaysOnTop = alwaysOnTop;
    currentConfig.alwaysOnTop = alwaysOnTop;

    const newVersionAlertMode = await getNewVersionAlertMode();
    originalConfig.newVersionAlertMode = newVersionAlertMode;
    currentConfig.newVersionAlertMode = newVersionAlertMode;

    // 初始化快捷键配置
    const searchKey = await getSearchKey();
    originalShortcutKeys['search'] = structuredClone(searchKey);
    currentShortcutKeys['search'] = structuredClone(searchKey);

    const wakeUpRoutineKey = await getWakeUpRoutine();
    originalShortcutKeys['wakeUpRoutine'] = structuredClone(wakeUpRoutineKey);
    currentShortcutKeys['wakeUpRoutine'] = structuredClone(wakeUpRoutineKey);

    if (!isMac) {
      // 系统剪贴板快捷键占用检查
      systemClipboardKeyOccupied.value = JSON.stringify(wakeUpRoutineKey.key) === JSON.stringify(['meta', 'v']);
      if (!systemClipboardKeyOccupied.value) {
        // 检测系统剪贴板快捷键是否可用
        systemClipboardEnable.value = await invoke('valid_clipboard_regedit');
        if (!systemClipboardEnable.value) {
          const key = ['meta', 'v'];
          try {
            await register(convertRegisterKey(key), () => {
            });
            systemClipboardKeysRegistered.value = false;
            await unregister(convertRegisterKey(key));
          } catch (e) {
            systemClipboardKeysRegistered.value = true;
          }
        } else {
          isAdminStart.value = await invoke('check_admin');
        }
      }
    }
  } catch (e) {
    console.error('页面初始化失败:', e);
    error("页面初始化失败：" + e);
    message.error(currentLanguage.value.pages.settings.initFailedHint);
  }
});
</script>
<template>
  <div class="settings-container">
    <titleBar :title="currentLanguage.pages.settings.title" :showCloseBtn="true" :dev-tool="`settings`"/>

    <div class="settings-content">
      <!-- 左侧菜单 -->
      <div class="settings-menu">
        <n-menu
            v-model:value="selectedKey"
            :options="menuItems"
            mode="vertical"
        />
      </div>

      <!-- 右侧内容 -->
      <div class="settings-form">
        <!-- 通用设置 -->
        <div v-if="selectedKey === 'general'" :key="'general'" class="settings-section">
          <h2>{{ currentLanguage.pages.settings.generalTitle }}</h2>
          <div class="form-item">
            <span class="label">{{ currentLanguage.pages.settings.powerOnSelfStart }}</span>
            <n-switch v-model:value="currentConfig.powerOnSelfStart"
                      :loading="onLoading"
                      :disabled="onLoading"
                      @update:value="onChangePowerOnSelfStart"
            />
          </div>
          <div class="form-item">
            <span class="label">{{ currentLanguage.pages.settings.autoHideWindow }}</span>
            <n-switch v-model:value="currentConfig.autoHideWindow"
                      :loading="onLoading"
                      :disabled="onLoading"
                      @update:value="onChangeAutoHideWindow"
            />
          </div>
          <div class="form-item" v-if="!currentConfig.autoHideWindow">
            <span class="label">{{ currentLanguage.pages.settings.alwaysOnTop }}</span>
            <n-switch v-model:value="currentConfig.alwaysOnTop"
                      :loading="onLoading"
                      :disabled="onLoading"
                      @update:value="onChangeAlwaysOnTop"
            />
          </div>
          <div class="line" v-if="!isMac">
            <div class="main-item">
              <span class="label">{{ currentLanguage.pages.settings.replaceGlobalHotkey }}</span>
              <n-switch v-model:value="currentConfig.replaceGlobalHotkey"
                        :disabled="(systemClipboardEnable && !isAdminStart) || (!systemClipboardEnable && !systemClipboardKeyOccupied && systemClipboardKeysRegistered) || onLoading"
                        :loading="onLoading"
                        @update:value="onChangeReplaceGlobalHotkey"
              />
            </div>
            <div class="second-item"
                 v-if="!systemClipboardKeyOccupied && !systemClipboardEnable && systemClipboardKeysRegistered">
              <div class="hint">
                <HintIcon class="hint-icon"/>
                <span class="hint-text">
                  {{ currentLanguage.pages.settings.shortcutKeyOccupationHint }}
                </span>
              </div>
            </div>
            <div class="second-item" v-else-if="systemClipboardEnable && !isAdminStart">
              <div class="hint">
                <HintIcon class="hint-icon"/>
                <span class="hint-text">
                  {{ currentLanguage.pages.settings.replaceGlobalHotkeyNoPermissionHint }}
                  <a href="#"
                     @click="openLink('https://github.com/lin0306/EasyPaste/blob/master/FAQ/rights_of_administrators/rights_of_administrators.md')">
                    {{ currentLanguage.pages.settings.replaceGlobalHotkeyLinkHint }}
                  </a>
                </span>
              </div>
            </div>
            <div class="second-item" v-else>
              <div class="hint">
                <HintIcon class="hint-icon"/>
                <span class="hint-text">
                  {{ currentLanguage.pages.settings.replaceGlobalHotkeyHint }}
                </span>
              </div>
            </div>
          </div>
          <div class="form-item">
            <span class="label">{{ currentLanguage.pages.settings.languages }}</span>
            <n-select class="select"
                      v-model:value="currentConfig.languages"
                      :options="languageOptions"
                      :loading="onLoading"
                      :disabled="onLoading"
                      @update:value="onChangeLanguages"
            />
          </div>
          <div class="form-item">
            <span class="label">{{ currentLanguage.pages.settings.enableTag }}</span>
            <n-switch v-model:value="currentConfig.enableTag"
                      :loading="onLoading"
                      :disabled="onLoading"
                      @update:value="onChangeEnableTag"
            />
          </div>
          <div class="form-item" v-if="currentConfig.enableTag">
            <span class="label">{{ currentLanguage.pages.settings.bindTagBtnShowLocation }}</span>
            <n-select class="select"
                      v-model:value="currentConfig.bindTagBtnShowLocation"
                      :options="bindTagBtnShowLocation"
                      :loading="onLoading"
                      :disabled="onLoading"
                      @update:value="onChangeBindTagBtnShowLocation"
            />
          </div>
        </div>

        <!-- 主题设置 -->
        <div v-else-if="selectedKey === 'themes'" :key="'themes'" class="settings-section">
          <h2>{{ currentLanguage.pages.settings.themesTitle }}</h2>

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
          <div class="form-item" v-if="currentConfig.enableAnimationEffects">
            <span class="label">{{ currentLanguage.pages.settings.transitionSpeed }}</span>
            <n-select
                class="select"
                v-model:value="currentConfig.animationSpeedLevel"
                :loading="onLoading"
                :options="transitionSpeedOptions"
                @update:value="onChangeAnimationSpeedLevel"
            />
          </div>

          <!-- 动画配置提示 -->
          <div class="line" v-if="currentConfig.enableAnimationEffects">
            <div class="second-item">
              <div class="hint">
                <HintIcon class="hint-icon"/>
                <span class="hint-text">
                  {{ currentLanguage.pages.settings.animationHint }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 更新设置 -->
        <div v-else-if="selectedKey === 'updater'" :key="'updater'" class="settings-section">
          <h2>{{ currentLanguage.pages.settings.updaterTitle }}</h2>
          <div class="form-item">
            <span class="label">{{ currentLanguage.pages.settings.autoCheckUpdate }}</span>
            <n-switch v-model:value="currentConfig.autoCheckUpdate"
                      :loading="onLoading"
                      :disabled="onLoading"
                      @update:value="onChangeAutoCheckUpdate"
            />
          </div>
          <div class="form-item" v-if="currentConfig.autoCheckUpdate">
            <span class="label">{{ currentLanguage.pages.settings.checkUpdateMode }}</span>
            <n-select class="select"
                      v-model:value="currentConfig.updateMode"
                      :options="autoUpdateMode"
                      :loading="onLoading"
                      :disabled="onLoading"
                      @update:value="onChangeUpdateMode"
            />
          </div>
          <div class="line" v-if="currentConfig.autoCheckUpdate && currentConfig.updateMode === 'timing'">
            <div class="main-item">
              <span class="label">{{ currentLanguage.pages.settings.timeInterval }}</span>
              <n-input-number
                  class="input-number"
                  v-model:value="currentConfig.autoCheckUpdateInterval"
                  :min="1"
                  :max="720"
                  :loading="onLoading"
                  :disabled="onLoading"
                  @keydown.enter="onChangeAutoCheckUpdateInterval"
                  @blur="onChangeAutoCheckUpdateInterval"
              >
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
          <div class="form-item">
            <span class="label">{{ currentLanguage.pages.settings.newVersionAlertMode }}</span>
            <n-select class="select"
                      v-model:value="currentConfig.newVersionAlertMode"
                      :options="updateHintMode"
                      :loading="onLoading"
                      :disabled="onLoading"
                      @update:value="onChangeNewVersionAlertMode"
            />
          </div>
        </div>

        <!-- 存储设置 -->
        <div v-else-if="selectedKey === 'storage'" :key="'storage'" class="settings-section">
          <h2>{{ currentLanguage.pages.settings.storageTitle }}</h2>
          <div class="line">
            <div class="main-item">
              <span class="label">{{ currentLanguage.pages.settings.maxHistoryItems }}</span>
              <n-input-number
                  class="input-number"
                  v-model:value="currentConfig.maxHistoryItems"
                  :min="0"
                  :max="10000"
                  :loading="onLoading"
                  :disabled="onLoading"
                  @blur="onChangeMaxHistoryItems"
              />
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
              <n-input-number
                  class="input-number"
                  v-model:value="currentConfig.dataRetentionDays"
                  :min="0"
                  :max="365"
                  :loading="onLoading"
                  :disabled="onLoading"
                  @blur="onChangeDataRetentionDays"
              />
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
        <div v-else-if="selectedKey === 'shortcut'" :key="'shortcut'" class="settings-section">
          <h2>{{ currentLanguage.pages.settings.shortcutTitle }}</h2>

          <div v-for="(shortcut, key) in currentShortcutKeys" :key="key" class="form-item">
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
        <div class="shortcut-hint" v-if="!isMac">
          <HintIcon class="shortcut-hint-icon"/>
          {{ currentLanguage.pages.settings.shortcutHint }}
        </div>
        <div class="shortcut-keys-select">
          {{
            convertShow(tempKeys) || currentLanguage.pages.settings.editHotkeyModalHint
          }}
        </div>
        <div class="shortcut-line">
          <div class="shortcut-verification" :class="availableKey ? 'key-available': 'key-not-available'">
            <PassedIcon v-if="availableKey" class="shortcut-verification-icon"/>
            <ErrorIcon v-else class="shortcut-verification-icon"/>
            {{
              availableKey ? currentLanguage.pages.settings.keyAvailableHint : currentLanguage.pages.settings.keyNotAvailableHint
            }}
          </div>
        </div>
      </div>
      <template #action>
        <n-button @click="cancelEditShortcut" :loading="onLoading" :disabled="onLoading">
          {{ currentLanguage.pages.settings.editHotkeyModalCancelBtn }}
        </n-button>
        <n-button type="primary"
                  :disabled="tempKeys.length === 0 || !availableKey || onLoading"
                  @click="confirmEditShortcut"
                  :loading="onLoading"
        >
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
  position: relative;
}

.settings-section {
  margin-bottom: 20px;
  overflow-y: auto;
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

.shortcut-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 6px;
  background-color: var(--theme-background-secondary);
  transition: background-color 0.2s;
}


.shortcut-keys {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
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
}

.edit-icon {
  width: 20px;
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

.shortcut-modal-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 10px 0;
}

.shortcut-hint {
  display: flex;
  font-size: 12px;
  opacity: 0.5;
  align-items: flex-start;
  justify-content: flex-start;
  flex-direction: row;
  color: var(--theme-text);
}

.shortcut-hint-icon {
  width: 30px;
  margin-right: 6px;
  padding-top: 5px;
}

.shortcut-keys-select {
  flex-wrap: wrap;
  font-size: 18px;
  text-align: center;
  background-color: var(--theme-divider);
  border-radius: 6px;
  padding: 2px 0;
}

.shortcut-line {
  opacity: 0.8;
  font-size: 14px;
  margin-bottom: 15px;
}

.shortcut-verification {
  display: flex;
  align-items: center;
}

.shortcut-verification-icon {
  width: 14px;
  height: 14px;
  margin-right: 4px;
}

.key-available {
  color: rgb(62, 181, 3) !important;
}

.key-not-available {
  color: rgb(214, 0, 0) !important;
}

.select {
  width: 30%;
}

.input-number {
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
  height: 12px;
  margin-right: 4px;
}

.hint-text {
  width: 98%;
}
</style>
