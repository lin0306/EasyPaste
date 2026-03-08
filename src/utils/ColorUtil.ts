/**
 * 计算按钮颜色
 * @param backgroundColor 按钮背景色
 */
export function calculateButtonColors(bgColor: string): ButtonColor {
  // 解析 RGBA 颜色值
  const parseRgba = (color: string): RGBA => {
    // 如果没有颜色值，则返回默认黑色
    if (!color) {
      return { r: 0, g: 0, b: 0, a: 1 }
    }
    // 解析颜色为 RGBA 对象
    return parseColor(color)
  }

  // 计算相对亮度（基于 WCAG 标准）
  const getBrightness = ({ r, g, b }: RGB) => {
    return parseInt(String((r * 299 + g * 587 + b * 114) / 1000))
  }

  // 调整颜色亮度
  const adjustBrightness = ({ r, g, b, a }: RGBA, factor: number) => {
    const clamp = (value: any) => parseInt(String(Math.min(255, Math.max(0, value))))
    const rgba = {
      r: clamp(r * factor),
      g: clamp(g * factor),
      b: clamp(b * factor),
      a,
    }
    return rgbaToString(rgba)
  }

  // 转换为灰度颜色
  const toGrayscale = ({ r, g, b, a }: RGBA) => {
    const gray = parseInt(String(Math.round((r + g + b) / 3)))
    const rgba = {
      r: gray,
      g: gray,
      b: gray,
      a: a * 0.5,
    }
    return rgbaToString(rgba)
  }

  // 主逻辑
  const bg = parseRgba(bgColor)
  const brightness = getBrightness(bg)

  // 正常状态文字颜色
  const textColor = brightness > 128 ? 'rgba(0, 0, 0, 0.87)' : 'rgba(255, 255, 255, 0.87)'

  // 悬浮状态背景色（增加亮度）
  const hoverBgColor = adjustBrightness(bg, 1.2)

  // 悬浮状态文字颜色（与正常状态相同）
  const hoverTextColor = textColor

  // 禁用状态背景色（降低饱和度和亮度）
  const disabledBgColor = adjustBrightness(bg, 0.7)

  // 禁用状态文字颜色（低透明度灰色）
  const disabledTextColor = toGrayscale(bg)

  return {
    bgColor,
    hoverBgColor,
    disabledBgColor,
    textColor,
    hoverTextColor,
    disabledTextColor,
  }
}

/**
 * 设置颜色透明度
 * @param color 颜色
 * @param transparency 透明度
 */
export function setTransparency(color: string, transparency?: number): string {
  if (!color) {
    return color
  }

  const rgba = parseColor(color)

  if (transparency) {
    rgba.a = transparency
  } else {
    rgba.a = rgba.a / 2
  }
  return rgbaToString(rgba)
}

/**
 * 根据颜色值计算黑色或白色文本，支持格式: #RGB, #RGBA, #RRGGBB, #RRGGBBAA, rgb(), rgba(), hsl(), hsla()
 * @param color 颜色值
 * @returns 'black' | 'white'
 */
export function getContrastColor(color: string): string {
  // 如果没有颜色值，则返回默认黑色
  if (!color) {
    return 'rgba(0, 0, 0, 1)'
  }
  // 解析颜色为 RGBA 数组 [r, g, b, a]
  const rgba = parseColor(color)

  // 混合背景色（假设白色背景）
  const r = mixWithBackground(rgba.r, rgba.a)
  const g = mixWithBackground(rgba.g, rgba.a)
  const b = mixWithBackground(rgba.b, rgba.a)

  // 计算相对亮度
  const luminance = calculateLuminance({ r, g, b })

  // WCAG 对比度阈值 (0.179 是理论计算值)
  return luminance < 0.179 ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)'
}

/**
 * 颜色混合函数（假设白色背景）
 * @param colorValue 颜色值
 * @param alpha 透明度
 */
function mixWithBackground(colorValue: number, alpha: number): number {
  return Math.round(colorValue * alpha + 255 * (1 - alpha))
}

/**
 * 计算相对亮度（WCAG 标准）
 * @param rgb RGB 对象
 */
function calculateLuminance(rgb: RGB): number {
  const [rSRGB, gSRGB, bSRGB] = [rgb.r, rgb.g, rgb.b].map(c => c / 255)

  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))

  return 0.2126 * toLinear(rSRGB) + 0.7152 * toLinear(gSRGB) + 0.0722 * toLinear(bSRGB)
}

/**
 * 颜色解析器（支持多种格式）
 * @param color 颜色值
 */
function parseColor(color: string): RGBA {
  color = color.trim().toLowerCase()

  // 处理十六进制格式
  if (color.startsWith('#')) {
    return parseHex(color)
  }

  // 处理函数式格式（rgb/rgba/hsl/hsla）
  if (color.includes('(')) {
    return parseFunction(color)
  }

  throw new Error(`Invalid color format: ${color}`)
}

/**
 * 解析十六进制颜色
 * @param hex 颜色值
 */
function parseHex(hex: string): RGBA {
  hex = hex.slice(1)

  // 扩展缩写格式 #RGB => #RRGGBB, #RGBA => #RRGGBBAA
  if ([3, 4].includes(hex.length)) {
    hex = hex
      .split('')
      .map(c => c + c)
      .join('')
  }

  // 验证长度
  if (![6, 8].includes(hex.length)) {
    throw new Error(`Invalid hex color length: ${hex}`)
  }

  // 解析颜色值
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  const a = hex.length === 8 ? parseInt(hex.substring(6, 8), 16) / 255 : 1

  return { r, g, b, a }
}

/**
 * 解析函数式颜色
 * @param color 颜色值
 */
function parseFunction(color: string): RGBA {
  const match = color.match(/(rgba?|hsla?)\(([^)]+)\)/)

  if (!match) throw new Error(`Invalid function format: ${color}`)

  const [_, type, values] = match
  const parts = values.split(',').map(v => parseFloat(v.trim().replace('%', '')))

  // 处理透明度
  let alpha = 1
  if (parts.length === 4 || (parts.length === 2 && type === 'hsla')) {
    alpha = parts.pop()!
  }

  // 处理百分比值
  const normalized = parts.map((v, i) => (values.includes('%') && i < 3 ? v * 2.55 : v))

  if (type.startsWith('rgb')) {
    const numbers = normalized.slice(0, 3)
    return { r: numbers[0], g: numbers[1], b: numbers[2], a: alpha }
  }

  const toRgb = hslToRgb({ h: parts[0], s: parts[1], l: parts[2] })
  return { ...toRgb, a: alpha }
}

/**
 * HSL 转 RGB
 * @param hsl hsl颜色值
 */
function hslToRgb(hsl: HSL): RGB {
  hsl.h = hsl.h /= 360
  hsl.s = hsl.s /= 100
  hsl.l = hsl.l /= 100

  if (hsl.s === 0) {
    const val = Math.round(hsl.l * 255)
    return { r: val, g: val, b: val }
  }

  const q = hsl.l < 0.5 ? hsl.l * (1 + hsl.s) : hsl.l + hsl.s - hsl.l * hsl.s
  const p = 2 * hsl.l - q

  const hueToRgb = (t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  return {
    r: Math.round(hueToRgb(hsl.h + 1 / 3) * 255),
    g: Math.round(hueToRgb(hsl.h) * 255),
    b: Math.round(hueToRgb(hsl.h - 1 / 3) * 255),
  }
}

/**
 * rgba 转字符串
 * @param rgba rgba
 */
function rgbaToString(rgba: RGBA): string {
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`
}
