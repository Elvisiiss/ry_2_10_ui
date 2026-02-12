/**
 * usePulse.ts
 * 脉冲光周期控制 - 用于造父四变星光脉冲、LUX呼吸灯等周期性视觉元素
 *
 * 核心参数：周期 5.4s（造父四原型周期压缩），支持自定义周期与缓动曲线
 * 返回响应式脉冲强度值（0-1）及控制方法
 */

import {onMounted, onUnmounted, ref} from 'vue'

export interface PulseOptions {
    /** 脉冲周期，单位毫秒，默认5400ms（5.4s） */
    period?: number
    /** 初始相位，0-1之间，默认0 */
    phase?: number
    /** 脉冲波形函数，接收0-1返回0-1，默认使用ease-pulse曲线近似 */
    easing?: (t: number) => number
    /** 是否自动开始，默认true */
    autoStart?: boolean
}

// 默认缓动曲线 - 模拟 cubic-bezier(0.5, 1.8, 0.8, 0.8)
const defaultEasing = (t: number): number => {
    'worklet'
    // 使用三次函数近似过冲回弹
    if (t < 0.5) {
        return 4 * t * t * t // 0 -> 0.5
    } else {
        const x = t - 0.5
        return 0.5 + 3 * x - 6 * x * x + 4 * x * x * x // 0.5 -> 1 -> 0.5
    }
}

export function usePulse(options: PulseOptions = {}) {
    const {
        period = 5400,
        phase = 0,
        easing = defaultEasing,
        autoStart = true
    } = options

    const intensity = ref(0) // 0-1 脉冲强度
    const isActive = ref(autoStart)
    let rafId: number | null = null
    let startTime: number | null = null

    // 计算当前脉冲强度
    const updateIntensity = (timestamp: number) => {
        if (!isActive.value) return
        if (startTime === null) startTime = timestamp

        const elapsed = (timestamp - startTime) % period
        const t = elapsed / period // 0-1 周期相位
        // 叠加初始相位
        const phasedT = (t + phase) % 1
        intensity.value = easing(phasedT)

        rafId = requestAnimationFrame(updateIntensity)
    }

    const start = () => {
        if (isActive.value) return
        isActive.value = true
        startTime = null // 重置时间，使周期平滑开始
        rafId = requestAnimationFrame(updateIntensity)
    }

    const stop = () => {
        isActive.value = false
        if (rafId) {
            cancelAnimationFrame(rafId)
            rafId = null
        }
        startTime = null
    }

    // 手动设置强度（用于外部控制，如点击触发强脉冲）
    const setIntensity = (value: number) => {
        intensity.value = Math.max(0, Math.min(1, value))
    }

    // 重置相位
    const resetPhase = () => {
        startTime = null
    }

    onMounted(() => {
        if (autoStart) start()
    })

    onUnmounted(() => {
        stop()
    })

    return {
        /** 当前脉冲强度，0-1，可直接绑定到透明度/缩放/阴影 */
        intensity,
        /** 脉冲是否激活 */
        isActive,
        /** 启动脉冲 */
        start,
        /** 停止脉冲 */
        stop,
        /** 手动设定强度值 */
        setIntensity,
        /** 重置相位 */
        resetPhase
    }
}

// 预定义特定用途脉冲
export function useHeartbeatPulse() {
    return usePulse({
        period: 1200, // 1.2s 模拟心跳
        easing: (t) => 0.6 + 0.4 * Math.sin(t * Math.PI * 2) // 正弦波
    })
}

export function useLuxBreathPulse() {
    return usePulse({
        period: 3200, // 3.2s 缓慢呼吸
        easing: (t) => 0.3 + 0.7 * (Math.sin(t * Math.PI * 2) * 0.5 + 0.5)
    })
}
