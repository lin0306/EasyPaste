<script setup lang="ts">
import { listen } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { isRegistered, register } from '@tauri-apps/plugin-global-shortcut';
import { error, info } from '@tauri-apps/plugin-log';
import { exit, relaunch } from '@tauri-apps/plugin-process';
import { NEmpty, NImage, NTag, useMessage } from 'naive-ui';
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import DragIcon from '../assets/icons/DragIcon.vue';
import ImageFiledIcon from '../assets/icons/ImageFiledIcon.vue';
import MoreIcon from '../assets/icons/MoreIcon.vue';
import SearchIcon from '../assets/icons/SearchIcon.vue';
import TopIcon from '../assets/icons/TopIcon.vue';
import TrashIcon from '../assets/icons/TrashIcon.vue';
import UntopIcon from '../assets/icons/UntopIcon.vue';
import NavBar from '../components/NavBar.vue';
import TitleBar from '../components/TitleBar.vue';
import { getShortcutKeys } from '../configs/FileConfig';
import { useLanguage } from '../configs/LanguageConfig';
import { themes, useTheme } from '../configs/ThemeConfig';
import { copyToClipboard, initClipboardListener } from '../services/ClipboardService';
import UpdaterService from '../services/UpdaterService';
import { clipboardListenStore } from '../store/copyStatus';
import { listFixedStore } from '../store/fixed';
import { CopyState } from '../types/CopyState';
import { NavBarItem } from '../types/NavBarItem';
import { getContrastColor } from '../utils/color';
import convertType from '../utils/convert';
import ClipboardDB from '../utils/db';
import FileSystem from '../utils/fileSystem';
import { convertRegistKey } from '../utils/ShortcutKeys';
import Windows, { openAboutWindow, openSettingsWindow, openTagsWindow } from '../utils/window';

// 获取语言上下文
const { currentLanguage } = useLanguage();

// 获取主题上下文
const { currentThemeId, toggleTheme } = useTheme();

const message = useMessage();

// 窗口失焦自动关闭监听
let blurUnlistener: any = null;

// 剪贴板监听
let clipboardListener: any = null;

// 打开设置窗口事件监听
let openSettingsListener: any = null;

// 打开关于窗口事件监听
let openAboutListener: any = null;

// 加载标签事件监听
let loadTagsUnListener: any = null;

// 加载标签事件监听
let checkUpdateUnListener: any = null;

// 将MenuItems改为计算属性，这样当currentTheme变化时会自动更新
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
        }
      },
      {
        key: '数据视图',
        label: currentLanguage.value.pages.list.menu.dataView,
        isHide: true,
      },
      {
        key: '清空剪贴板',
        label: currentLanguage.value.pages.list.menu.clearData,
        onClick: async () => {
          // 清空历史记录
          try {
            const db = await ClipboardDB.getInstance();
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
        info('切换主题:' + theme);
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

const clipboardListen = clipboardListenStore();
const listFixedListen = listFixedStore();

const clipboardItems = ref<ClipboardItem[]>([]);
const TagItems = ref<TagItem[]>();
// 搜索框状态
const searchBoxState = reactive({
  visible: false
})
let searchText = ref('')
// 无限滚动相关状态
const scrollState = reactive({
  page: 1,
  pageSize: 10,
  total: 1000,
  hasMore: true,
  isLoading: false
})

// 图片缓存，用于存储图片的base64数据
const imageCache = reactive(new Map<string, string>())

// 下拉菜单状态
const dropdownState = reactive({
  visible: false,
  currentItemId: -1
});

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

// 加载剪贴板项目列表
async function loadClipboardItems(reset: boolean = true) {
  info('加载剪贴板数据，是否重新获取全部：' + reset);
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

    // info('查询条件' + JSON.stringify([searchText.value, tagId, scrollState.page, scrollState.pageSize]));

    const db = await ClipboardDB.getInstance();
    const { total, items } = await db.searchItemsPaged(searchText.value, tagId, scrollState.page, scrollState.pageSize);
    // info('total: ' + total + '，items: ' + JSON.stringify(items));

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
      if (item.type === 'image' && item.file_path && !imageCache.has(item.file_path)) {
        loadImageFromPath(item.file_path);
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
  const db = await ClipboardDB.getInstance();
  const tags = await db.getAllTags();
  TagItems.value = tags;
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
  const db = await ClipboardDB.getInstance();
  await db.toggleTopClipboardItem(id, true);
  await loadClipboardItems(true);
}

// 取消置顶项目
async function onUnTop(id: number) {
  const db = await ClipboardDB.getInstance();
  await db.toggleTopClipboardItem(id, false);
  await loadClipboardItems(true);
}

// 显示/隐藏下拉菜单
function toggleDropdown(id: number) {
  if (dropdownState.currentItemId === id && dropdownState.visible) {
    dropdownState.visible = false;
  } else {
    dropdownState.visible = true;
    dropdownState.currentItemId = id;
  }
}

// 点击外部关闭下拉菜单
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  // 检查点击是否在下拉菜单或更多按钮之外
  if (dropdownState.visible &&
    !target.closest('.dropdown-menu') &&
    !target.closest('.action-button')) {
    dropdownState.visible = false;
  }
}

// 绑定标签
async function bindTag(itemId: number, tagId: number) {
  const db = await ClipboardDB.getInstance();
  await db.bindItemToTag(itemId, tagId);
  loadClipboardItems(true);
  dropdownState.visible = false;
}

// 删除项目
async function removeItem(id: number) {
  const db = await ClipboardDB.getInstance();
  await db.deleteClipboardItem(id);
  await loadClipboardItems(true);
}

// 将内容复制到系统剪贴板
async function onCopy(item: ClipboardItem) {
  if (item) {
    if (item.type === 'text') {
      copyToClipboard(item.content, item.type);
    }
    if (item.type === 'image') {
      copyToClipboard(item.file_path, item.type);
    }
    // 隐藏窗口
    hideWindow();
  }
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
    if (searchText.value) {
      searchText.value = '';
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
  }
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

// 监听系统是否复制内容
watch(() => clipboardListen.state, (newValue, oldValue) => {
  if (
    newValue !== oldValue
    && newValue === CopyState.SUCCESS
    && oldValue === CopyState.COPING
  ) {
    info('监听复制状态变化');
    loadClipboardItems(true);
  }
});

// 初始化窗口失焦事件监听
function initBlueListener() {
  info('初始化失焦监听');
  return getCurrentWindow().listen('tauri://blur', async () => {
    info('窗口失焦自动隐藏');
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
    info('注册快捷键：' + shortcutKeys);
    const registered = await isRegistered(shortcutKeys);
    if (registered) {
      info('快捷键已注册');
    } else {
      info('快捷键未注册，注册快捷键');
      await register(shortcutKeys, async () => {
        await getCurrentWindow().show();
        await getCurrentWindow().setFocus();
      });
    }
  }
}

// 组件挂载时初始化数据库和剪贴板监听
onMounted(async () => {
  try {
    // 加载剪贴板项目列表
    await loadClipboardItems(true);

    // 加载标签列表
    await loadTags();

    // 启动剪贴板监听服务
    clipboardListener = await initClipboardListener();

    // 添加窗口失焦事件监听
    blurUnlistener = await initBlueListener();

    // 添加打开设置窗口事件监听
    openSettingsListener = await initOpenSettingsListener();

    // 添加打开关于窗口事件监听
    openAboutListener = await initOpenAboutListener();

    // 添加检查更新事件监听
    checkUpdateUnListener = await initCheckUpdateListener();

    // 注册快捷键打开当前窗口
    await registerShortcutKeysOpenWindow();

    // 添加加载标签事件监听
    loadTagsUnListener = await initLoadTagsListener();

    // 增加事件监听
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    // 开启自动检查更新
    const update = UpdaterService.getInstance();
    update.startAutoCheck();
  } catch (err: any) {
    error('初始化失败:' + err.message);
  }
});

// 组件卸载时清除事件监听
onUnmounted(() => {
  // 清除剪贴板监听服务
  if (clipboardListener) {
    clipboardListener();
  }
  // 清除窗口失焦事件监听
  if (blurUnlistener) {
    clearInterval(blurUnlistener);
  }
  if (blurUnlistener) {
    blurUnlistener();
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
  // 清除加载标签事件监听
  if (loadTagsUnListener) {
    loadTagsUnListener();
  }

  // 关闭自动检查更新操作
  const update = UpdaterService.getInstance();
  update.stopAutoCheck();

  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleKeyDown);
});

</script>

<template>
  <TitleBar :title="currentLanguage.pages.list.title" :showHideBtn="true" :showFixedBtn="true"
    :fixed="`listFixedListen`" :dev-tool="`main`" />
  <NavBar :menuItems="MenuItems" />

  <!-- 搜索框 -->
  <div class="search-container" v-show="searchBoxState.visible">
    <n-input id="search-input" v-model:value="searchText" :placeholder="currentLanguage.pages.list.searchHint" clearable
      @input="loadClipboardItems(true)" :autofocus="true" size="small">
      <template #prefix>
        <!-- 搜索 -->
        <n-icon size="18">
          <SearchIcon />
        </n-icon>
      </template>
    </n-input>

  </div>

  <!-- 标签列表 -->
  <div class="tag-list" :class="{ 'has-selected-tag': selectedTagState.isTopmost }">
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

  <div :class="searchBoxState.visible ? `clipboard-container-search` : `clipboard-container`">
    <n-infinite-scroll v-if="clipboardItems && clipboardItems.length > 0" :distance="9" @load="loadMoreItems">
      <div v-for="item in clipboardItems" :key="item.id" class="clipboard-item" @dblclick="onCopy(item)">
        <div class="clipboard-card">
          <div class="card-header">
            <div class="card-title">{{ new Date(item.copy_time).toLocaleString() }}</div>
            <n-tag size="small" round>{{ convertType(item.type) }}</n-tag>
          </div>
          <div class="card-content">
            <div class="content-wrapper">
              <p v-if="item.type === 'text'">{{ item.content }}</p>
              <p v-else-if="item.type === 'image'">
                <n-image v-if="item.file_path && imageCache.get(item.file_path)" :src="imageCache.get(item.file_path)"
                  object-fit="cover" lazy width="100%" :show-toolbar="false" />
                <ImageFiledIcon v-else />
              </p>
              <p v-else-if="item.type === 'file'">
                <i class="fas fa-file"></i>
                <span>{{ item.content }}</span>
              </p>
              <p v-else></p>
              <div class="card-actions">
                <div class="action-buttons">
                  <!-- 置顶/取消置顶按钮 -->
                  <div class="action-button" @click="item.is_topped ? onUnTop(item.id) : onTop(item.id)">
                    <TopIcon v-if="!item.is_topped" />
                    <UntopIcon v-else />
                  </div>
                  <!-- 更多按钮 -->
                  <div class="action-button" @click="toggleDropdown(item.id)">
                    <MoreIcon />
                  </div>
                  <!-- 下拉菜单 -->
                  <div v-if="dropdownState.visible && dropdownState.currentItemId === item.id" class="dropdown-menu">
                    <div class="dropdown-item" @click="removeItem(item.id)">
                      <TrashIcon class="dropdown-icon" />
                      <span>{{ currentLanguage.pages.list.deleteBtn }}</span>
                    </div>
                    <div class="dropdown-item drag" draggable="true" @dragstart="handleDragStart(item.id, $event)"
                      @dragend="handleDragEnd">
                      <DragIcon class="dropdown-icon" />
                      <span>{{ currentLanguage.pages.list.bindTagBtn }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="card-tags" v-if="item.tags && item.tags.length > 0">
            <div class="item-tags">
              <div v-for="tag in item.tags" :key="tag.id" class="item-tag" :style="{ backgroundColor: tag.color }">
                <span class="item-tag-name" :style="{ color: getContrastColor(tag.color) }">{{ tag.name
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="scrollState.isLoading" class="loading-indicator">
        <n-spin :description="currentLanguage.pages.list.dataLoading" />
      </div>
      <div v-if="!scrollState.hasMore" class="no-more-indicator">
        {{ currentLanguage.pages.list.allLoaded }}
      </div>
    </n-infinite-scroll>
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
  margin-bottom: 8px;
}

.card-title {
  font-weight: 500;
  color: var(--theme-text);
  font-size: 0.9rem;
}

.card-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: fit-content;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
}

.action-button {
  cursor: pointer;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.action-button:hover {
  transform: scale(1.1);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--theme-cardBackground);
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  z-index: 10;
  min-width: 110px;
  padding: 4px 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 0.9rem;
}

.dropdown-item:hover {
  background-color: var(--theme-hoverBackground);
}

.dropdown-item svg {
  width: 14px;
  height: 14px;
}

.card-content {
  color: var(--theme-text);
  word-break: break-all;
  font-size: 0.9rem;
  line-height: 1.4;
  max-height: 200px;
}

.content-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.content-wrapper p {
  flex: 1;
  margin: 0px 10px 0px 0px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  text-overflow: ellipsis;
  line-clamp: 3;
  overflow: hidden;
  height: 4em;
  word-wrap: break-word;
  word-break: break-all;
  font-size: 14px;
}

/* 为图片预览添加样式 */
.image-item {
  max-width: 100%;
  height: 4em;
  object-fit: contain;
  border-radius: 6px;
}

/* 包含图片的段落需要特殊处理 */
.content-wrapper p:has(img) {
  height: auto;
  height: 4em;
  -webkit-line-clamp: initial;
  line-clamp: initial;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

:deep(.ant-tag) {
  margin: 0;
}

.item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.item-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  display: inline-block;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.item-tag-name {
  font-size: 12px;
  white-space: nowrap;
}

.dropdown-icon {
  width: 16px;
  height: 16px;
}

.drag {
  cursor: grab;
  cursor: -webkit-grab;
}

.drag:active {
  cursor: grabbing;
  cursor: -webkit-grabbing;
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

/* 隐藏 Chrome、Safari 和 Opera 的滚动条 */
.tag-list::-webkit-scrollbar {
  width: 0px;
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  transform-origin: left center;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  opacity: 0.3;
}

/* 鼠标悬停或拖拽时展开标签 */
.tag-item:hover,
.tag-item.tag-expanded {
  opacity: 1;
  width: 100px;
  /* 固定宽度而不是拉伸 */
  z-index: 10;
  /* 悬浮时置于顶层 */
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4);
}

.tag-name {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s ease 0.15s;
  /* 延迟显示文字，等待展开动画完成一半 */
  pointer-events: none;
  width: 70px;
  overflow: hidden;
  transform-origin: left center;
}

/* 鼠标悬停或拖拽时显示标签名称 */
.tag-item:hover .tag-name,
.tag-item.tag-expanded .tag-name {
  opacity: 1;
  transform: translateY(-50%);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.tag-dragging-over {
  box-shadow: 0 0 12px var(--theme-primary);
  transform: scale(1.08);
  z-index: 20 !important;
}

/* 选中标签的样式 */
.tag-selected {
  width: 100px !important;
  z-index: 5 !important;
  opacity: 1;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.7);
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

/* 底部加载状态指示器样式 */
.loading-more-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 0;
  margin-top: 10px;
  background-color: var(--theme-cardBackground);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.loading-text {
  margin-left: 10px;
  color: var(--theme-text);
  font-size: 14px;
}

.no-more-data {
  display: flex;
  justify-content: center;
  padding: 16px 0;
  font-size: 14px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    filter: blur(10px);
  }

  to {
    opacity: 1;
    filter: blur(0px);
  }
}

.image-loading {
  background-color: var(--theme-border);
  min-height: 50px;
  border-radius: 6px;
}

.fade-in {
  animation: fadeIn 0.3s ease-in forwards;
}
</style>