NEW_FILE_CODE
<script setup lang="ts">
import { computed } from 'vue'
import { themeColors } from '../../services/ThemeService.ts'
import { setTransparency } from '../../utils/ColorUtil.ts'

interface AuroraLayer {
  id: number
  delay: number
  duration: number
  opacity: number
  rotate: number
}

// 极光层配置
const auroraLayers: AuroraLayer[] = [
  {
    id: 1,
    delay: 0,
    duration: 12,
    opacity: 1,
    rotate: 0,
  },
  {
    id: 2,
    delay: -5,
    duration: 18,
    opacity: 0.7,
    rotate: 180,
  },
]

// 根据主题生成极光渐变色
const auroraGradient = computed(() => {
  const colors = themeColors.value

  const primaryColor = setTransparency(colors.universal.primary, 0.3)
  const secondaryColor = setTransparency(colors.universal.text, 0.2)
  const accentColor = setTransparency(colors.universal.secondary, 0.1)

  return `
      radial-gradient(ellipse 80% 50% at 20% 40%, ${primaryColor} 0%, transparent 50%),
      radial-gradient(ellipse 60% 40% at 80% 60%, ${secondaryColor} 0%, transparent 50%),
      radial-gradient(ellipse 70% 30% at 50% 20%, ${accentColor} 0%, transparent 40%)
    `
})
</script>

<template>
  <div class="aurora-background">
    <div
      v-for="layer in auroraLayers"
      :key="layer.id"
      class="aurora"
      :style="{
        background: auroraGradient,
        animationDelay: `${layer.delay}s`,
        animationDuration: `${layer.duration}s`,
        opacity: layer.opacity,
        transform: `rotate(${layer.rotate}deg)`,
      }"
    />
  </div>
</template>

<style scoped>
.aurora-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.aurora {
  position: absolute;
  width: 200%;
  height: 200%;
  top: -50%;
  left: -50%;
  filter: blur(80px);
  animation: auroraFlow ease-in-out infinite;
}

@keyframes auroraFlow {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg) scale(1);
  }
  33% {
    transform: translate(5%, -5%) rotate(5deg) scale(1.1);
  }
  66% {
    transform: translate(-5%, 5%) rotate(-5deg) scale(0.9);
  }
}
</style>
