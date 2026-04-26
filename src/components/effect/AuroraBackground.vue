<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { themeColors } from '../../services/ThemeService.ts'
import { getColorRGBColorValue } from '../../utils/ColorUtil.ts'

const canvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let animationId: number | null = null
let width = 0
let height = 0
let time = 0

// 根据主题获取极光颜色
const getAuroraColors = () => {
  const colors = themeColors.value

  const primaryRGB = getColorRGBColorValue(colors.universal.primary) || '100, 255, 200'
  const secondaryRGB = getColorRGBColorValue(colors.universal.secondary) || '150, 200, 255'
  const accentRGB = getColorRGBColorValue(colors.universal.textHint) || '200, 150, 255'

  return [
    { r: parseInt(primaryRGB.split(',')[0]), g: parseInt(primaryRGB.split(',')[1]), b: parseInt(primaryRGB.split(',')[2]) },
    { r: parseInt(secondaryRGB.split(',')[0]), g: parseInt(secondaryRGB.split(',')[1]), b: parseInt(secondaryRGB.split(',')[2]) },
    { r: parseInt(accentRGB.split(',')[0]), g: parseInt(accentRGB.split(',')[1]), b: parseInt(accentRGB.split(',')[2]) },
  ]
}

const drawAurora = (t: number) => {
  if (!ctx) return

  const colors = getAuroraColors()
  
  // 使用 additive 混合模式创造发光效果
  ctx.globalCompositeOperation = 'lighter'
  
  // 绘制多层极光 - 更大范围、更柔和
  for (let layer = 0; layer < 3; layer++) {
    ctx.save()
    
    // 三层分布：上部、中部、下部，覆盖全屏
    const baseY = height * (0.25 + layer * 0.22)
    const layerOffset = layer * 2000
    
    const color = colors[layer]
    // 每层不同的透明度，上层最亮
    const opacity = [0.15, 0.12, 0.10][layer]
    
    // 创建大范围垂直渐变
    const gradient = ctx.createLinearGradient(0, baseY - 250, 0, baseY + 250)
    gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`)
    gradient.addColorStop(0.3, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`)
    gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 1.2})`)
    gradient.addColorStop(0.7, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`)
    gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`)
    
    ctx.fillStyle = gradient
    
    // 应用较强的模糊，创造柔和光效
    ctx.filter = 'blur(30px)'
    
    // 绘制宽广的极光带
    ctx.beginPath()
    ctx.moveTo(0, height)
    
    const segments = 100
    const segmentWidth = width / segments
    const points: { x: number; y: number }[] = []
    
    for (let i = 0; i <= segments; i++) {
      const x = i * segmentWidth
      
      // 使用低频大幅波动，创造舒缓的曲线
      const wave1 = Math.sin((x + layerOffset) * 0.0015 + t * 0.25) * 100
      const wave2 = Math.sin((x + layerOffset) * 0.003 + t * 0.35) * 50
      const wave3 = Math.sin((x + layerOffset) * 0.0008 + t * 0.2) * 70
      
      const y = baseY + wave1 + wave2 + wave3
      points.push({ x, y })
    }
    
    // 使用平滑曲线连接
    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2
      const yc = (points[i].y + points[i + 1].y) / 2
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc)
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y)
    
    ctx.lineTo(width, height)
    ctx.closePath()
    ctx.fill()
    
    ctx.restore()
  }
  
  // 重置混合模式
  ctx.globalCompositeOperation = 'source-over'
}

const animate = () => {
  if (!ctx || !canvas.value) return

  ctx.clearRect(0, 0, width, height)

  time += 0.008 // 缓慢优雅的动画速度

  drawAurora(time)

  animationId = requestAnimationFrame(animate)
}

const handleResize = () => {
  if (!canvas.value) return
  width = window.innerWidth
  height = window.innerHeight
  canvas.value.width = width
  canvas.value.height = height
}

watch(
  () => themeColors.value,
  () => {
    // 颜色会在每次绘制时自动更新
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
  <div class="aurora-background">
    <canvas ref="canvas" class="aurora-canvas" />
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

.aurora-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
