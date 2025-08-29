/**
 * 根据颜色值计算黑色或白色文本
 * @param color 支持格式: #RGB, #RGBA, #RRGGBB, #RRGGBBAA, rgb(), rgba(), hsl(), hsla()
 * @returns 'black' | 'white'
 */
export function getContrastColor(color: string): string {
    // 如果没有颜色值，则返回默认黑色
    if (!color) {
        return 'rgba(0, 0, 0, 1)';
    }
    // 解析颜色为 RGBA 数组 [r, g, b, a]
    const rgba = parseColor(color);

    // 混合背景色（假设白色背景）
    const r = mixWithBackground(rgba[0], rgba[3]);
    const g = mixWithBackground(rgba[1], rgba[3]);
    const b = mixWithBackground(rgba[2], rgba[3]);

    // 计算相对亮度
    const luminance = calculateLuminance(r, g, b);

    // WCAG 对比度阈值 (0.179 是理论计算值)
    return luminance < 0.179 ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)';
}

// 颜色混合函数（假设白色背景）
function mixWithBackground(colorValue: number, alpha: number): number {
    return Math.round(colorValue * alpha + 255 * (1 - alpha));
}

// 计算相对亮度（WCAG 标准）
function calculateLuminance(r: number, g: number, b: number): number {
    const [rSRGB, gSRGB, bSRGB] = [r, g, b].map(c => c / 255);

    const toLinear = (c: number) =>
        c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

    return 0.2126 * toLinear(rSRGB) +
        0.7152 * toLinear(gSRGB) +
        0.0722 * toLinear(bSRGB);
}

// 颜色解析器（支持多种格式）
function parseColor(color: string): [number, number, number, number] {
    color = color.trim().toLowerCase();

    // 处理十六进制格式
    if (color.startsWith('#')) {
        return parseHex(color);
    }

    // 处理函数式格式（rgb/rgba/hsl/hsla）
    if (color.includes('(')) {
        return parseFunction(color);
    }

    throw new Error(`Invalid color format: ${color}`);
}

// 解析十六进制颜色
function parseHex(hex: string): [number, number, number, number] {
    hex = hex.slice(1);

    // 扩展缩写格式 #RGB => #RRGGBB, #RGBA => #RRGGBBAA
    if ([3, 4].includes(hex.length)) {
        hex = hex.split('').map(c => c + c).join('');
    }

    // 验证长度
    if (![6, 8].includes(hex.length)) {
        throw new Error(`Invalid hex color length: ${hex}`);
    }

    // 解析颜色值
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const a = hex.length === 8 ?
        parseInt(hex.substring(6, 8), 16) / 255 : 1;

    return [r, g, b, a];
}

// 解析函数式颜色
function parseFunction(color: string): [number, number, number, number] {
    const match = color.match(
        /(rgba?|hsla?)\(([^)]+)\)/
    );

    if (!match) throw new Error(`Invalid function format: ${color}`);

    const [_, type, values] = match;
    const parts = values.split(',')
        .map(v => parseFloat(v.trim().replace('%', '')));

    // 处理透明度
    let alpha = 1;
    if (parts.length === 4 || (parts.length === 2 && type === 'hsla')) {
        alpha = parts.pop()!;
    }

    // 处理百分比值
    const normalized = parts.map((v, i) =>
        (values.includes('%') && i < 3) ? v * 2.55 : v
    );

    if (type.startsWith('rgb')) {
        return [...normalized.slice(0, 3) as [number, number, number], alpha];
    }

    return [...hslToRgb(...normalized as [number, number, number]), alpha];
}

// HSL 转 RGB
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    h /= 360;
    s /= 100;
    l /= 100;

    if (s === 0) {
        const val = Math.round(l * 255);
        return [val, val, val];
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    const hueToRgb = (t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };

    return [
        Math.round(hueToRgb(h + 1 / 3) * 255),
        Math.round(hueToRgb(h) * 255),
        Math.round(hueToRgb(h - 1 / 3) * 255)
    ];
}