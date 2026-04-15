NEW_FILE_CODE
<script setup lang="ts">
import { computed } from 'vue'
import { themeColors } from '../../services/ThemeService.ts'
import { setTransparency } from '../../utils/ColorUtil.ts'

interface Orb {
  id: number
  size: number
  color: string
  left?: string
  right?: string
  top?: string
  bottom?: string
  duration: number
  delay: number
}

// 根据主题生成光球配置
const orbs = computed<Orb[]>(() => {
  const colors = themeColors.value

  return [
    {
      id: 1,
      size: 400,
      color: setTransparency(colors.universal.primary, 0.3),
      left: '-100px',
      top: '-100px',
      duration: 10,
      delay: 0,
    },
    {
      id: 2,
      size: 300,
      color: setTransparency(colors.button?.primary?.backgroundColor, 0.3),
      right: '-50px',
      top: '20%',
      duration: 15,
      delay: -5,
    },
    {
      id: 3,
      size: 350,
      color: setTransparency(colors.universal.textHint, 0.3),
      left: '30%',
      bottom: '-100px',
      duration: 12,
      delay: -10,
    },
    {
      id: 4,
      size: 250,
      color: setTransparency(colors.button?.normal?.hoverBackgroundColor, 0.3),
      right: '20%',
      bottom: '10%',
      duration: 8,
      delay: -15,
    },
  ]
})
</script>

<template>
  <div class="orb-background">
    <div
      v-for="orb in orbs"
      :key="orb.id"
      class="orb"
      :style="{
        width: `${orb.size}px`,
        height: `${orb.size}px`,
        background: orb.color,
        left: orb.left,
        right: orb.right,
        top: orb.top,
        bottom: orb.bottom,
        animationDuration: `${orb.duration}s`,
        animationDelay: `${orb.delay}s`,
      }"
    />
  </div>
</template>

<style scoped>
.orb-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.6;
  animation: float ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(50px, -50px) scale(1.1);
  }
  50% {
    transform: translate(-30px, 30px) scale(0.9);
  }
  75% {
    transform: translate(30px, 50px) scale(1.05);
  }
}
</style>
