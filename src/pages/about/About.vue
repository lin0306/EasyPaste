<script setup lang="ts">
import TitleBar from '../../components/TitleBar.vue';

import {getVersion} from '@tauri-apps/api/app';
import {onMounted, ref} from 'vue';
import {useLanguage} from '../../services/LanguageService.ts';
import {openLink} from "../../utils/link.ts";

const {currentLanguage} = useLanguage();

// @ts-ignore
const appVersion = ref<string>("");

onMounted(async () => {
  appVersion.value = await getVersion();
});

</script>
<template>
  <TitleBar :title="currentLanguage.pages.about.title" :showCloseBtn="true"
            :dev-tool="`about`"/>

  <div class="about-container">
    <img src="/logo.png" class="logo" alt="程序logo">
    <div class="app-name">{{ currentLanguage.pages.about.appName }}</div>
    <div class="version-info">{{ currentLanguage.pages.about.version }}: {{ appVersion }}</div>
    <div class="links-container">
      <!-- <a href="#" @click="openLink('https://example.com/service')">服务协议</a> -->
      <a href="#" @click="openLink('https://github.com/lin0306/EasyPaste/issues')">{{
          currentLanguage.pages.about.problemFeedback
        }}</a>
      <a href="#" @click="openLink('https://github.com/lin0306/EasyPaste')">GitHub</a>
      <!-- <a href="#" @click="openLink('https://gitee.com/your-repo/clipboard')">Gitee</a> -->
    </div>
  </div>
</template>
<style scoped>
.about-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: calc(100vh - 25px);
  position: relative;
}

.logo {
  margin-top: 20px;
  width: 100px;
  margin-bottom: 20px;
  -webkit-user-drag: none;
  -moz-user-drag: none;
  -ms-user-drag: none;
  user-drag: none;
}

.app-name {
  font-size: 24px;
}

.version-info {
  margin-top: 6px;
  font-size: 14px;
}

.links-container {
  margin-top: 14px;
  display: flex;
  gap: 15px;
}

.links-container a {
  color: #1890ff;
  text-decoration: none;
  font-size: 14px;
  -webkit-user-drag: none;
}

.links-container a:hover {
  text-decoration: underline;
}
</style>
