<template>
  <svg t="1758182119323" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
       p-id="2251" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200">
    <path
        d="M510.9 60.7c-245.6 0-446.7 199.8-446.7 446.7C64.2 753 263.9 954 510.8 954s446.6-199.7 446.6-446.6c0.1-245.6-199.6-446.7-446.5-446.7z m-24.7 574c0 8.8-7.2 16-16 16h-94.9c-8.8 0-16-7.2-16-16V389.3c0-8.8 7.2-16 16-16h94.9c8.8 0 16 7.2 16 16v245.4z m178.5 0c0 8.8-7.2 16-16 16h-94.9c-8.8 0-16-7.2-16-16V389.3c0-8.8 7.2-16 16-16h94.9c8.8 0 16 7.2 16 16v245.4z"
        p-id="2252" :fill="themeColors.text"></path>
  </svg>
</template>
<script lang="ts" setup>
import {useTheme} from '../../services/ThemeService.ts';
// 获取主题颜色
const {themeColors} = useTheme();
</script>
<style>
svg {
  width: 100%;
  height: 100%;
}
</style>