/**
 * 生成手绘风格的抖动路径
 * 用于SVG路径的贝塞尔扰动，模拟手绘不完美感
 */

// 随机抖动范围 (±range)
export function jitterPoint(x, y, range = 0.5) {
    const dx = (Math.random() - 0.5) * range;
    const dy = (Math.random() - 0.5) * range;
    return [x + dx, y + dy];
}

// 生成带抖动的圆形路径（近似手绘圆）
export function generateJitterCircle(cx, cy, r, steps = 16, roughness = 0.8) {
    let path = '';
    for (let i = 0; i <= steps; i++) {
        const angle = (i / steps) * Math.PI * 2;
        let x = cx + Math.cos(angle) * r;
        let y = cy + Math.sin(angle) * r;
        [x, y] = jitterPoint(x, y, roughness);
        path += (i === 0 ? 'M' : 'L') + `${x},${y} `;
    }
    path += 'Z';
    return path;
}

// 对现有路径字符串应用全局抖动（简单实现：在每个指令后加点随机偏移）
// 此处可根据实际需要扩展，当前项目主要手动绘制SVG，该函数供未来动态生成使用
export function applyJitterToPath(pathString, roughness = 0.8) {
    // 这是一个占位函数，实际项目中可按需解析指令
    return pathString;
}

export default {
    jitterPoint,
    generateJitterCircle,
    applyJitterToPath
};
