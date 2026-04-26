<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { themeColors } from '../../services/ThemeService.ts'
import { getColorRGBColorValue } from '../../utils/ColorUtil.ts'

interface Star {
  id: number
  x: number
  y: number
  size: number
  baseAlpha: number
  alpha: number
  twinkleSpeed: number
  twinklePhase: number
  color: string
  layer: number // 层级：0-背景层, 1-中层, 2-前景层
}

const stars = ref<Star[]>([])
const canvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let animationId: number | null = null
let width = 0
let height = 0

// 根据主题获取星星颜色
const getStarColors = () => {
  const colors = themeColors.value
  
  const primaryRGB = getColorRGBColorValue(colors.universal.primary)
  const textRGB = getColorRGBColorValue(colors.universal.text)
  const secondaryRGB = getColorRGBColorValue(colors.universal.secondary)
  
  return [
    primaryRGB || '255, 255, 255',
    textRGB || '200, 220, 255',
    secondaryRGB || '255, 240, 200',
    '255, 255, 255',
  ]
}

const getRandomColor = () => {
  const colors = getStarColors()
  return colors[Math.floor(Math.random() * colors.length)]
}

// 创建星星 - 三层星空效果
const createStar = (layer: number): Star => {// 不同层的移动速度倍率
  const sizeRanges = [[0.5, 1.5], [1, 2.5], [1.5, 3.5]] // 不同层的大小范围
  
  const [minSize, maxSize] = sizeRanges[layer]
  
  return {
    id: Math.random(),
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * (maxSize - minSize) + minSize,
    baseAlpha: Math.random() * 0.6 + 0.3,
    alpha: 0,
    twinkleSpeed: Math.random() * 0.02 + 0.01,
    twinklePhase: Math.random() * Math.PI * 2,
    color: getRandomColor(),
    layer,
  }
}

const initStars = () => {
  const starCounts = [80, 50, 30] // 每层的星星数量
  stars.value = []
  
  for (let layer = 0; layer < 3; layer++) {
    for (let i = 0; i < starCounts[layer]; i++) {
      stars.value.push(createStar(layer))
    }
  }
}

const updateStar = (star: Star) => {
  star.twinklePhase += star.twinkleSpeed
  // 使用更柔和的正弦波，透明度变化范围更小
  star.alpha = star.baseAlpha + Math.sin(star.twinklePhase) * 0.15
}

const drawStar = (star: Star) => {
  if (!ctx) return
  
  ctx.save()
  ctx.globalAlpha = Math.max(0, Math.min(1, star.alpha))
  
  // 添加柔和的十字星芒（仅对较大的星星）- 先绘制星芒作为底层光效
  if (star.size > 2) {
    const spikeAlpha = star.alpha * 0.5 // 星芒透明度跟随星星闪烁
    const spikeLength = star.size * 2.2 // 星芒长度
    
    // 创建星芒的径向渐变 - 从中心向外扩散的柔和光线
    const spikeGradient = ctx.createRadialGradient(
      star.x, star.y, 0,
      star.x, star.y, spikeLength
    )
    spikeGradient.addColorStop(0, `rgba(${star.color}, ${spikeAlpha})`)
    spikeGradient.addColorStop(0.2, `rgba(${star.color}, ${spikeAlpha * 0.6})`)
    spikeGradient.addColorStop(0.5, `rgba(${star.color}, ${spikeAlpha * 0.2})`)
    spikeGradient.addColorStop(1, `rgba(${star.color}, 0)`)
    
    ctx.fillStyle = spikeGradient
    
    // 水平光束
    ctx.beginPath()
    ctx.moveTo(star.x - spikeLength, star.y - star.size * 0.3)
    ctx.lineTo(star.x + spikeLength, star.y - star.size * 0.3)
    ctx.lineTo(star.x + spikeLength, star.y + star.size * 0.3)
    ctx.lineTo(star.x - spikeLength, star.y + star.size * 0.3)
    ctx.closePath()
    ctx.fill()
    
    // 垂直光束
    ctx.beginPath()
    ctx.moveTo(star.x - star.size * 0.3, star.y - spikeLength)
    ctx.lineTo(star.x + star.size * 0.3, star.y - spikeLength)
    ctx.lineTo(star.x + star.size * 0.3, star.y + spikeLength)
    ctx.lineTo(star.x - star.size * 0.3, star.y + spikeLength)
    ctx.closePath()
    ctx.fill()
  }
  
  // 绘制核心亮点 - 带柔和光晕的球体
  const coreGradient = ctx.createRadialGradient(
    star.x, star.y, 0,
    star.x, star.y, star.size * 2
  )
  coreGradient.addColorStop(0, `rgba(${star.color}, 1)`)
  coreGradient.addColorStop(0.4, `rgba(${star.color}, 0.6)`)
  coreGradient.addColorStop(0.7, `rgba(${star.color}, 0.2)`)
  coreGradient.addColorStop(1, `rgba(${star.color}, 0)`)
  
  ctx.fillStyle = coreGradient
  ctx.beginPath()
  ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2)
  ctx.fill()
  
  // 绘制最亮的核心点
  ctx.fillStyle = `rgba(${star.color}, 1)`
  ctx.beginPath()
  ctx.arc(star.x, star.y, star.size * 0.6, 0, Math.PI * 2)
  ctx.fill()
  
  ctx.restore()
}

const animate = () => {
  if (!ctx || !canvas.value) return
  
  ctx.clearRect(0, 0, width, height)
  
  stars.value.forEach(star => {
    updateStar(star)
    drawStar(star)
  })
  
  animationId = requestAnimationFrame(animate)
}

const handleResize = () => {
  if (!canvas.value) return
  width = window.innerWidth
  height = window.innerHeight
  canvas.value.width = width
  canvas.value.height = height
  initStars()
}

const refreshStarColors = () => {
  stars.value.forEach(star => {
    star.color = getRandomColor()
  })
}

watch(
  () => themeColors.value,
  () => {
    refreshStarColors()
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
  
  initStars()
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
  <div class="star-field">
    <canvas ref="canvas" class="star-canvas" />
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

.star-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
