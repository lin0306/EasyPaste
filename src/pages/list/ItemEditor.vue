<template>
  <TitleBar :title="currentLanguage.pages.itemEditor.title" showCloseBtn />
  <div class="text-editor">
    <div class="editor-wrapper">
      <div class="editor-container">
        <div ref="lineNumbers" class="line-numbers">
          <div
            v-for="line in lineCount"
            :key="line"
            :class="{ 'active-line': line === currentLine }"
            class="line-number"
          >
            {{ line }}
          </div>
        </div>
        <textarea
          ref="textarea"
          v-model="item.currentContent"
          class="editor-textarea"
          spellcheck="false"
          @click="updateCurrentLine($event)"
          @input="updateLineCount($event)"
          @keydown="handleKeydown"
          @scroll="syncScroll"
        />
      </div>
    </div>
    <div class="button-bar">
      <n-space reverse>
        <n-button type="primary" size="large" @click="saveItemContent">
          {{ currentLanguage.pages.itemEditor.saveBtn }}
        </n-button>
        <n-button size="large" @click="item.currentContent = item.originContent">
          {{ currentLanguage.pages.itemEditor.resetBtn }}
        </n-button>
      </n-space>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from 'vue'
import { currentLanguage } from '../../services/LanguageService.ts'
import TitleBar from '../../components/TitleBar.vue'
import ClipboardDBService from '../../services/ClipboardDBService.ts'
import { emit, listen } from '@tauri-apps/api/event'
import { useMessage } from 'naive-ui'

const message = useMessage()

const item = reactive({
  id: -1,
  originContent: '',
  currentContent: '',
})
const textarea = ref<any>(null)
const lineNumbers = ref<any>(null)
const currentLine = ref<number>(1)

// 计算行数
const lineCount = computed(() => {
  if (!item.currentContent) return 1
  return item.currentContent.split('\n').length
})

/**
 * 初始化文件更新监听器
 */
let reloadEditorListener: any = null

/**
 * 更新当前行号
 * @param event 可选的事件对象，用于获取最新的 textarea 值
 */
const updateCurrentLine = (event?: Event) => {
  if (!textarea.value) return

  // 【关键修复】优先使用事件中的最新值，如果没有事件则读取 DOM 当前值
  // 避免依赖可能滞后的 item.currentContent
  const target = (event?.target as HTMLTextAreaElement) || textarea.value
  const currentText = target.value

  const cursorPos = target.selectionStart

  // 基于实际 DOM 中的文本计算行数
  const textBeforeCursor = currentText.substring(0, cursorPos)
  currentLine.value = textBeforeCursor.split('\n').length
}

/**
 * 更新行数显示
 */
const updateLineCount = (event?: Event) => {
  updateCurrentLine(event)
  nextTick(() => {
    syncScroll()
  })
}

/**
 * 同步滚动
 */
const syncScroll = () => {
  if (lineNumbers.value && textarea.value) {
    lineNumbers.value.scrollTop = textarea.value.scrollTop
  }
}

/**
 * 处理键盘事件（如Tab键插入4个空格）
 * @param e
 */
const handleKeydown = (e: any) => {
  if (e.key === 'Tab') {
    e.preventDefault()
    const start = e.target.selectionStart
    const end = e.target.selectionEnd

    // 在光标位置插入4个空格
    item.currentContent =
      item.currentContent.substring(0, start) + '    ' + item.currentContent.substring(end)

    // 移动光标到插入内容后
    nextTick(() => {
      e.target.selectionStart = e.target.selectionEnd = start + 4
      updateCurrentLine()
    })
  } else if (e.key === 'Enter') {
    // 处理回车键时保持缩进
    setTimeout(() => {
      updateCurrentLine()
    }, 0)
  } else if (e.key === 'ArrowDown' || 'ArrowUp') {
    setTimeout(() => {
      updateCurrentLine()
    }, 0)
  }
}

/**
 * 加载数据
 */
const onLoadItem = async () => {
  if (item.id) {
    const db = await ClipboardDBService.getInstance()
    const itemInfo = await db.getItem(item.id)
    if (itemInfo) {
      item.originContent = itemInfo.content
      item.currentContent = itemInfo.content
    }
  }
}

/**
 * 保存数据
 */
const saveItemContent = async () => {
  const db = await ClipboardDBService.getInstance()
  const result = await db.updateItemContent(item.id, item.currentContent)
  if (result) {
    await emit('update-content', { itemId: item.id })
    message.success(currentLanguage.value.pages.itemEditor.saveSuccessMsg)
    item.originContent = item.currentContent
  } else {
    message.error(currentLanguage.value.pages.itemEditor.saveFailedMsg)
  }
}

/**
 * 监听数据更新
 */
const initReloadEditorListener = async () => {
  return await listen('reload-editor', async (event: any) => {
    item.id = event.payload.itemId
    // 更新窗口url
    window.history.replaceState(
      null,
      '',
      `${window.location.origin}${window.location.pathname}?itemId=${item.id}`
    )
    await onLoadItem()
  })
}

onMounted(async () => {
  // 加载数据
  const searchParams = new URLSearchParams(window.location.search)
  item.id = parseInt(<string>searchParams.get('itemId'))
  await onLoadItem()
  // 初始化行数
  updateLineCount()

  reloadEditorListener = await initReloadEditorListener()
})

onUnmounted(() => {
  if (reloadEditorListener) {
    reloadEditorListener()
  }
})
</script>

<style scoped>
.text-editor {
  width: 100%;
  height: calc(100vh - 25px);
  display: flex;
  flex-direction: column;
  background-color: var(--theme-editor-backgroundColor);
}

.editor-wrapper {
  flex: 1;
  overflow: hidden;
  padding: 16px;
  min-height: 0;
}

.editor-container {
  display: flex;
  border: 1px solid var(--theme-universal-border);
  border-radius: 8px;
  overflow: hidden;
  height: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.3s ease;
}

.editor-container:focus-within {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--theme-primary-color);
}

.line-numbers {
  background: linear-gradient(
    to bottom,
    var(--theme-editor-lineNumberBackgroundColor),
    var(--theme-editor-lineNumberBackgroundColor)
  );
  padding: 12px 0;
  text-align: right;
  overflow: hidden;
  user-select: none;
  border-right: 1px solid var(--theme-universal-border);
  font-size: 14px;
  line-height: 1.6;
  min-width: 50px;
  transition: background-color 0.2s ease;
}

.line-number {
  padding: 0 12px;
  color: var(--theme-universal-textHint);
  height: 22.4px;
  transition: all 0.2s ease;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.line-number.active-line {
  background-color: var(--theme-editor-lineNumberBackgroundColorActive);
  color: var(--theme-universal-text);
  font-weight: 600;
  position: relative;
}

.line-number.active-line::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: var(--theme-primary-color);
}

.editor-textarea {
  flex: 1;
  margin: 0;
  padding: 12px 16px;
  border: none;
  resize: none;
  font-size: 14px;
  line-height: 1.6;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  outline: none;
  white-space: pre;
  overflow-y: auto;
  overflow-x: auto;
  background-color: var(--theme-editor-backgroundColor);
  color: var(--theme-universal-text);
  tab-size: 4;
}

.editor-textarea::placeholder {
  color: var(--theme-universal-textHint);
  opacity: 0.6;
}

.editor-textarea:focus {
  box-shadow: none;
}

.line-numbers::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.button-bar {
  flex-shrink: 0;
  padding: 16px;
  background-color: var(--theme-editor-backgroundColor);
  border-top: 1px solid var(--theme-universal-border);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
}

.button-bar :deep(.n-space) {
  justify-content: flex-end;
}

.button-bar :deep(.n-button) {
  min-width: 100px;
  transition: all 0.3s ease;
}

.button-bar :deep(.n-button:hover) {
  transform: translateY(-2px);
}
</style>
