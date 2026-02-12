/**
 * drawingUtils.ts
 * 手绘风格 SVG 路径生成器
 * 用于模拟不完美的铅笔/墨水笔触，增加手绘感
 */

/**
 * 为坐标添加随机抖动
 * @param value 原始坐标值
 * @param range 抖动范围（像素）
 * @returns 抖动后的值
 */
export const jitter = (value: number, range = 1.2): number => {
    return value + (Math.random() - 0.5) * range * 2
}

/**
 * 生成带手绘抖动的 SVG 路径字符串
 * @param points 点集 [[x1,y1], [x2,y2], ...]
 * @param jitterRange 每个控制点的抖动幅度
 * @param closePath 是否闭合路径
 * @returns SVG path d 属性
 */
export const handdrawnPath = (
    points: [number, number][],
    jitterRange = 1.5,
    closePath = false
): string => {
    if (points.length < 2) return ''

    let d = `M ${jitter(points[0][0], jitterRange)} ${jitter(points[0][1], jitterRange)}`

    for (let i = 1; i < points.length; i++) {
        d += ` L ${jitter(points[i][0], jitterRange)} ${jitter(points[i][1], jitterRange)}`
    }

    if (closePath) {
        d += ' Z'
    }

    return d
}

/**
 * 生成手绘风格的贝塞尔曲线路径
 * @param start [x,y]
 * @param cp1 控制点1 [x,y]
 * @param cp2 控制点2 [x,y]
 * @param end [x,y]
 * @param jitterRange 抖动范围
 * @returns SVG path d 属性
 */
export const handdrawnCubic = (
    start: [number, number],
    cp1: [number, number],
    cp2: [number, number],
    end: [number, number],
    jitterRange = 1.2
): string => {
    return `M ${jitter(start[0], jitterRange)} ${jitter(start[1], jitterRange)} C ${jitter(cp1[0], jitterRange)} ${jitter(cp1[1], jitterRange)}, ${jitter(cp2[0], jitterRange)} ${jitter(cp2[1], jitterRange)}, ${jitter(end[0], jitterRange)} ${jitter(end[1], jitterRange)}`
}

/**
 * 生成手绘风格圆形路径（圆弧近似）
 * @param cx 圆心x
 * @param cy 圆心y
 * @param r 半径
 * @param jitterRange 抖动范围
 * @returns SVG path d 属性
 */
export const handdrawnCircle = (
    cx: number,
    cy: number,
    r: number,
    jitterRange = 1.2
): string => {
    // 使用两条圆弧闭合形成圆，并对手绘起点/终点施加抖动
    return `M ${jitter(cx, jitterRange)} ${jitter(cy - r, jitterRange)} 
            A ${r} ${r} 0 1 1 ${jitter(cx - 0.1, jitterRange)} ${jitter(cy - r, jitterRange)} Z`
}

/**
 * 生成手绘虚线路径（通过断开的线段）
 * @param points 点集
 * @param dashLength 每段实线长度
 * @param gapLength 间隙长度
 * @param jitterRange 抖动范围
 * @returns SVG path d 属性数组（每条实线独立）
 */
export const handdrawnDashLine = (
    points: [number, number][],
    dashLength = 8,
    gapLength = 4,
    jitterRange = 1
): string[] => {
    if (points.length < 2) return []
    const paths: string[] = []
    for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i]
        const p2 = points[i + 1]
        const dx = p2[0] - p1[0]
        const dy = p2[1] - p1[1]
        const distance = Math.hypot(dx, dy)
        const segments = Math.floor(distance / (dashLength + gapLength))
        for (let s = 0; s < segments; s++) {
            const startT = s * (dashLength + gapLength) / distance
            const endT = (s * (dashLength + gapLength) + dashLength) / distance
            if (endT > 1) break
            const x1 = p1[0] + dx * startT
            const y1 = p1[1] + dy * startT
            const x2 = p1[0] + dx * endT
            const y2 = p1[1] + dy * endT
            paths.push(`M ${jitter(x1, jitterRange)} ${jitter(y1, jitterRange)} L ${jitter(x2, jitterRange)} ${jitter(y2, jitterRange)}`)
        }
    }
    return paths
}

/**
 * 生成随机噪点 SVG 字符串
 * @param count 噪点数量
 * @param bounds 边界 {width, height}
 * @param radiusRange 半径范围 [min, max]
 * @returns SVG circle 元素字符串（可用于 v-html）
 */
export const noisePoints = (
    count: number,
    bounds: { width: number; height: number },
    radiusRange: [number, number] = [0.5, 1.2]
): string => {
    let circles = ''
    for (let i = 0; i < count; i++) {
        const cx = Math.random() * bounds.width
        const cy = Math.random() * bounds.height
        const r = radiusRange[0] + Math.random() * (radiusRange[1] - radiusRange[0])
        circles += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="currentColor" opacity="${Math.random() * 0.3 + 0.1}" />`
    }
    return circles
}
