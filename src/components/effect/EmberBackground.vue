<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { themeColors } from '../../services/ThemeService.ts'
import { setTransparency } from '../../utils/ColorUtil.ts'

interface Ember {
  id: number
  left: number
  size: number
  duration: number
  delay: number
}

const embers = ref<Ember[]>([])
const emberCount = 50

// 生成随机数
const random = (min: number, max: number) => {
  return Math.random() * (max - min) + min
}

// 初始化余烬
const initEmbers = () => {
  embers.value = Array.from({ length: emberCount }, (_, index) => ({
    id: index,
    left: random(0, 100),
    size: random(2, 6),
    duration: random(5, 10),
    delay: random(0, 5),
  }))
}

// 根据主题生成余烬颜色
const emberColors = computed(() => {
  const colors = themeColors.value

  return {
    primary: setTransparency(colors.universal.primary, 0.8),
    secondary: setTransparency(colors.button?.primary?.backgroundColor, 0.8),
  }
})

onMounted(() => {
  initEmbers()
})
</script>

<template>
  <div class="ember-background">
    <!-- 上升的余烬 -->
    <div
      v-for="ember in embers"
      :key="`ember-${ember.id}`"
      class="ember"
      :style="{
        left: `${ember.left}%`,
        width: `${ember.size}px`,
        height: `${ember.size}px`,
        animationDuration: `${ember.duration}s`,
        animationDelay: `${ember.delay}s`,
        background: `radial-gradient(circle, ${emberColors.primary} 0%, ${emberColors.secondary} 50%, transparent 100%)`,
      }"
    />
  </div>
</template>

<style scoped>
.ember-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

/* 上升的余烬 */
.ember {
  position: absolute;
  border-radius: 50%;
  animation: rise linear infinite;
  bottom: -10px;
}

@keyframes rise {
  0% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  50% {
    transform: translateY(-50vh) translateX(20px) scale(1.2);
  }
  90% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(-110vh) translateX(-10px) scale(0.5);
    opacity: 0;
  }
}
</style>
