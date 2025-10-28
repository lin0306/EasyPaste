<template>
  <svg t="1758534732252" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
       p-id="4510" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200">
    <path
        d="M286.95 286.95h450.1v134.61l178.78-178.78L737.05 64v134.61H198.61v269.22h88.34V286.95z m450.1 450.1h-450.1V602.44L108.17 781.22 286.95 960V825.39h538.44V556.17h-88.34v180.88z"
        p-id="4511" :fill="themeColors.universal.text"></path>
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