<template>
  <TitleBar
    :dev-tool="`item-editor`"
    :title="currentLanguage.pages.list.editor.title"
    showCloseBtn
  />
  <div class="text-editor">
    <n-space class="button-lines" reverse>
      <n-button type="primary" @click="saveItemContent">{{
        currentLanguage.pages.list.editor.saveBtn
      }}</n-button>
      <n-button @click="item.currentContent = item.originContent">{{
        currentLanguage.pages.list.editor.resetBtn
      }}</n-button>
    </n-space>
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
    message.success(currentLanguage.value.pages.list.editor.saveSuccessMsg)
    item.originContent = item.currentContent
  } else {
    message.error(currentLanguage.value.pages.list.editor.saveFailedMsg)
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
  height: 100%;
  background-color: var(--theme-editor-backgroundColor);
}

.button-lines {
  padding: 10px;
}

.editor-container {
  display: flex;
  border: 1px solid var(--theme-universal-border);
  overflow: hidden;
  height: calc(100vh - 80px);
}

.line-numbers {
  background-color: var(--theme-editor-lineNumberBackgroundColor);
  padding: 10px 0;
  text-align: right;
  overflow: hidden;
  user-select: none;
  border-right: 1px solid var(--theme-universal-border);
  font-size: 14px;
  line-height: 1.5;
}

.line-number {
  padding: 0 8px;
  color: var(--theme-universal-textHint);
  height: 21px; /* 匹配textarea行高 */
}

.line-number.active-line {
  background-color: var(--theme-editor-lineNumberBackgroundColorActive);
  color: var(--theme-universal-text);
}

.editor-textarea {
  flex: 1;
  margin: 10px 0;
  border: none;
  resize: none;
  font-size: 14px;
  line-height: 1.5;
  font-family: inherit;
  outline: none;
  white-space: nowrap;
  overflow: auto;
  background-color: var(--theme-editor-backgroundColor);
  color: var(--theme-universal-text);
}

.editor-textarea:focus {
  box-shadow: none;
}
</style>
