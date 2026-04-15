<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { themeColors } from '../../services/ThemeService.ts'
import { getColorRGBColorValue } from '../../utils/ColorUtil.ts'

/**
 * 星星接口定义
 */
interface Star {
  x: number // 星星的 X 坐标
  y: number // 星星的 Y 坐标
  size: number // 星星的大小（半径）
  baseAlpha: number // 星星的基础透明度
  alpha: number // 星星当前的透明度（动态变化）
  twinkleSpeed: number // 闪烁速度
  twinklePhase: number // 闪烁相位（用于正弦波计算）
  color: string // 星星颜色（RGB 格式）
}

/**
 * 流星接口定义
 */
interface Meteor {
  x: number // 流星头部的 X 坐标
  y: number // 流星头部的 Y 坐标
  length: number // 流星尾迹长度
  speed: number // 流星飞行速度
  angle: number // 流星飞行角度（弧度）
  opacity: number // 流星当前透明度
  dead: boolean // 流星是否已消亡
  width: number // 流星尾迹宽度
  vx: number // X 轴速度分量
  vy: number // Y 轴速度分量
  trail: Array<{ x: number; y: number; opacity: number }> // 轨迹点数组
  maxTrailLength: number // 最大轨迹长度
}

/**
 * 粒子接口定义（流星尾迹碎片）
 */
interface Particle {
  x: number // 粒子 X 坐标
  y: number // 粒子 Y 坐标
  vx: number // X 轴速度
  vy: number // Y 轴速度
  life: number // 粒子生命值（0-1）
  decay: number // 生命值衰减速度
  size: number // 粒子大小
  color: string // 粒子颜色
}

// Canvas 元素引用
const canvas = ref<HTMLCanvasElement | null>(null)
// Canvas 2D 渲染上下文
let ctx: CanvasRenderingContext2D | null = null
// 动画帧 ID（用于取消动画）
let animationId: number | null = null

// 画布尺寸
let width = 0
let height = 0

// 星空元素数组
let stars: Star[] = []
let meteors: Meteor[] = []
let particles: Particle[] = []
/**
 * 根据主题获取星星颜色
 * 从主题的 primary、text、secondary 等颜色中提取 RGB 值
 */
const getStarColors = () => {
  const colors = themeColors.value

  // 提取主题色的 RGB 值
  const primaryRGB = getColorRGBColorValue(colors.universal.primary)
  const textRGB = getColorRGBColorValue(colors.universal.text)
  const secondaryRGB = getColorRGBColorValue(colors.universal.textHint)

  return [
    primaryRGB || '255, 255, 255', // 主色调
    textRGB || '200, 220, 255', // 文字色
    secondaryRGB || '255, 240, 200', // 次要色
    '255, 255, 255', // 纯白色（备用）
  ]
}

/**
 * 获取随机星星颜色
 * 从主题颜色数组中随机选择一个 RGB 颜色值
 * @returns RGB 颜色字符串（不含 rgba 前缀）
 */
const getRandomColor = () => {
  const colors = getStarColors()
  return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * 创建一颗新星星
 * 随机初始化星星的位置、大小、透明度、闪烁速度等属性
 * @returns 星星对象
 */
const createStar = (): Star => {
  return {
    x: Math.random() * width, // 随机 X 位置
    y: Math.random() * height, // 随机 Y 位置
    size: Math.random() * 2 + 0.5, // 大小范围：0.5 - 2.5
    baseAlpha: Math.random() * 0.6 + 0.2, // 基础透明度范围：0.2 - 0.8
    alpha: 0, // 初始透明度为 0
    twinkleSpeed: Math.random() * 0.02 + 0.005, // 闪烁速度范围：0.005 - 0.025
    twinklePhase: Math.random() * Math.PI * 2, // 随机初始相位
    color: getRandomColor(), // 随机颜色
  }
}

/**
 * 创建一颗新流星
 * 初始化流星的位置、速度、角度、尾迹等属性
 * @returns 流星对象
 */
const createMeteor = (): Meteor => {
  const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.2 // 45度角 ± 随机偏移
  const speed = Math.random() * 2 + 2 // 范围：2 - 4

  // 随机选择起始位置：50% 从顶部出现，50% 从右侧出现
  const startFromTop = Math.random() > 0.5

  let startX: number
  let startY: number

  if (startFromTop) {
    // 从顶部出现：X 随机，Y 在屏幕上方外
    startX = Math.random() * width * 1.3 - width * 0.15 // X 范围：-15% 到 115%
    startY = -Math.random() * 100 - 50 // Y 范围：-50 到 -150（屏幕上方外）
  } else {
    // 从右侧出现：X 在屏幕右侧外，Y 随机
    startX = width + Math.random() * 100 + 50 // X 范围：width+50 到 width+150（屏幕右侧外）
    startY = Math.random() * height * 0.6 // Y 范围：0 到 60% 屏幕高度
  }

  return {
    x: startX,
    y: startY,
    length: Math.random() * 150 + 80, // 尾迹长度范围：80 - 230
    speed,
    angle,
    opacity: 1, // 初始完全不透明
    dead: false, // 初始状态为存活
    width: Math.random() * 2 + 1, // 尾迹宽度范围：1 - 3
    vx: -Math.cos(angle) * speed, // X 轴速度（向左下飞行）
    vy: Math.sin(angle) * speed, // Y 轴速度
    trail: [], // 空轨迹数组
    maxTrailLength: 20, // 最大保留 20 个轨迹点
  }
}

/**
 * 根据主题获取流星渐变色
 * @param opacity 流星当前透明度
 * @returns 包含四个色标的渐变配置
 */
const getMeteorGradientColors = (opacity: number) => {
  const colors = themeColors.value
  const primaryRGB = getColorRGBColorValue(colors.universal.text) || '255, 255, 255'
  const textRGB = getColorRGBColorValue(colors.universal.textHint) || '200, 220, 255'

  return [
    `rgba(${primaryRGB}, ${opacity})`, // 头部：主题主色
    `rgba(${textRGB}, ${opacity * 0.8})`, // 前段：主题文字色
    `rgba(${textRGB}, ${opacity * 0.4})`, // 中段：主题文字色（更淡）
    `rgba(${textRGB}, 0)`, // 末端：透明
  ]
}

/**
 * 更新星星状态
 * - 使用正弦波实现自然闪烁效果
 * - 星星缓慢向左移动，到达边界后重新生成
 * @param star 要更新的星星对象
 */
const updateStar = (star: Star) => {
  // 更新闪烁相位
  star.twinklePhase += star.twinkleSpeed
  // 基于正弦波计算当前透明度（在 baseAlpha ± 0.2 范围内波动）
  star.alpha = star.baseAlpha + Math.sin(star.twinklePhase) * 0.2
}

/**
 * 绘制星星
 * 使用径向渐变绘制星星的光晕效果和核心亮点
 * @param star 要绘制的星星对象
 */
const drawStar = (star: Star) => {
  if (!ctx) return

  ctx.save()
  // 设置透明度（限制在 0-1 范围内）
  ctx.globalAlpha = Math.max(0, Math.min(1, star.alpha))

  // 创建径向渐变（从中心向外扩散）
  const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 3)
  gradient.addColorStop(0, `rgba(${star.color}, 1)`) // 中心：完全不透明
  gradient.addColorStop(0.5, `rgba(${star.color}, 0.3)`) // 中间：30% 不透明
  gradient.addColorStop(1, `rgba(${star.color}, 0)`) // 边缘：完全透明

  // 绘制光晕
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2)
  ctx.fill()

  // 绘制星星核心（更亮的中心点）
  ctx.fillStyle = `rgba(${star.color}, 1)`
  ctx.beginPath()
  ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

/**
 * 更新流星状态
 * - 根据速度更新位置
 * - 记录轨迹点
 * - 逐渐降低透明度
 * - 随机产生尾迹粒子
 * @param meteor 要更新的流星对象
 */
const updateMeteor = (meteor: Meteor) => {
  // 更新位置
  meteor.x += meteor.vx
  meteor.y += meteor.vy

  // 记录当前点到轨迹数组
  meteor.trail.push({ x: meteor.x, y: meteor.y, opacity: meteor.opacity })
  // 如果轨迹过长，移除最早的点
  if (meteor.trail.length > meteor.maxTrailLength) {
    meteor.trail.shift()
  }

  // 逐渐降低透明度
  meteor.opacity -= 0.003 + meteor.speed * 0.0005

  // 判断是否应该消亡（透明度过低或完全飞出屏幕）
  // 扩大边界范围，确保从右侧出现的流星能完整划过屏幕
  const margin = Math.max(width, height) * 0.5 // 边界余量：屏幕最大尺寸的 50%
  if (
    meteor.opacity <= 0 ||
    meteor.x < -margin || // 左侧超出太多
    meteor.x > width + margin || // 右侧超出太多
    meteor.y < -margin || // 顶部超出太多
    meteor.y > height + margin // 底部超出太多
  ) {
    meteor.dead = true
  }
}

/**
 * 绘制流星
 * 绘制流星的渐变尾迹和头部光晕
 * @param meteor 要绘制的流星对象
 */
const drawMeteor = (meteor: Meteor) => {
  if (meteor.dead || !ctx) return

  ctx.save()

  // 计算尾迹终点坐标
  const tailX = meteor.x - meteor.vx * (meteor.length / meteor.speed)
  const tailY = meteor.y - meteor.vy * (meteor.length / meteor.speed)

  // 获取主题渐变色
  const gradientColors = getMeteorGradientColors(meteor.opacity)

  // 创建线性渐变（从头部到尾迹末端）
  const gradient = ctx.createLinearGradient(meteor.x, meteor.y, tailX, tailY)
  gradient.addColorStop(0, gradientColors[0]) // 头部：主题主色
  gradient.addColorStop(0.1, gradientColors[1]) // 前段：主题文字色
  gradient.addColorStop(0.5, gradientColors[2]) // 中段：主题文字色（更淡）
  gradient.addColorStop(1, gradientColors[3]) // 末端：透明

  // 绘制尾迹线
  ctx.strokeStyle = gradient
  ctx.lineWidth = meteor.width
  ctx.lineCap = 'round' // 圆角端点
  ctx.beginPath()
  ctx.moveTo(meteor.x, meteor.y)
  ctx.lineTo(tailX, tailY)
  ctx.stroke()

  // 绘制流星头部光晕
  const headGradient = ctx.createRadialGradient(meteor.x, meteor.y, 0, meteor.x, meteor.y, 8)
  headGradient.addColorStop(0, gradientColors[0]) // 中心：主题主色
  headGradient.addColorStop(0.5, gradientColors[1].replace(/[\d.]+\)$/, `${meteor.opacity * 0.5})`)) // 中间：主题文字色
  headGradient.addColorStop(1, gradientColors[3]) // 边缘：透明

  ctx.fillStyle = headGradient
  ctx.beginPath()
  ctx.arc(meteor.x, meteor.y, 8, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

/**
 * 更新粒子状态
 * - 根据速度更新位置
 * - 减少生命值
 * - 应用摩擦力（速度衰减）
 * @param particle 要更新的粒子对象
 */
const updateParticle = (particle: Particle) => {
  particle.x += particle.vx
  particle.y += particle.vy
  particle.life -= particle.decay // 生命值递减
  particle.vx *= 0.98 // X 轴摩擦力（2% 减速）
  particle.vy *= 0.98 // Y 轴摩擦力
}

/**
 * 绘制粒子
 * 根据粒子生命值和颜色绘制圆形粒子
 * @param particle 要绘制的粒子对象
 */
const drawParticle = (particle: Particle) => {
  if (particle.life <= 0 || !ctx) return
  ctx.save()
  ctx.globalAlpha = particle.life // 透明度等于生命值
  ctx.fillStyle = particle.color
  ctx.beginPath()
  ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

/**
 * 初始化星星数组
 * 根据屏幕面积计算合适的星星数量（每 4000 像素一个星星）
 */
const initStars = () => {
  const starCount = Math.floor((width * height) / 4000)
  stars = []
  for (let i = 0; i < starCount; i++) {
    stars.push(createStar())
  }
}

/**
 * 随机生成流星
 * 每帧有 2% 的概率生成一颗新流星
 */
const spawnMeteor = () => {
  if (Math.random() < 0.02) {
    meteors.push(createMeteor())
  }
}

/**
 * 主动画循环函数
 * 每一帧执行以下操作：
 * 1. 清除画布（使用半透明覆盖产生拖尾效果）
 * 2. 绘制渐变背景
 * 3. 更新和绘制所有星星
 * 4. 随机生成新流星
 * 5. 更新和绘制所有流星
 * 6. 更新和绘制所有粒子
 */
const animate = () => {
  if (!ctx || !canvas.value) return

  ctx.clearRect(0, 0, width, height)

  // 第三步：更新和绘制所有星星
  stars.forEach(star => {
    updateStar(star)
    drawStar(star)
  })

  // 第四步：尝试生成新流星
  spawnMeteor()

  // 第五步：更新和绘制流星，过滤掉已消亡的
  meteors = meteors.filter(meteor => {
    updateMeteor(meteor)
    drawMeteor(meteor)
    return !meteor.dead
  })

  // 第六步：更新和绘制粒子，过滤掉已消失的
  particles = particles.filter(particle => {
    updateParticle(particle)
    drawParticle(particle)
    return particle.life > 0
  })

  // 请求下一帧动画
  animationId = requestAnimationFrame(animate)
}

/**
 * 窗口大小改变处理函数
 * 更新画布尺寸并重新初始化星星
 */
const handleResize = () => {
  if (!canvas.value) return
  width = window.innerWidth
  height = window.innerHeight
  canvas.value.width = width
  canvas.value.height = height
  initStars()
}

/**
 * 重新初始化所有星星的颜色（主题变化时调用）
 */
const refreshStarColors = () => {
  stars.forEach(star => {
    star.color = getRandomColor()
  })
}

/**
 * 监听主题颜色变化，自动更新星星颜色
 */
watch(
  () => themeColors.value,
  () => {
    refreshStarColors()
  },
  { deep: true }
)

/**
 * 组件挂载时的初始化
 * - 获取 Canvas 上下文
 * - 设置画布尺寸
 * - 初始化星星
 * - 启动动画循环
 * - 注册窗口大小监听
 */
onMounted(() => {
  if (!canvas.value) return

  // 获取 2D 渲染上下文
  ctx = canvas.value.getContext('2d')
  if (!ctx) return

  // 初始化画布尺寸
  width = window.innerWidth
  height = window.innerHeight
  canvas.value.width = width
  canvas.value.height = height

  // 初始化星空
  initStars()
  // 启动动画
  animate()

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

/**
 * 组件卸载时的清理工作
 * - 取消动画帧
 * - 移除事件监听器
 */
onUnmounted(() => {
  // 停止动画循环
  if (animationId !== null) {
    cancelAnimationFrame(animationId)
  }
  // 移除窗口大小监听
  window.removeEventListener('resize', handleResize)
})

/**
 * 组件卸载时的清理工作
 * - 取消动画帧
 * - 移除事件监听器
 */
onUnmounted(() => {
  // 停止动画循环
  if (animationId !== null) {
    cancelAnimationFrame(animationId)
  }
  // 移除窗口大小监听
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <!-- 星空背景容器 -->
  <div class="star-field">
    <!-- Canvas 画布元素 -->
    <canvas ref="canvas" class="star-canvas" />
  </div>
</template>

<style scoped>
/* 星空背景容器样式 */
.star-field {
  position: fixed; /* 固定定位，覆盖整个视口 */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* 不阻挡鼠标事件穿透 */
  z-index: 0; /* 置于最底层 */
  overflow: hidden; /* 隐藏溢出内容 */
}

/* Canvas 画布样式 */
.star-canvas {
  display: block; /* 消除 inline 元素的默认间距 */
  width: 100%;
  height: 100%;
}
</style>
