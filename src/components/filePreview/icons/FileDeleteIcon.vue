<template>
  <svg t="1759989426962" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
       p-id="6492" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200">
    <path
        d="M614.4 79.872H143.36v869.376h737.28V345.6l-266.24-265.728z m3.072 89.6L788.48 340.48h-171.008V169.472zM204.8 887.808V141.312h351.232v260.608H819.2v485.888H204.8z"
        p-id="6493" :fill="themeColors.textDelete"></path>
    <path
        d="M680.448 529.408l-50.688-50.688-117.76 117.248-117.76-117.248-50.688 50.688 117.76 117.248-117.76 117.76 50.688 50.688 117.76-117.76 117.76 117.76 50.688-50.688-117.76-117.76z"
        p-id="6494" :fill="themeColors.textDelete"></path>
  </svg>
</template>
<script lang="ts" setup>
import {useTheme} from '../../../services/ThemeService.ts';
// 获取主题颜色
const {themeColors} = useTheme();
</script>
<style>
svg {
  width: 100%;
  height: 100%;
}
</style>