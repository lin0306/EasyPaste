<template>
    <svg t="1749527010673" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
        p-id="4400" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200">
        <path
            d="M512 64C262.4 64 64 262.4 64 512s198.4 448 448 448 448-198.4 448-448-198.4-448-448-448z m51.2 716.8c0 32-19.2 51.2-51.2 51.2s-51.2-19.2-51.2-51.2V486.4c0-32 19.2-51.2 51.2-51.2s51.2 19.2 51.2 51.2v294.4z m25.6-486.4c0 44.8-38.4 76.8-76.8 76.8s-76.8-32-76.8-76.8 32-83.2 76.8-83.2 76.8 38.4 76.8 83.2z"
            :fill="themeColors.universal.text" p-id="4401"></path>
    </svg>
</template>
<script lang="ts" setup>
import { useTheme } from '../../services/ThemeService.ts';
// 获取主题颜色
const { themeColors } = useTheme();
</script>
<style>
svg {
    width: 100%;
    height: 100%;
}
</style>