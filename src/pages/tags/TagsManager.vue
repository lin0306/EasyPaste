<script setup lang="ts">
import {emit} from '@tauri-apps/api/event';
import {NTag, useMessage} from 'naive-ui';
import {onMounted, reactive, ref, watch} from 'vue';
import AddIcon from '../../assets/icons/AddIcon.vue';
import LeftArrowIcon from '../../assets/icons/LeftArrowIcon.vue';
import SearchIcon from '../../assets/icons/SearchIcon.vue';
import TrashIcon from '../../assets/icons/TrashIcon.vue';
import TitleBar from '../../components/TitleBar.vue';
import {useLanguage} from '../../services/LanguageService.ts';
import ClipboardDBService from '../../services/ClipboardDBService.ts';
import {error} from "@tauri-apps/plugin-log";
import HintIcon from "../../assets/icons/HintIcon.vue";
import {getContrastColor} from "../../utils/color.ts";

const {currentLanguage} = useLanguage();

const message = useMessage();

// 标签列表数据
const tagItems = ref<TagItem[]>([])

// 右侧面板显示状态
const isPanelVisible = ref(false)

// 标签编辑状态
const editState = reactive({
  isEdit: false, // 是否为编辑模式
  currentTagId: null as number | null,
  tagId: null as number | null,
  index: -1,
  tagName: '',
  tagColor: 'rgba(128, 128, 128, 1)'
})
const originTag = ref({} as TagItem);

// 搜索关键词
const searchText = ref('')

/**
 * 加载标签列表
 */
async function loadTags() {
  try {
    const db = await ClipboardDBService.getInstance();
    const tags = await db.getAllTags();
    if (tags) {
      tagItems.value = tags
    }
  } catch (e) {
    console.error('加载标签失败', e)
    error("标签页面加载失败：" + e);
    message.error(currentLanguage.value.pages.tags.loadFailedMsg)
  }
}

/**
 * 选择标签
 * @param tag
 * @param index
 */
function selectTag(tag: TagItem, index: number) {
  editState.tagId = tag.id
  editState.index = index
  editState.isEdit = true
  editState.currentTagId = tag.id
  editState.tagName = tag.name
  editState.tagColor = tag.color
  originTag.value = {...tag};

  isPanelVisible.value = true
}

/**
 * 显示添加面板
 */
function showAddPanel() {
  // 隐藏的时候回滚数据
  if (isPanelVisible.value) {
    tagItems.value[editState.index] = originTag.value;
  }
  resetForm()
  isPanelVisible.value = !isPanelVisible.value
}

/**
 * 取消编辑操作
 */
function cancelEdit() {
  if (editState.isEdit) {
    tagItems.value[editState.index] = originTag.value;
  }
  resetForm();
  isPanelVisible.value = false
}

/**
 * 刷新列表页面的标签
 */
async function reloadListTags() {
  await emit('reload-tags');
}

/**
 * 添加标签
 */
async function addTag() {
  if (!editState.tagName.trim()) {
    message.warning(currentLanguage.value.pages.tags.tageNameIsNullWarnMsg)
    return;
  }

  try {
    if (editState.isEdit && editState.currentTagId) {
      // 更新标签
      const db = await ClipboardDBService.getInstance();
      await db.updateTag(editState.currentTagId, editState.tagName, editState.tagColor);
      message.success(currentLanguage.value.pages.tags.editSuccessMsg)
    } else {
      // 添加新标签
      const db = await ClipboardDBService.getInstance();
      await db.addTag(editState.tagName, editState.tagColor);
      message.success(currentLanguage.value.pages.tags.saveSuccessMsg)
      // 插入新数据
      setTimeout(async () => {
        const tag = await db.getLatestTag();
        if (tag) {
          tagItems.value.push(tag[0]);
        }
      }, 50);
    }

    // 重置表单并刷新列表
    resetForm();
    isPanelVisible.value = false
    // 刷新剪贴板的标签列表
    await reloadListTags();
  } catch (error) {
    console.error('操作标签失败', error)
    message.error(editState.isEdit ? currentLanguage.value.pages.tags.editFailedMsg : currentLanguage.value.pages.tags.saveFailedMsg)
  }
}

/**
 * 删除标签
 * @param id 标签id
 * @param index 标签索引
 */
async function deleteTag(id: number, index: number) {
  try {
    console.log(tagItems.value, id, index)
    const db = await ClipboardDBService.getInstance();
    await db.deleteTag(id);
    message.success(currentLanguage.value.pages.tags.deleteSuccessMsg)
    if (editState.tagId === id) {
      editState.tagId = null
      isPanelVisible.value = false
    }
    tagItems.value.splice(index, 1);
    console.log(tagItems.value)
    // 刷新剪贴板的标签列表
    await reloadListTags();
  } catch (error) {
    console.error('删除标签失败', error)
    message.error(currentLanguage.value.pages.tags.deleteFailedMsg)
  }
}

/**
 * 重置表单
 */
function resetForm() {
  editState.isEdit = false
  editState.currentTagId = null
  editState.tagName = ''
  editState.index = -1
  // 默认灰色
  editState.tagColor = 'rgba(128, 128, 128, 1)'
  editState.tagId = null
}

/**
 * 打开添加表单
 */
function openAddForm() {
  if (editState.isEdit) {
    tagItems.value[editState.index] = originTag.value;
  }
  resetForm()
}

// 过滤标签
function filterTags() {
  if (!searchText.value) {
    loadTags()
    return
  }

  const keyword = searchText.value.toLowerCase()
  tagItems.value = tagItems.value.filter(tag =>
      tag.name.toLowerCase().includes(keyword)
  )
}

watch(() => editState.tagName, (newValue: string, _oldValue: string) => {
  if (editState.isEdit) {
    tagItems.value[editState.index].name = newValue;
  }
})
watch(() => editState.tagColor, (newValue: string, _oldValue: string) => {
  if (editState.isEdit) {
    tagItems.value[editState.index].color = newValue;
  }
})

// 组件挂载时加载标签列表
onMounted(() => {
  loadTags()
})
</script>
<template>
  <div class="tag-manager-container">
    <TitleBar :title="currentLanguage.pages.tags.title" :showCloseBtn="true"
              :dev-tool="`tags`"/>

    <div class="tag-manager-content">
      <!-- 左右分栏布局 -->
      <div class="tag-manager-layout">
        <!-- 左侧标签列表 -->
        <div class="tag-list-panel" :class="{ 'tag-list-panel-narrow': isPanelVisible }">
          <!-- 搜索框 -->
          <div class="tag-list-header">
            <n-input v-model:value="searchText" :placeholder="currentLanguage.pages.list.searchHint"
                     clearable @input="filterTags">
              <template #prefix>
                <!-- 搜索 -->
                <n-icon size="18">
                  <SearchIcon/>
                </n-icon>
              </template>
            </n-input>
          </div>

          <!-- 标签列表 -->
          <div class="tag-list-container">
            <n-empty v-if="tagItems.length === 0"/>
            <div v-else class="tag-list">
              <div v-for="(tag, index) in tagItems" :key="tag.id" class="tag-item"
                   :class="{ 'tag-item-active': editState.tagId === tag.id }" @click="selectTag(tag, index)"
                   :style="{ borderLeft: `4px solid ${tag.color}` }">
                <div class="tag-item-content">
                  <div class="tag-color-preview" :style="{ backgroundColor: tag.color }"></div>
                  <div class="tag-item-name">{{ tag.name }}</div>
                </div>
                <div class="tag-item-actions" @click.stop>
                  <div class="tag-delete-button" @click="deleteTag(tag.id, index)">
                    <TrashIcon/>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 切换按钮 -->
          <div class="toggle-panel-button" @click="showAddPanel">
            <div class="toggle-icon-container" :class="{ 'unfold': isPanelVisible }">
              <LeftArrowIcon/>
            </div>
          </div>
        </div>

        <!-- 右侧详情/编辑面板 -->
        <div class="tag-detail-panel" :class="{ 'panel-visible': isPanelVisible }">
          <div class="panel-header">
            <h3>{{
                editState.isEdit ? currentLanguage.pages.tags.editTitle : currentLanguage.pages.tags.addTitle
              }}</h3>
            <div>
              <AddIcon class="add-btn" v-if="editState.isEdit" @click="openAddForm"/>
            </div>
          </div>

          <div class="panel-content">
            <div class="tag-form">
              <div class="form-item">
                <label>{{ currentLanguage.pages.tags.tagName }}</label>
                <n-input v-model:value="editState.tagName"
                         :placeholder="currentLanguage.pages.tags.tagNamePlaceholder"
                         clearable/>
                <div class="hint">
                  <HintIcon class="hint-icon"/>
                  <span class="hint-text">
                  {{ currentLanguage.pages.tags.tagNameHint }}
                </span>
                </div>
              </div>
              <div class="form-item">
                <label>{{ currentLanguage.pages.tags.tagColor }}</label>
                <div class="color-picker-container">
                  <n-color-picker v-model:value="editState.tagColor" :placement="'left-end'"/>
                </div>
              </div>
              <div class="form-item">
                <label>{{ currentLanguage.pages.tags.preview }}</label>
                <div
                    class="preview-tag-item"
                    :style="{ backgroundColor: editState.tagColor }"
                >
                  <span class="preview-tag-name"
                        :style="{ color: getContrastColor(editState.tagColor) }">{{ editState.tagName }}</span>
                </div>
                <n-tag
                    size="small"
                    round
                    closable
                    bordered
                    class="preview-item-tag"
                >
                  <div class="preview-item-tag-content">
                    <div :style="{ backgroundColor: editState.tagColor }" class="preview-item-tag-color"></div>
                    <div class="preview-item-tag-name">
                      {{ editState.tagName }}
                    </div>
                  </div>
                </n-tag>
              </div>

              <div class="form-actions">
                <n-button @click="cancelEdit">
                  {{ currentLanguage.pages.tags.cancelBtn }}
                </n-button>
                <n-button type="primary" @click="addTag">
                  {{ currentLanguage.pages.tags.saveBtn }}
                </n-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.tag-manager-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--theme-background);
  color: var(--theme-text);
}

.tag-manager-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

/* 左右分栏布局 */
.tag-manager-layout {
  display: flex;
  height: 100%;
  position: relative;
  overflow: hidden;
  /* 确保超出部分被隐藏 */
}

/* 左侧标签列表面板 */
.tag-list-panel {
  width: 100%;
  height: 100%;
  border-right: 1px solid var(--theme-border);
  display: flex;
  flex-direction: column;
  position: relative;
  transition: width 0.3s ease;
  /* 改为transform过渡效果 */
  z-index: 2;
  /* 确保在右侧面板上层 */
}

/* 当右侧面板可见时，调整左侧面板位置 */
.tag-list-panel-narrow {
  width: calc(100% - 350px) !important;
  /* 减小宽度，为右侧面板留出空间 */
  transition: width 0.3s ease;
  /* 添加宽度过渡效果 */
}

.tag-list-header {
  padding: 16px 16px 8px;
  height: 35px;
  border-bottom: 1px solid var(--theme-border);
}

.tag-list-header :deep(.n-input) {
  border-radius: 4px;
  border: 1px solid var(--theme-border);
  background-color: var(--theme-background);
}

.tag-list-header :deep(.n-input__input) {
  color: var(--theme-textHint);
}

.tag-list-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.tag-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 8px;
}

.tag-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--theme-card-background);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  cursor: pointer;
}

.tag-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tag-item-active {
  background-color: var(--theme-primary-light);
  border-left-width: 6px !important;
}

.tag-item-content {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.tag-color-preview {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

.tag-item-name {
  font-size: 14px;
  font-weight: 500;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tag-item-actions {
  display: flex;
  align-items: center;
}

.tag-delete-button {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.2s;
}

.tag-delete-button:hover {
  opacity: 1;
  transform: scale(1.1);
}

/* 切换按钮样式 */
.toggle-panel-button {
  position: absolute;
  top: 93%;
  right: 0;
  transform: translateY(-50%);
  width: 25px;
  height: 30px;
  background-color: var(--theme-togglePanelBtnBackgroundColor);
  border-radius: 15px 0 0 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.3s;
  z-index: 3;
  opacity: 0.6;
}

.toggle-panel-button:hover {
  opacity: 1;
}

.toggle-icon-container {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  opacity: 0.5;
}

.toggle-icon-container:hover {
  opacity: 1;
}

.unfold {
  opacity: 1 !important;
  transform: rotate(180deg);
}

/* 右侧详情/编辑面板 */
.tag-detail-panel {
  width: 350px;
  /* 固定宽度 */
  height: 100%;
  background-color: var(--theme-card-background);
  position: absolute;
  right: -350px;
  /* 初始位置在屏幕外 */
  top: 0;
  overflow: hidden;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 4;
  /* 确保在左侧面板上层 */
  transition: right 0.3s ease;
  /* 添加过渡效果 */
}

.panel-visible {
  right: 0;
  /* 显示时移动到可见区域 */
}

.panel-header {
  height: 35px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 8px;
  border-bottom: 1px solid var(--theme-border);
}

.panel-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.panel-content {
  padding: 8px 16px;
  height: calc(100% - 130px);
  overflow-y: auto;
}

/* 表单样式 */
.tag-form {
  padding: 8px 0;
}

.form-item {
  margin-bottom: 10px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.color-picker-container {
  margin-top: 8px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 10px;
  background-color: var(--theme-background);
  border-top: 1px solid var(--theme-border);
  width: 330px;
}

.add-btn {
  width: 20px;
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

.preview-tag-item {
  width: 100px;
  height: 30px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.preview-tag-name {
  position: absolute;
  margin-left: 20px;
  font-size: 12px;
  width: 70px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  word-break: break-all;
}

.preview-item-tag {
  margin-top: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.preview-item-tag-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 3px;
}

.preview-item-tag-color {
  width: 12px;
  height: 12px;
  border-radius: 10px;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.4);
}

.preview-item-tag-name {
  max-width: 60px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  word-break: break-all;
}
</style>