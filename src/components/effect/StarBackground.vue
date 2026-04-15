<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface Star {
  id: number
  left: number
  top: number
  delay: number
  duration: number
  size: number
}

const stars = ref<Star[]>([])
const starCount = 100

const random = (min: number, max: number) => {
  return Math.random() * (max - min) + min
}

const initStars = () => {
  stars.value = Array.from({ length: starCount }, (_, index) => ({
    id: index,
    left: random(0, 100),
    top: random(0, 100),
    delay: random(0, 3),
    duration: random(2, 4),
    size: random(1, 3),
  }))
}

onMounted(() => {
  initStars()
})
</script>

<template>
  <div class="star-field">
    <div
      v-for="star in stars"
      :key="star.id"
      class="star"
      :style="{
        left: `${star.left}%`,
        top: `${star.top}%`,
        animationDelay: `${star.delay}s`,
        animationDuration: `${star.duration}s`,
        width: `${star.size}px`,
        height: `${star.size}px`,
      }"
    />
  </div>
</template>

<style scoped>
.star-field {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.star {
  position: absolute;
  background: var(--theme-universal-primary);
  border-radius: 50%;
  animation: twinkle infinite ease-in-out;
  opacity: 0;
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.5);
  }
}
</style>
