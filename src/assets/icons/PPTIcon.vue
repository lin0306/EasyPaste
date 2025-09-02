<template>
  <svg t="1756804521696" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
       p-id="1271" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200">
    <path
        d="M667.36 68.96L656 64H291.36a59.68 59.68 0 0 0-61.6 57.44 50.08 50.08 0 0 0 0 8.48v146.08h-51.68a75.2 75.2 0 0 0-65.92 80V769.6h117.92V960H912V332.8z m-13.92 65.92l176 188.16h-144a38.08 38.08 0 0 1-35.84-28.32v-160zM160 355.68c0-11.68 4.8-32 18.72-32H512c13.92 0 23.36 20.96 23.36 32v366.88H160z m116.48 555.04V769.6h305.6V355.68a77.6 77.6 0 0 0-70.4-80H277.12V129.92c0-13.92 0-18.88 16-18.88h313.76v183.68a81.6 81.6 0 0 0 80 75.36h179.04v540.64z"
        :fill="themeColors.text" p-id="1272"></path>
    <path d="M253.28 652.32h47.04V440.32h94.08v94.08h-70.24v47.04h117.28V393.28H253.28v259.04z" :fill="themeColors.text"
          p-id="1273"></path>
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