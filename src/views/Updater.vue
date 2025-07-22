<script setup lang="ts">
import { open } from '@tauri-apps/plugin-shell';
import TitleBar from '../components/TitleBar.vue';

import { check } from '@tauri-apps/plugin-updater';
import { onMounted, reactive, ref } from 'vue';
import { useLanguage } from '../configs/LanguageConfig';
import UpdaterService from '../services/UpdaterService';
import {getCurrentWindow} from "@tauri-apps/api/window";
import {covertMarkdown} from "../utils/strUtil.ts";

const { currentLanguage } = useLanguage();
let updater: any = null;
const updaterVer: UpdaterInfo = reactive({
  version: '',
  pubDate: '',
  notes: ''
});

// 下载状态
const isDownloading = ref(false);
const downloadProgress = ref(0);
const downloadCompleted = ref(false);

// 下载信息
const downloadSpeed = ref<any>(0); // 下载速度 (KB/s)
const downloadSpeedUnit = ref('KB/s');
const downloadedSize = ref<any>(0); // 已下载大小 (MB)
const totalSize = ref<any>(0); // 总大小 (MB)

// 打开GitHub发布页面
function openGitHubReleases() {
  // 使用electron的shell模块打开外部链接
  open('https://github.com/lin0306/EasyPaste/releases');
}

// 下载更新
function downloadUpdate() {
  downloadProgress.value = 0; // 初始化进度值
  console.log('设置isDownloading为true', isDownloading.value);
  // 触发下载操作
  UpdaterService.download(updater, (event) => {
    switch (event.event) {
      case "Started":
        isDownloading.value = true;
        totalSize.value = event.data.contentLength
        console.log('下载开始', event.data.contentLength);
        break;
      case "Progress":
        downloadedSize.value = event.data.chunkLength + downloadedSize.value
        console.log('下载进度', event.data.chunkLength);
        if (event.data.chunkLength < 1024) {
          downloadSpeed.value = event.data.chunkLength;
          downloadSpeedUnit.value = 'B/s';
        } else if (event.data.chunkLength < 1024 * 1024) {
          downloadSpeed.value = Number(event.data.chunkLength / 1024).toFixed(2);
          downloadSpeedUnit.value = 'KB/s';
        } else {
          downloadSpeed.value = Number(event.data.chunkLength / 1024 / 1026).toFixed(2);
          downloadSpeedUnit.value = 'MB/s';
        }
        if (totalSize.value <= 0) {
          // 防止除以0或处理无效的总大小
          return 0;
        } else {
          const progress = (downloadedSize.value / totalSize.value) * 100;
          // 返回介于0到100之间的数值，避免超出范围的情况
          downloadProgress.value = Math.min(100, Math.max(0, progress));
        }
        break;
      case "Finished":
        downloadCompleted.value = true;
        isDownloading.value = false;
        console.log('下载完成');
        // 窗口最小化了，下载完成后自动取消最小化
        getCurrentWindow().unminimize();
        break;
    }
  }, undefined);
}

// 立即安装更新并重启
function installNow() {
  // 触发安装操作
  UpdaterService.install(updater);
}

onMounted(async () => {
  updater = await check();
  updaterVer.version = updater.version;
  updaterVer.pubDate = updater.date;
  updaterVer.notes = updater.body;
})

</script>
<template>
  <div class="update-container">
    <TitleBar :title="currentLanguage.pages.update.title" :showMinimizeBtn="true" :showCloseBtn="true"
      :dev-tool="`updater`" />
    <!-- 更新内容展示区域 -->
    <div class="update-content">
      <div class="release-header">
        <h2 class="release-version">{{ updaterVer.version || currentLanguage.pages.update.versionName }}</h2>
        <span class="release-tag" v-if="updaterVer.version && updaterVer.version.includes('beta')">Pre-release</span>
      </div>
      <div class="release-date" v-if="updaterVer.pubDate">
        {{ new Date(updaterVer.pubDate).toLocaleDateString() }}
      </div>
      <div class="divider"></div>
      <vue-markdown class="release-notes github-markdown" v-if="updaterVer.notes" v-html="covertMarkdown(updaterVer.notes)" />
      <div class="release-notes" v-else>
        {{ currentLanguage.pages.update.updateNotes }}
      </div>
      <!-- 查看更多按钮 -->
      <div class="view-more-container">
        <n-button quaternary @click="openGitHubReleases">
          {{ currentLanguage.pages.update.viewMoreBtn }}
          <span class="view-more-icon">→</span>
        </n-button>
      </div>
    </div>

    <!-- 下载进度条 -->
    <div class="download-progress" v-if="isDownloading">
      <div class="progress-title">{{ currentLanguage.pages.update.downloadingTitle }}</div>
      <div class="progress-bar">
        <div class="progress-inner" :style="{ width: downloadProgress + '%' }"></div>
      </div>
      <div class="progress-info">
        <div class="progress-text">{{ downloadProgress.toFixed(1) }}%</div>
        <div class="download-details">
          <span>{{ Number(Number(downloadedSize) / 1024 / 1024).toFixed(2) }}MB / {{ Number(Number(totalSize) / 1024 /
            1024).toFixed(2) }}MB</span>
          <span class="download-speed">{{ downloadSpeed }} {{ downloadSpeedUnit }}</span>
        </div>
      </div>
    </div>

    <!-- 底部按钮区域 -->
    <div class="update-footer" v-show="!isDownloading">
      <!-- 初始状态：显示暂不更新和立即下载按钮 -->
      <div class="update-actions">
        <div class="left-action">

        </div>
        <div class="right-action">
          <n-button type="primary" @click="downloadUpdate" v-if="!downloadCompleted">
            {{ currentLanguage.pages.update.downloadNowBtn }}
          </n-button>
          <!-- 备份完成后显示立即重启按钮 -->
          <n-button type="primary" @click="installNow" v-if="downloadCompleted">
            {{ currentLanguage.pages.update.restartImmediatelyBtn }}
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.update-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: var(--theme-background);
  color: var(--theme-text);
}

.update-content {
  flex: 1;
  padding: 20px;
  margin-bottom: 100px;
  /* 为标题栏留出空间 */
  overflow-y: auto;
}

.release-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.release-version {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.release-tag {
  display: inline-block;
  padding: 0 7px;
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  border: 1px solid #9a6700;
  border-radius: 2em;
  margin-left: 8px;
  color: #9a6700;
}

.release-date {
  font-size: 12px;
  color: var(--theme-secondaryText);
  margin-bottom: 15px;
}

.divider {
  width: 100%;
  border-bottom: 1px solid var(--theme-border);
}

.release-notes {
  font-size: 14px;
  line-height: 1.5;
}

/* GitHub风格的Markdown样式 */
.github-markdown {
  color: var(--theme-text);
}

.github-markdown h1,
.github-markdown h2,
.github-markdown h3,
.github-markdown h4,
.github-markdown h5,
.github-markdown h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

.github-markdown h1 {
  font-size: 2em;
  border-bottom: 1px solid var(--theme-border);
  padding-bottom: 0.3em;
}

.github-markdown h2 {
  font-size: 1.5em;
  border-bottom: 1px solid var(--theme-border);
  padding-bottom: 0.3em;
}

.github-markdown h3 {
  font-size: 1.25em;
}

.github-markdown ul,
.github-markdown ol {
  padding-left: 2em;
  margin-top: 0;
  margin-bottom: 16px;
}

.github-markdown li {
  margin-top: 0.25em;
}

.github-markdown p {
  margin-top: 0;
  margin-bottom: 16px;
}

.github-markdown code {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(175, 184, 193, 0.2);
  border-radius: 6px;
}

.github-markdown pre {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa;
  border-radius: 6px;
  margin-bottom: 16px;
}

.github-markdown blockquote {
  padding: 0 1em;
  color: #57606a;
  border-left: 0.25em solid #d0d7de;
  margin: 0 0 16px 0;
}

.update-footer {
  padding: 15px 20px;
  border-top: 1px solid var(--theme-border);
  background-color: var(--theme-cardBackground);
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  box-sizing: border-box;
  z-index: 90;
}

.update-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-action,
.right-action {
  display: flex;
  align-items: center;
}

.remind-text {
  margin-left: 10px;
  font-size: 12px;
  color: var(--theme-secondaryText);
}

.days-selector {
  margin-left: 5px;
}

.days-selector select {
  padding: 2px 5px;
  border-radius: 4px;
  border: 1px solid var(--theme-border);
  background-color: var(--theme-inputBackground);
  color: var(--theme-text);
}

.download-progress,
.backup-progress {
  padding: 15px 20px;
  border-top: 1px solid var(--theme-border);
  background-color: var(--theme-cardBackground);
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  box-sizing: border-box;
  z-index: 200;
  display: block !important;
  /* 强制显示 */
}

.progress-title {
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--theme-primary);
}

.progress-bar {
  height: 10px;
  background-color: var(--theme-background);
  /* 使用固定颜色而非变量 */
  border-radius: 4px;
  overflow: visible;
  /* 确保内容不被裁剪 */
  margin-bottom: 8px;
  border: 1px solid var(--theme-border);
  position: relative;
  /* 添加相对定位 */
  z-index: 95;
  /* 确保进度条容器有较高的z-index */
}

.progress-inner {
  height: 100%;
  background-color: var(--theme-primary);
  /* 使用固定颜色而非变量 */
  transition: width 0.3s ease;
  min-width: 2px;
  /* 确保即使是0%也能看到一点点 */
  position: absolute;
  /* 使用绝对定位 */
  left: 0;
  top: 0;
  z-index: 100;
  /* 提高z-index确保进度条内容可见 */
  border-radius: 4px;
  /* 添加圆角与外层一致 */
  display: block !important;
  /* 强制显示 */
  opacity: 1 !important;
  /* 确保不透明 */
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px;
}

.progress-text {
  font-size: 12px;
  color: var(--theme-secondaryText);
}

.download-details {
  display: flex;
  font-size: 12px;
  color: var(--theme-secondaryText);
}

.download-speed {
  margin-left: 10px;
}

/* 查看更多按钮样式 */
.view-more-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  margin-bottom: 10px;
}

.view-more-icon {
  margin-left: 5px;
  font-size: 16px;
  transition: transform 0.3s ease;
}

:deep(.n-button:hover) .view-more-icon {
  transform: translateX(3px);
}

.restart-button-container {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}
</style>
