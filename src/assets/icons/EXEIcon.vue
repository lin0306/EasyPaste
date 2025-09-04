<template>
  <svg t="1756992230739" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
       p-id="18225" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200">
    <path
        d="M930.3 863.3H93.7c-16 0-29-13-29-29V189.7c0-16 13-29 29-29h836.5c16 0 29 13 29 29v644.5c0.1 16.1-12.9 29.1-28.9 29.1z m-807.5-58.1h778.5V218.8H122.8v586.4z"
        p-id="18226" :fill="themeColors.text"></path>
    <path d="M93.7 309.4h836.5v58H93.7zM177.4 235.1h55.8v58h-55.8zM288.9 235.1h55.8v58h-55.8z" p-id="18227"
          :fill="themeColors.text"></path>
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