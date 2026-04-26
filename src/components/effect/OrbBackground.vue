<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { themeColors } from '../../services/ThemeService.ts'
import { getColorRGBColorValue } from '../../utils/ColorUtil.ts'

interface Orb {
  id: number
  x: number
  y: number
  size: number
  color: string
  vx: number // X轴速度
  vy: number // Y轴速度
  phase: number // 运动相位
}

const canvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let animationId: number | null = null
let width = 0
let height = 0

// 光球配置
const orbs = ref<Orb[]>([])

// 根据主题获取光球颜色
const getOrbColors = () => {
  const colors = themeColors.value

  const primaryRGB = getColorRGBColorValue(colors.universal.primary) || '100, 150, 255'
  const secondaryRGB = getColorRGBColorValue(colors.universal.secondary) || '255, 100, 200'
  const textRGB = getColorRGBColorValue(colors.universal.textHint) || '150, 200, 255'

  return [
    `rgba(${primaryRGB}, 0.40)`,
    `rgba(${secondaryRGB}, 0.35)`,
    `rgba(${textRGB}, 0.30)`,
    `rgba(${primaryRGB}, 0.25)`,
  ]
}

// 创建光球
const createOrb = (index: number): Orb => {
  const colors = getOrbColors()
  const sizes = [600, 700, 650, 550] // 增大光球尺寸

  // 分散光球位置，避免集中在一个区域
  const positions = [
    { x: width * 0.2, y: height * 0.2 }, // 左上
    { x: width * 0.8, y: height * 0.3 }, // 右上
    { x: width * 0.3, y: height * 0.7 }, // 左下
    { x: width * 0.7, y: height * 0.8 }, // 右下
  ]

  const pos = positions[index] || { x: Math.random() * width, y: Math.random() * height }

  return {
    id: index,
    x: pos.x,
    y: pos.y,
    size: sizes[index] || 600,
    color: colors[index % colors.length],
    vx: (Math.random() - 0.5) * 0.2, // 降低移动速度
    vy: (Math.random() - 0.5) * 0.2,
    phase: Math.random() * Math.PI * 2,
  }
}

const initOrbs = () => {
  orbs.value = []
  for (let i = 0; i < 4; i++) {
    orbs.value.push(createOrb(i))
  }
}

const updateOrb = (orb: Orb) => {
  // 基础移动
  orb.x += orb.vx
  orb.y += orb.vy

  // 添加正弦波浮动效果
  orb.phase += 0.01
  orb.x += Math.sin(orb.phase) * 0.2
  orb.y += Math.cos(orb.phase * 0.7) * 0.2

  // 边界检测 - 环绕效果
  const margin = orb.size / 2
  if (orb.x < -margin) orb.x = width + margin
  if (orb.x > width + margin) orb.x = -margin
  if (orb.y < -margin) orb.y = height + margin
  if (orb.y > height + margin) orb.y = -margin
}

const drawOrb = (orb: Orb) => {
  if (!ctx) return

  // 创建径向渐变实现柔和光晕
  const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.size / 2)
  gradient.addColorStop(0, orb.color)
  gradient.addColorStop(0.4, orb.color.replace(/[\d.]+\)$/, '0.15)'))
  gradient.addColorStop(0.7, orb.color.replace(/[\d.]+\)$/, '0.05)'))
  gradient.addColorStop(1, orb.color.replace(/[\d.]+\)$/, '0)'))

  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(orb.x, orb.y, orb.size / 2, 0, Math.PI * 2)
  ctx.fill()
}

const animate = () => {
  if (!ctx || !canvas.value) return

  ctx.clearRect(0, 0, width, height)

  // 使用混合模式让光球相互融合
  ctx.globalCompositeOperation = 'screen'

  orbs.value.forEach(orb => {
    updateOrb(orb)
    drawOrb(orb)
  })

  ctx.globalCompositeOperation = 'source-over'

  animationId = requestAnimationFrame(animate)
}

const handleResize = () => {
  if (!canvas.value) return
  width = window.innerWidth
  height = window.innerHeight
  canvas.value.width = width
  canvas.value.height = height
  initOrbs()
}

const refreshOrbColors = () => {
  orbs.value.forEach((orb, index) => {
    const colors = getOrbColors()
    orb.color = colors[index % colors.length]
  })
}

watch(
  () => themeColors.value,
  () => {
    refreshOrbColors()
  },
  { deep: true }
)

onMounted(() => {
  if (!canvas.value) return

  ctx = canvas.value.getContext('2d')
  if (!ctx) return

  width = window.innerWidth
  height = window.innerHeight
  canvas.value.width = width
  canvas.value.height = height

  initOrbs()
  animate()

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="orb-background">
    <canvas ref="canvas" class="orb-canvas" />
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

.orb-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
