<script setup lang="ts">
import { listen } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { exists } from '@tauri-apps/plugin-fs';
import { isRegistered, register } from '@tauri-apps/plugin-global-shortcut';
import { error, info } from '@tauri-apps/plugin-log';
import { exit, relaunch } from '@tauri-apps/plugin-process';
import { NEmpty, NImage, useMessage } from 'naive-ui';
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import AddTagIcon from '../assets/icons/AddTagIcon.vue';
import FileDeleteIcon from '../assets/icons/FileDeleteIcon.vue';
import FileIcon from '../assets/icons/FileIcon.vue';
import SearchIcon from '../assets/icons/SearchIcon.vue';
import TopIcon from '../assets/icons/TopIcon.vue';
import TrashIcon from '../assets/icons/TrashIcon.vue';
import UntopIcon from '../assets/icons/UntopIcon.vue';
import NavBar from '../components/NavBar.vue';
import TitleBar from '../components/TitleBar.vue';
import { getSettings, getShortcutKeys } from '../configs/FileConfig';
import { useLanguage } from '../configs/LanguageConfig';
import { themes, useTheme } from '../configs/ThemeConfig';
import { copyFileToClipboard, copyToClipboard, initClipboardListener } from '../services/ClipboardService';
import UpdaterService from '../services/UpdaterService';
import { clipboardListenStore } from '../store/copyStatus';
import { listFixedStore } from '../store/fixed';
import { CopyState } from '../types/CopyState';
import { NavBarItem } from '../types/NavBarItem';
import { getContrastColor } from '../utils/color';
import ClipboardDBService from '../services/ClipboardDBService';
import FileSystem from '../utils/fileSystem';
import { convertRegistKey } from '../utils/ShortcutKeys';
import { filePathConverFileName } from '../utils/strUtil';
import { isCode } from '../utils/TextType';
import Windows, { openAboutWindow, openSettingsWindow, openTagsWindow } from '../utils/window';
import DataClearService from '../services/DataClearService';

// 获取语言上下文
const { currentLanguage } = useLanguage();

// 获取主题上下文
const { currentThemeId, toggleTheme } = useTheme();

// Naive UI 框架的消息组件
const message = useMessage();

// 窗口失焦自动关闭监听
let blurUnListener: any = null;

// 剪贴板监听
let clipboardListener: any = null;

// 打开设置窗口事件监听
let openSettingsListener: any = null;

// 打开关于窗口事件监听
let openAboutListener: any = null;

// 加载标签事件监听
let loadTagsUnListener: any = null;

// 加载更新事件监听
let checkUpdateUnListener: any = null;

// 加载更新自动更新任务状态事件监听
let autoCheckUpdateUnListener: any = null;

// 更新标签设置状态事件监听
let updateTagSettingStateListener: any = null;

// 数据清理定时器
let updateDataHistoryRestrictListener: any = null;

// 顶部菜单
const MenuItems = computed((): NavBarItem[] => [
  {
    key: '程序',
    label: currentLanguage.value.pages.list.menu.program,
    children: [
      {
        key: '偏好设置',
        label: currentLanguage.value.pages.list.menu.settings,
        onClick: () => {
          // 打开设置窗口
          openSettingsWindow();
        }
      },
      {
        key: '重新加载',
        label: currentLanguage.value.pages.list.menu.reload,
        onClick: async () => {
          message.loading('正在重新加载应用程序...');
          // 重新加载应用程序
          // exits the app with the given status code
          await exit(0);

          // restarts the app
          await relaunch();
        }
      },
      {
        type: 'divider',
      },
      {
        key: '关闭',
        label: currentLanguage.value.pages.list.menu.exit,
        onClick: async () => {
          message.loading('正在关闭应用程序...');
          // 关闭应用程序
          await exit(0);
        }
      },
    ],
  },
  {
    key: '数据',
    label: currentLanguage.value.pages.list.menu.data,
    children: [
      {
        key: '标签管理',
        label: currentLanguage.value.pages.list.menu.tagManger,
        onClick: () => {
          // 打开标签管理窗口
          openTagsWindow();
        },
        isHide: !tagSettingState.isShow,
      },
      {
        key: '数据视图',
        label: currentLanguage.value.pages.list.menu.dataView,
        isHide: true,
      },
      {
        type: 'divider',
      },
      {
        key: '清空剪贴板',
        label: currentLanguage.value.pages.list.menu.clearData,
        onClick: async () => {
          // 清空历史记录
          try {
            const db = await ClipboardDBService.getInstance();
            await db.clearAll();
            clipboardItems.value = []
            message.success(currentLanguage.value.pages.list.menu.clearDataSuccessMsg)
          } catch (error) {
            message.error(currentLanguage.value.pages.list.menu.clearDataFailedMsg)
          }
        },
      },
      {
        type: 'divider',
        isHide: true,
      },
      {
        key: '数据导入',
        label: currentLanguage.value.pages.list.menu.dataImport,
        isHide: true,
      },
      {
        key: '数据导出',
        label: currentLanguage.value.pages.list.menu.dataExport,
        isHide: true,
      },
    ],
  },
  {
    key: '主题',
    label: currentLanguage.value.pages.list.menu.themes,
    children: themes.map(theme => ({
      key: `theme-${theme.id}`,
      label: currentLanguage.value.pages.list.menu[theme.id],
      type: 'theme',
      onClick: async () => {
        await toggleTheme(theme.id);
      },
      // 使用函数返回值，确保每次访问时都重新计算
      get isCurrentTheme() {
        return currentThemeId.value === theme.id;
      }
    })),
  },
  {
    key: '帮助',
    label: currentLanguage.value.pages.list.menu.help,
    children: [
      {
        key: '使用说明',
        label: currentLanguage.value.pages.list.menu.instructions,
        isHide: true,
      },
      {
        key: '更新日志',
        label: currentLanguage.value.pages.list.menu.updateLog,
        isHide: true,
      },
      {
        key: '检查更新',
        label: currentLanguage.value.pages.list.menu.checkForUpdate,
        onClick: async () => {
          // 调用检查更新接口
          const update = UpdaterService.getInstance();
          await update.checkForUpdates();
        },
      },
      {
        type: 'divider',
      },
      {
        key: '关于',
        label: currentLanguage.value.pages.list.menu.about,
        onClick: () => {
          // 打开关于窗口
          Windows.createWin({
            label: 'about',
            url: '/about',
            width: 350,
            height: 270,
            resizable: false,
            alwaysOnTop: true,
            visible: true
          })
        }
      },
    ],
  },
]);
// 监听系统复制状态
const clipboardListen = clipboardListenStore();
// 监听当前窗口是否固定
const listFixedListen = listFixedStore();
// 内容列表
const clipboardItems = ref<ClipboardItem[]>([]);
// 标签列表
const TagItems = ref<TagItem[]>();
// 搜索框状态
const searchBoxState = reactive({
  visible: false,
  text: ''
})
// 无限滚动相关状态
const scrollState = reactive({
  page: 1,
  pageSize: 10,
  total: 1000,
  hasMore: true,
  isLoading: false
})
// 标签设置
const tagSettingState = reactive({
  isShow: false,
  location: ''
});

// 图片缓存，用于存储图片的base64数据
const imageCache = reactive(new Map<string, string>());
// 文件是否存在缓存，用于存储文件是否存在状态
const fileExist = reactive(new Map<string, boolean>());

// 拖拽状态
const dragState = reactive({
  isDragging: false,
  dragItemId: -1,
  draggedOverTagId: -1
});

// 标签选中状态
const selectedTagState = reactive({
  selectedTagId: undefined as number | undefined,
  isTopmost: false // 控制是否置顶显示
})

// 选中的内容id
const selectedItemId = ref<number | undefined>();

// 加载剪贴板项目列表
async function loadClipboardItems(reset: boolean = true) {
  if (reset) {
    // 重置列表和分页状态
    clipboardItems.value = [];
    scrollState.page = 1;
    scrollState.hasMore = true;
    scrollState.total = 0;
  }
  // 如果没有更多数据或正在加载中，则不执行
  if (!scrollState.hasMore || scrollState.isLoading) return;

  try {
    scrollState.isLoading = true;
    // 使用选中的标签ID进行过滤
    const tagId = selectedTagState.selectedTagId;

    const db = await ClipboardDBService.getInstance();
    const { total, items } = await db.searchItemsPaged(searchBoxState.text, tagId, scrollState.page, scrollState.pageSize);
    console.log(total, items)
    // 更新数据列表和分页信息
    if (reset) {
      clipboardItems.value = items;
    } else {
      // 追加数据而不是替换
      clipboardItems.value = [...clipboardItems.value, ...items]
      // items.forEach(item => clipboardItems.value.push(item));
    }

    scrollState.total = total;
    // 修改判断逻辑：只有当获取的数据条数小于pageSize或已加载的总数据等于总条数时，才认为没有更多数据
    scrollState.hasMore = items.length >= scrollState.pageSize && clipboardItems.value.length < total;

    // 预加载图片的base64数据
    for (const item of items) {
      if (item.type === 'file') {
        checkFileExist(item.file_path);
      }
    }
  } catch (err: any) {
    error('加载剪贴板项目失败:' + err.message);
  } finally {
    scrollState.isLoading = false;
  }
}

// 加载所有标签
async function loadTags() {
  const db = await ClipboardDBService.getInstance();
  TagItems.value = await db.getAllTags();
}

/**
 * 处理键盘事件
 * @param {KeyboardEvent} event - 键盘事件
 */
async function handleKeyDown(event: KeyboardEvent) {
  const shortcutKeys = await getShortcutKeys();
  // 如果没有快捷键配置，则不处理
  if (!shortcutKeys || !shortcutKeys.search) return;

  const searchConfig = shortcutKeys.search;
  const keys: string[] = searchConfig.key;

  let isCtrl = keys.includes("ctrl");
  let isAlt = keys.includes("alt");
  let isShift = keys.includes("shift");
  // mac上是command键，windows上是win键
  let isMeta = keys.includes("meta");
  let character = keys[keys.length - 1];
  if (
    event.key.toLowerCase() === character.toLowerCase()
    && event.ctrlKey === isCtrl
    && event.altKey === isAlt
    && event.shiftKey === isShift
    && event.metaKey === isMeta
  ) {
    event.preventDefault(); // 阻止默认行为
    toggleSearchBox();
  }

  // 当搜索框显示时，按ESC键隐藏
  if (searchBoxState.visible && event.key === 'Escape') {
    toggleSearchBox();
  }
}

// 加载更多数据
function loadMoreItems() {
  // 如果有更多数据，增加页码
  if (!scrollState.isLoading && scrollState.hasMore) {
    scrollState.page++;
    loadClipboardItems(false);
  }
}

// 置顶项目
async function onTop(id: number) {
  selectedItemId.value = id;
  const db = await ClipboardDBService.getInstance();
  await db.toggleTopClipboardItem(id, true);
  await loadClipboardItems(true);
  selectedItemId.value = undefined;
}

// 取消置顶项目
async function onUnTop(id: number) {
  selectedItemId.value = id;
  const db = await ClipboardDBService.getInstance();
  await db.toggleTopClipboardItem(id, false);
  await loadClipboardItems(true);
  selectedItemId.value = undefined;
}

// 绑定标签
async function bindTag(itemId: number, tagId: number) {
  const db = await ClipboardDBService.getInstance();
  await db.bindItemToTag(itemId, tagId);
  await loadClipboardItems(true);
}

// 删除项目
async function removeItem(id: number) {
  selectedItemId.value = id;
  const db = await ClipboardDBService.getInstance();
  await db.deleteClipboardItem(id);
  await loadClipboardItems(true);
  selectedItemId.value = undefined;
}

// 删除项目的标签
async function removeItemTag(item: ClipboardItem, tag: TagItem) {
  selectedItemId.value = item.id;
  const db = await ClipboardDBService.getInstance();
  await db.deleteClipboardItemTag(item.id, tag.id);
  await loadClipboardItems(true);
  selectedItemId.value = undefined;
}

// 将内容复制到系统剪贴板
async function onCopy(item: ClipboardItem) {
  if (selectedItemId.value === item.id) {
    return;
  }
  if (item) {
    let isSuccess;
    if (item.type === 'file') {
      const filePaths: Array<string> = JSON.parse(item.file_path);
      // 过滤出系统存在的文件
      const paths = filePaths.filter(async path => {
        return fileExist.get(path) && await exists(path);
      });
      item.file_path = JSON.stringify(paths);
      isSuccess = await copyToClipboard(item);
    } else {
      isSuccess = await copyToClipboard(item);
    }
    if (isSuccess) {
      message.success(currentLanguage.value.pages.list.copySuccessMsg);
      // 隐藏窗口
      await hideWindow();
    } else {
      message.error(currentLanguage.value.pages.list.copyFailedMsg);
    }
  }
}

// 将单个文件复制到系统剪贴板
async function onCopyFile(itemId: number, filePath: string) {
  if (filePath) {
    selectedItemId.value = itemId;
    if (fileExist.get(filePath) && await exists(filePath)) {
      const isSuccess = await copyFileToClipboard([filePath]);
      if (isSuccess) {
        message.success(currentLanguage.value.pages.list.copySuccessMsg);
        // 隐藏窗口
        await hideWindow();
      } else {
        message.error(currentLanguage.value.pages.list.copyFailedMsg);
      }
    } else {
      message.error(currentLanguage.value.pages.list.fileNotExistCopyFailedMsg);
    }
  }
  selectedItemId.value = undefined;
}

/**
 * 切换搜索框显示状态
 */
function toggleSearchBox() {
  searchBoxState.visible = !searchBoxState.visible;
  if (searchBoxState.visible) {
    document.getElementById("search-input")?.focus();
  } else {
    // 当搜索框隐藏时，清空搜索内容并重新加载列表
    if (searchBoxState.text) {
      searchBoxState.text = '';
      loadClipboardItems(true);
    }
  }
}

// 处理拖拽开始事件
function handleDragStart(itemId: number, event: DragEvent) {
  dragState.isDragging = true;
  dragState.dragItemId = itemId;

  // 设置拖拽数据
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', itemId.toString());
    event.dataTransfer.effectAllowed = 'link';
  }
}

// 处理拖拽结束事件
function handleDragEnd() {
  dragState.isDragging = false;
  dragState.dragItemId = -1;
  dragState.draggedOverTagId = -1;
}

// 处理拖拽进入标签事件
function handleDragEnterTag(tagId: number) {
  dragState.draggedOverTagId = tagId;
  // 如果项目已经绑定了该标签，则不允许再次绑定
  if (dragState.dragItemId !== -1 && isItemTagged(dragState.dragItemId, tagId)) {
    return;
  }
}

// 处理拖拽离开标签事件
function handleDragLeaveTag(event: DragEvent) {
  // 检查是否直接拖拽到了另一个标签上
  // 只有当不是拖拽到其他标签元素上时，才清除draggedOverTagId
  const relatedTarget = event.relatedTarget as HTMLElement;
  if (!relatedTarget || !relatedTarget.closest('.tag-item')) {
    dragState.draggedOverTagId = -1;
  }
}

// 处理拖拽放置事件
async function handleDropOnTag(tagId: number) {
  if (dragState.dragItemId !== -1) {
    // 调用绑定标签接口
    await bindTag(dragState.dragItemId, tagId);
    // 重置拖拽状态
    handleDragEnd();
  }
}

// 检查项目是否已绑定标签
function isItemTagged(itemId: number, tagId: number) {
  const item = clipboardItems.value.find(item => item.id === itemId);
  if (item && item.tags) {
    return item.tags.some((tag: any) => tag.id === tagId);
  }
  return false;
}

// 从文件系统加载图片
async function loadImageFromPath(filePath: string | null) {
  if (!filePath) {
    return;
  }
  if (imageCache.get(filePath)) {
    return;
  }
  try {
    const fileSystem = await FileSystem.getInstance();
    const base64Image = await fileSystem.readImageAsBase64(filePath);
    if (base64Image) {
      imageCache.set(filePath, base64Image);
    }
  } catch (err: any) {
    error('加载图片失败:' + err.message);
    throw err;
  }
}

async function loadFileExist(filePath: string) {
  if (!filePath) {
    return;
  }
  if (fileExist.get(filePath)) {
  }
  try {
    fileExist.set(filePath, await exists(filePath));
  } catch (e) {
    console.error('检查文件是否存在失败:', e);
  }
}

// 支持展示的图片格式
const imageSuffix = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'];

// 检查文件是否存在
function checkFileExist(filePaths: string) {
  if (!filePaths) {
    return;
  }
  const filePathList: Array<string> = JSON.parse(filePaths);
  if (filePathList.length === 1) {
    const filePath: string = filePathList[0];
    // 处理图片类型的文件
    if (isImage(filePath)) {
      // 这里不需要等待结果，避免处理慢
      loadImageFromPath(filePath);
    }
    loadFileExist(filePath);
  } else {
    filePathList.forEach(filePath => {
      // 处理图片类型的文件
      if (isImage(filePath)) {
        loadImageFromPath(filePath);
      }
      loadFileExist(filePath);
    });
  }
}

/**
 * 判断文件是否是图片
 * @param { string } filePath - 文件路径
 * @returns { boolean } -是否是图片
 */
function isImage(filePath: string): boolean {
  return filePath.includes(".") && imageSuffix.includes(filePath.split(".")[1].toLowerCase());
}

/**
 * 处理标签点击事件
 * @param {number} tagId - 标签ID
 */
function handleTagClick(tagId: number) {
  // 如果点击的是当前已选中的标签，则取消选中
  if (selectedTagState.selectedTagId === tagId) {
    selectedTagState.selectedTagId = undefined;
    selectedTagState.isTopmost = false;
  } else {
    // 否则选中该标签
    selectedTagState.selectedTagId = tagId;
    selectedTagState.isTopmost = true;
  }

  // 根据选中的标签过滤剪贴板列表（重置列表）
  loadClipboardItems(true);
}

/**
 * 隐藏当前窗口
 */
async function hideWindow() {
  if (listFixedListen.stateData() === 0) {
    // 窗口未固定，触发失焦，隐藏窗口
    await getCurrentWindow().hide();
  }
}

/**
 * 加载标签设置状态
 */
async function loadTagSettingState(setting: Settings) {
  tagSettingState.isShow = setting.enableTag;
  tagSettingState.location = setting.bindTagBtnShowLocation;
}

// 监听系统是否复制内容
watch(() => clipboardListen.state, (newValue, oldValue) => {
  if (
    newValue !== oldValue
    && newValue === CopyState.SUCCESS
    && oldValue === CopyState.COPING
  ) {
    loadClipboardItems(true);
  }
});

// 初始化窗口失焦事件监听
function initBlueListener() {
  return getCurrentWindow().listen('tauri://blur', async () => {
    await hideWindow();
  })
}

/**
 * 初始化打开设置窗口事件监听
 */
function initOpenSettingsListener() {
  return listen('open-settings', (_event: any) => {
    openSettingsWindow();
  });
}

/**
 * 初始化打开关于窗口事件监听
 */
function initOpenAboutListener() {
  return listen('open-about', (_event: any) => {
    openAboutWindow();
  });
}

/**
 * 初始化加载标签事件监听
 */
async function initLoadTagsListener() {
  return await listen('reload-tags', async (_event: any) => {
    await loadTags();
  });
}

/**
 * 初始化加载标签事件监听
 */
async function initCheckUpdateListener() {
  return await listen('check-update', async (_event: any) => {
    const update = UpdaterService.getInstance();
    await update.checkForUpdates();
  });
}

/**
 * 注册快捷键打开当前窗口
 */
async function registerShortcutKeysOpenWindow() {
  const keys = await getShortcutKeys();
  if (keys.wakeUpRoutine && keys.wakeUpRoutine.key && keys.wakeUpRoutine.key.length > 0) {
    const shortcutKeys = convertRegistKey(keys.wakeUpRoutine.key);
    const registered = await isRegistered(shortcutKeys);
    if (registered) {
      info('快捷键已注册');
    } else {
      await register(shortcutKeys, async () => {
        await getCurrentWindow().show();
        await getCurrentWindow().setFocus();
      });
    }
  }
}

/**
 * 初始化更新自动检查更新任务状态监听
 */
async function initUpdateAutoCheckUpdateListener() {
  return await listen('update-auto-check-update', (event: any) => {
    const autoCheckUpdate = event.payload.data;
    if (autoCheckUpdate) {
      const update = UpdaterService.getInstance();
      update.startAutoCheck();
    } else {
      const update = UpdaterService.getInstance();
      update.stopAutoCheck();
    }
  });
}

/**
 * 初始化更新标签设置状态监听
 */
async function initUpdateTagSettingStateListener() {
  return await listen('update-tag-setting-state', async (event: any) => {
    tagSettingState.isShow = event.payload.isShow;
    tagSettingState.location = event.payload.location;
  });
}

/**
 * 初始化更新数据保留限制监听
 */
async function initUpdateDataHistoryRestrictListener() {

  return await listen('update-data-history-restrict', async (event: any) => {
    const dataRetentionDays = event.payload.dataRetentionDays;
    const maxHistoryItems = event.payload.maxHistoryItems;
    const timer = await DataClearService.getInstance();
    // 更新保留天数
    timer.setDataRetentionDays(dataRetentionDays);
    // 更新保留条数
    timer.setMaxHistoryItems(maxHistoryItems);
    // 停止定时任务
    timer.stopDataClear();
    if (dataRetentionDays > 0) {
      // 当保留天数大于0时，启动定时任务
      timer.startDataClear();
    }
  });
}

// 组件挂载时初始化数据库和剪贴板监听
onMounted(async () => {
  try {
    const settings = await getSettings();
    // 加载剪贴板项目列表
    await loadClipboardItems(true);

    // 加载标签列表
    await loadTags();
    
    // 加载标签设置状态
    await loadTagSettingState(settings);

    // 启动剪贴板监听服务
    clipboardListener = await initClipboardListener();

    // 添加窗口失焦事件监听
    blurUnListener = await initBlueListener();

    // 添加打开设置窗口事件监听
    openSettingsListener = await initOpenSettingsListener();

    // 添加打开关于窗口事件监听
    openAboutListener = await initOpenAboutListener();

    // 添加检查更新事件监听
    checkUpdateUnListener = await initCheckUpdateListener();

    // 添加更新自动检查更新任务状态事件监听
    autoCheckUpdateUnListener = await initUpdateAutoCheckUpdateListener();

    // 添加更新标签设置状态事件监听
    updateTagSettingStateListener = await initUpdateTagSettingStateListener();

    // 添加更新数据保留限制事件监听
    updateDataHistoryRestrictListener = await initUpdateDataHistoryRestrictListener();

    // 注册快捷键打开当前窗口
    await registerShortcutKeysOpenWindow();

    // 添加加载标签事件监听
    loadTagsUnListener = await initLoadTagsListener();

    // 增加事件监听
    document.addEventListener('keydown', handleKeyDown);

    // 开启自动检查更新
    if (settings.autoCheckUpdate) {
      const update = UpdaterService.getInstance();
      update.startAutoCheck();
    }

    // 启动自动清理数据任务
    if (settings.dataRetentionDays > 0) {
      const clearTimer = await DataClearService.getInstance();
      clearTimer.startDataClear();
    }
  } catch (err: any) {
    error('初始化失败:' + err.message);
  }
});

// 组件卸载时清除事件监听
onUnmounted(async () => {
  // 清除剪贴板监听服务
  if (clipboardListener) {
    clipboardListener();
  }
  // 清除窗口失焦事件监听
  if (blurUnListener) {
    clearInterval(blurUnListener);
  }
  if (blurUnListener) {
    blurUnListener();
  }
  // 清除打开设置窗口事件监听
  if (openSettingsListener) {
    openSettingsListener();
  }
  // 清除打开关于窗口事件监听
  if (openAboutListener) {
    openAboutListener();
  }
  // 清除检查更新事件监听
  if (checkUpdateUnListener) {
    checkUpdateUnListener();
  }
  // 清除更新自动检查更新任务状态事件监听
  if (autoCheckUpdateUnListener) {
    autoCheckUpdateUnListener();
  }
  // 清除加载标签事件监听
  if (loadTagsUnListener) {
    loadTagsUnListener();
  }
  // 清除更新标签设置状态事件监听
  if (updateTagSettingStateListener) {
    updateTagSettingStateListener();
  }

  // 清除更新数据保留限制事件监听
  if (updateDataHistoryRestrictListener) {
    updateDataHistoryRestrictListener();
  }

  // 关闭自动检查更新操作
  const update = UpdaterService.getInstance();
  update.stopAutoCheck();

  // 清除数据清理定时器
  const clearTimer = await DataClearService.getInstance();
  clearTimer?.stopDataClear();

  // 移除事件监听
  document.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <TitleBar :title="currentLanguage.pages.list.title" :showFixedBtn="true" :fixed="`listFixedListen`"
    :dev-tool="`main`" />
  <NavBar :menuItems="MenuItems" />

  <!-- 搜索框 -->
  <div class="search-container" v-show="searchBoxState.visible">
    <n-input id="search-input" v-model:value="searchBoxState.text" :placeholder="currentLanguage.pages.list.searchHint"
      clearable @input="loadClipboardItems(true)" :autofocus="true" size="small">
      <template #prefix>
        <!-- 搜索 -->
        <n-icon size="18">
          <SearchIcon />
        </n-icon>
      </template>
    </n-input>
  </div>

  <!-- 标签列表 -->
  <div v-if="tagSettingState.isShow" class="tag-list" :class="{ 'has-selected-tag': dragState.isDragging }">
    <div v-for="tag in TagItems" :key="tag.id" class="tag-item" :class="{
      'tag-dragging-over': dragState.draggedOverTagId === tag.id,
      'tag-disabled': dragState.isDragging && isItemTagged(dragState.dragItemId, tag.id),
      'tag-expanded': dragState.isDragging && !isItemTagged(dragState.dragItemId, tag.id),
      'tag-selected': selectedTagState.selectedTagId === tag.id
    }" :style="{ backgroundColor: tag.color }" @dragenter="handleDragEnterTag(tag.id)"
      @dragleave="handleDragLeaveTag($event)" @dragover.prevent @drop.prevent="handleDropOnTag(tag.id)"
      @click="handleTagClick(tag.id)">
      <span class="tag-name" :style="{ color: getContrastColor(tag.color) }">{{ tag.name }}</span>
    </div>
  </div>

  <!-- 数据列表 -->
  <div :class="searchBoxState.visible ? `clipboard-container-search` : `clipboard-container`">
    <n-infinite-scroll v-if="clipboardItems && clipboardItems.length > 0" :distance="9" @load="loadMoreItems">
      <!-- 列表内容 -->
      <div v-for="item in clipboardItems" :key="item.id" class="clipboard-item" @dblclick="onCopy(item)">
        <div class="clipboard-card">
          <!-- 头部 -->
          <div class="card-header">
            <div class="card-header-left">
              <div>{{
                item.type === 'text' ? (isCode(item.content) ? currentLanguage.pages.list.typeCode :
                  currentLanguage.pages.list.typeText) : currentLanguage.pages.list.typeFile
              }}
              </div>
              <div class="card-title">{{ new Date(item.copy_time).toLocaleString() }}</div>
            </div>
            <div class="card-header-right">
              <div class="card-header-right-buttons">
                <!-- 置顶/取消置顶按钮 -->
                <div class="card-header-right-button" @click="item.is_topped ? onUnTop(item.id) : onTop(item.id)">
                  <TopIcon v-if="!item.is_topped" />
                  <UntopIcon v-else />
                </div>
                <!-- 删除按钮 -->
                <div class="card-header-right-button" @click="removeItem(item.id)">
                  <TrashIcon />
                </div>
                <!-- 设置标签按钮 -->
                <div v-if="tagSettingState.isShow && tagSettingState.location === 'top-right'" class="card-header-right-button drag-icon"
                  draggable="true" @dragstart="handleDragStart(item.id, $event)" @dragend="handleDragEnd">
                  <AddTagIcon class="dropdown-icon" />
                </div>
              </div>
            </div>
          </div>
          <!-- 内容 -->
          <div class="card-content">
            <div class="content-wrapper">
              <!-- 普通文本 -->
              <div v-if="item.type === 'text' && !isCode(item.content)" class="text-line item-line">
                {{ item.content }}
              </div>
              <!-- 代码 -->
              <div v-else-if="item.type === 'text' && isCode(item.content)" class="code-line item-line">
                <n-code :code="item.content" language="html" show-line-numbers />
              </div>
              <!-- 文件 -->
              <div v-else-if="item.type === 'file'" class="file-line item-line">
                <div class="file-item" v-for="filePath in JSON.parse(item.file_path)" :title="filePath"
                  @dblclick="onCopyFile(item.id, filePath)">
                  <n-image v-if="isImage(filePath)
                    && imageCache.get(filePath)" :src="imageCache.get(filePath)" object-fit="cover" width="100%"
                    :show-toolbar="false" />
                  <FileIcon class="file-exist-icon" v-else-if="fileExist.get(filePath)" />
                  <FileDeleteIcon class="file-not-exist-icon" v-else />
                  <span :class="!fileExist.get(filePath) ? 'file-not-exist-text' : ''">{{
                    filePathConverFileName(filePath)
                  }}</span>
                </div>
              </div>
              <!-- 空 -->
              <div v-else class="item-line"></div>
            </div>
          </div>
          <!-- 标签展示 -->
          <div class="card-tags" v-if="tagSettingState.isShow">
            <n-tag size="small" round closable bordered v-for="tag in item.tags" :key="tag.id" class="item-tag"
              @close="removeItemTag(item, tag)">
              <div class="item-tag-content">
                <div :style="{ backgroundColor: tag.color }" class="item-tag-color"></div>
                <div class="item-tag-name">
                  {{ tag.name }}
                </div>
              </div>
            </n-tag>
            <div v-if="tagSettingState.isShow && tagSettingState.location === 'bottom-right'" class="bind-tag-button" draggable="true"
              @dragstart="handleDragStart(item.id, $event)" @dragend="handleDragEnd">
              <AddTagIcon class="bind-tag-icon" />
              <span v-if="tagSettingState.isShow">绑定标签</span>
            </div>
          </div>
        </div>
      </div>
      <!-- 最底部内容展示 -->
      <div v-if="scrollState.isLoading" class="loading-indicator">
        <n-spin :description="currentLanguage.pages.list.dataLoading" />
      </div>
      <div v-if="!scrollState.hasMore" class="no-more-indicator">
        {{ currentLanguage.pages.list.allLoaded }}
      </div>
    </n-infinite-scroll>
    <!-- 无数据展示 -->
    <n-empty v-else description="暂无剪贴板记录" class="empty" />
  </div>

</template>

<style scoped>
.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80px;
}

.no-more-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
}

.empty {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 65px);
}

.clipboard-container {
  height: calc(100vh - 65px);
  /* 减去TitleBar(25px)和NavBar(30px)的高度 */
}

.clipboard-container-search {
  height: calc(100vh - 110px);
  /* 减去TitleBar(25px)和NavBar(30px)的高度 */
}

.clipboard-item {
  margin: 6px 6px;
}

.clipboard-card:hover {
  background-color: var(--theme-border);
}

.clipboard-card {
  background-color: var(--theme-cardBackground);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 7px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid transparent;
}

.clipboard-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  color: var(--theme-text);
  padding-bottom: 5px;
  font-size: 12px;
  border-bottom: 1px solid var(--theme-border);
}

.card-header-left {
  display: flex;
  gap: 5px;
  opacity: 0.5;
}

.card-header-right {
  display: flex;
}

.card-header-right-buttons {
  display: flex;
  gap: 5px;
}

.card-header-right-button {
  cursor: pointer;
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
  opacity: 0.5;
}

.card-header-right-button:hover {
  opacity: 0.8;
}

.drag-icon {
  cursor: grab !important;
}

.card-content {
  color: var(--theme-text);
  word-break: break-all;
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 5px 0;
}

.content-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.item-line {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  text-overflow: ellipsis;
  line-clamp: 3;
  overflow: hidden;
  height: 5.7em;
  width: 100%;
  word-wrap: break-word;
  word-break: break-all;
  font-size: 16px;
}

.text-line {
  white-space: pre-wrap;
  overflow: auto;
}

.code-line {
  overflow: auto;
  height: 5.7em;
}

.code-line::-webkit-scrollbar {
  border-radius: 10px;
  height: 6px;
}

.file-line {
  overflow: auto !important;
}

.file-line::-webkit-scrollbar {
  border-radius: 10px;
  height: 6px;
}

.file-item {
  margin: 2px;
  padding: 3px;
  border: 1px solid var(--theme-border);
  border-radius: 5px;
  font-size: 12px;
  width: 80px;
  display: grid;
  place-items: center;
  grid-template-rows: 1fr auto;
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

.file-exist-icon {
  width: 50px;
  height: 50px;
}

.file-not-exist-icon {
  width: 50px;
  height: 50px;
}

.file-not-exist-text {
  color: var(--theme-textDelete);
  text-decoration: line-through;
}

.card-tags {
  border-top: 1px solid var(--theme-border);
  padding-top: 5px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.item-tag {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.item-tag-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 3px;
}

.item-tag-color {
  width: 12px;
  height: 12px;
  border-radius: 10px;
}

.item-tag-name {
  max-width: 60px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  word-break: break-all;
}

.item-tag-close-icon {
  margin-left: 5px;
  width: 12px;
  height: 12px;
}

.bind-tag-button {
  cursor: grab;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 3px;
  border: 1px dashed var(--theme-text);
  border-radius: 15px;
  padding: 3px;
  color: var(--theme-text);
  background-color: var(--theme-background);
  font-size: 11px;
  padding: 0px 8px;
  opacity: 0.6;
  margin-left: auto;
}

.bind-tag-button:hover {
  opacity: 1;
}

.bind-tag-icon {
  width: 12px;
  height: 12px;
}

/* 标签列表样式 */
.tag-list {
  position: fixed;
  top: 55px;
  left: -16px;
  display: flex;
  flex-direction: column;
  z-index: 100;
  transition: left 0.3s ease;
  overflow-y: auto;
  overflow-x: hidden;
  height: calc(100vh - 57px);
}

.has-selected-tag {
  width: 110px;
}

/* 隐藏 Chrome、Safari 和 Opera 的滚动条 */
.tag-list::-webkit-scrollbar {
  width: 0;
}

/* 拖拽激活时，标签列表稍微向右移动，增加可见性 */
.tag-list.dragging-active {
  left: -5px;
}

.tag-item {
  width: 24px;
  height: 30px;
  border-radius: 4px;
  margin-bottom: -4px;
  position: relative;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  transform-origin: left center;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  opacity: 0.2;
}

/* 鼠标悬停或拖拽时展开标签 */
.tag-item:hover,
.tag-item.tag-expanded {
  opacity: 1;
  /* 固定宽度而不是拉伸 */
  width: 100px;
  /* 悬浮时置于顶层 */
  z-index: 10;
}

.tag-name {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.3s ease 0.15s;
  /* 延迟显示文字，等待展开动画完成一半 */
  pointer-events: none;
  width: 70px;
  transform-origin: left center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  word-break: break-all;
}

/* 鼠标悬停或拖拽时显示标签名称 */
.tag-item:hover .tag-name,
.tag-item.tag-expanded .tag-name {
  opacity: 1;
  transform: translateY(-50%);
}

.tag-dragging-over {
  transform: scale(1.08);
  z-index: 20 !important;
}

/* 选中标签的样式 */
.tag-selected {
  width: 100px !important;
  z-index: 5 !important;
  opacity: 0.6;
}

/* 选中标签的名称始终显示 */
.tag-selected .tag-name {
  opacity: 1;
  font-weight: bold;
}

.tag-disabled {
  opacity: 0.7;
  /* 禁用鼠标光标样式 */
  cursor: not-allowed;
  /* 禁用点击事件 */
  pointer-events: none;
}

.tag-disabled:hover {
  width: 24px !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3) !important;
  transform: none !important;
}

.tag-disabled:hover .tag-name {
  opacity: 0 !important;
}

/* 搜索框样式 */
.search-container {
  z-index: 100;
  height: 30px;
  margin-bottom: 4px;
  background-color: var(--theme-cardBackground);
  border-radius: 0 0 8px 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 8px;
  transition: all 0.3s ease;
}

.search-container :deep(.n-input) {
  border-radius: 4px;
  border: 1px solid var(--theme-border);
  background-color: var(--theme-background);
}

.search-container :deep(.n-input__input) {
  color: var(--theme-textHint);
}
</style>