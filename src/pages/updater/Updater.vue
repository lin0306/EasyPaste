<script setup lang="ts">
import TitleBar from '../../components/TitleBar.vue';

import {check, Update} from '@tauri-apps/plugin-updater';
import {onMounted, reactive, ref} from 'vue';
import {useLanguage} from '../../services/LanguageService.ts';
import UpdaterService from '../../services/UpdaterService.ts';
import {getCurrentWebviewWindow} from "@tauri-apps/api/webviewWindow";
import {marked} from "marked";
import {getRenderer} from "../../utils/MarkdownUtil.ts";
import {openLink} from "../../utils/LinkUtil.ts";

marked.setOptions({
  breaks: true,
  gfm: true,
  renderer: getRenderer()
});


const {currentLanguage} = useLanguage();
let updater: Update;
const updaterVer: UpdaterInfo = reactive({
  version: '',
  pubDate: '',
  notes: ''
});
const onLoading = ref(true);

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
  openLink('https://github.com/lin0306/EasyPaste/releases');
}

// 下载更新
function downloadUpdate() {
  isDownloading.value = true;
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
        getCurrentWebviewWindow().unminimize();
        getCurrentWebviewWindow().setFocus();
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
  const updateInfo = await check();
  if (!updateInfo) {
    return;
  }
  updater = updateInfo;
  console.log(updater);
  updaterVer.version = updateInfo.version;
  updaterVer.pubDate = updateInfo.date || '';
  updaterVer.notes = await marked(updateInfo.body || '');
  onLoading.value = false;
})

</script>
<template>
  <div class="update-container">
    <TitleBar :title="currentLanguage.pages.update.title" :showMinimizeBtn="true" :showCloseBtn="true"
              :dev-tool="`updater`"/>
    <!-- 加载展示 -->
    <div v-if="onLoading" class="loading-container">
      <n-spin/>
    </div>
    <!-- 更新内容展示区域 -->
    <div v-else class="update-content"
         :style="{height: isDownloading ? `calc(100% - 160px)`: 'calc(100% - 120px)'}">
      <div class="release-header">
        <h2 class="release-version">{{ updaterVer.version || currentLanguage.pages.update.versionName }}</h2>
        <span class="release-tag" v-if="updaterVer.version && updaterVer.version.includes('beta')">Pre-release</span>
      </div>
      <div class="release-date" v-if="updaterVer.pubDate">
        {{ new Date(updaterVer.pubDate).toLocaleDateString() }}
      </div>
      <div class="divider"></div>
      <div v-if="updaterVer.notes" class="release-notes" v-html="updaterVer.notes"/>
      <div class="release-notes" v-else>
        {{ currentLanguage.pages.update.updateNotes }}
      </div>
      <!-- 查看更多按钮 -->
      <div class="view-more-container">
        <n-button type="primary" quaternary @click="openGitHubReleases">
          {{ currentLanguage.pages.update.viewMoreBtn }}
          <span class="view-more-icon">→</span>
        </n-button>
      </div>
    </div>

    <!-- 下载进度条 -->
    <div class="download-progress" v-if="!onLoading && isDownloading">
      <div class="progress-title">{{ currentLanguage.pages.update.downloadingTitle }}</div>
      <div class="progress-bar">
        <div class="progress-inner" :style="{ width: downloadProgress + '%' }"></div>
      </div>
      <div class="progress-info">
        <div class="progress-text">{{ downloadProgress.toFixed(1) }}%</div>
        <div class="download-details">
          <span>{{ Number(Number(downloadedSize) / 1024 / 1024).toFixed(2) }}MB / {{
              Number(Number(totalSize) / 1024 /
                  1024).toFixed(2)
            }}MB</span>
          <span class="download-speed">{{ downloadSpeed }} {{ downloadSpeedUnit }}</span>
        </div>
      </div>
    </div>

    <!-- 底部按钮区域 -->
    <div class="update-footer" v-show="!onLoading && !isDownloading">
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
  background-color: var(--theme-universal-background);
  color: var(--theme-universal-text);
}

.loading-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.update-content {
  position: absolute;
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  margin-top: 20px;
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
  color: var(--theme-universal-text);
  margin-bottom: 15px;
}

.divider {
  width: 100%;
  border-bottom: 1px solid var(--theme-universal-border);
}

.release-notes {
  font-size: 14px;
  line-height: 1.5;
}

.update-footer {
  padding: 15px 20px;
  border-top: 1px solid var(--theme-universal-border);
  background-color: var(--theme-universal-secondary);
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 65px;
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

.download-progress {
  padding: 15px 20px;
  border-top: 1px solid var(--theme-universal-border);
  background-color: var(--theme-universal-secondary);
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 105px;
  box-sizing: border-box;
  z-index: 200;
  /* 强制显示 */
  display: block !important;
}

.progress-title {
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--theme-universal-primary);
}

.progress-bar {
  height: 10px;
  background-color: var(--theme-universal-background);
  border-radius: 4px;
  overflow: visible;
  margin-bottom: 8px;
  border: 1px solid var(--theme-universal-border);
  position: relative;
  z-index: 95;
}

.progress-inner {
  height: 100%;
  background-color: var(--theme-universal-primary);
  min-width: 2px;
  /* 使用绝对定位 */
  position: absolute;
  left: 0;
  top: 0;
  /* 提高z-index确保进度条内容可见 */
  z-index: 100;
  /* 添加圆角与外层一致 */
  border-radius: 4px;
  /* 强制显示 */
  display: block !important;
  /* 确保不透明 */
  opacity: 1 !important;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px;
}

.progress-text {
  font-size: 12px;
  color: var(--theme-universal-text);
}

.download-details {
  display: flex;
  font-size: 12px;
  color: var(--theme-universal-text);
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
  transition: transform var(--animation-duration, 0.3s) ease;
}

:deep(.n-button:hover) .view-more-icon {
  transform: translateX(3px);
}
</style>
