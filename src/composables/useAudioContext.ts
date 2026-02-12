/**
 * useAudioContext.ts
 * Web Audio 合成滴答声、17kHz高频脉冲、锁定音效等
 *
 * 遵循原则：所有音效使用22kHz/8bit低保真模拟，极小体积
 * 采用懒加载，仅在用户手势后激活
 */

import {onUnmounted, ref} from 'vue'

export interface AudioPreset {
    /** 频率(Hz) */
    frequency: number
    /** 波形类型 */
    type: OscillatorType
    /** 持续时间(秒) */
    duration: number
    /** 音量 0-1 */
    volume?: number
    /** 是否循环 */
    loop?: boolean
    /** 额外处理函数 */
    onEnd?: () => void
}

export function useAudioContext() {
    // 核心音频上下文
    const audioContext = ref<AudioContext | null>(null)
    const isReady = ref(false) // 是否已激活（用户手势）
    const activeOscillators = ref<Set<OscillatorNode>>(new Set())
    const activeGains = ref<Set<GainNode>>(new Set())

    // 初始化上下文（不启动，需等待用户手势）
    const initContext = () => {
        if (audioContext.value) return
        // @ts-ignore - 兼容webkit
        const AudioCtor = window.AudioContext || window.webkitAudioContext
        audioContext.value = new AudioCtor({
            latencyHint: 'interactive',
            sampleRate: 22050 // 22kHz低保真
        })
    }

    // 激活上下文（需在用户手势中调用）
    const activate = async () => {
        if (!audioContext.value) initContext()
        if (audioContext.value?.state === 'suspended') {
            await audioContext.value.resume()
        }
        isReady.value = true
    }

    // 合成单个音效
    const playTone = (preset: AudioPreset): { stop: () => void } => {
        if (!audioContext.value || audioContext.value.state !== 'running') {
            console.warn('AudioContext not activated yet')
            return {
                stop: () => {
                }
            }
        }

        const ctx = audioContext.value!
        const now = ctx.currentTime

        // 主振荡器
        const osc = ctx.createOscillator()
        osc.type = preset.type
        osc.frequency.value = preset.frequency

        // 增益节点（音量控制）
        const gain = ctx.createGain()
        gain.gain.value = preset.volume ?? 0.1

        // 添加谐波失真，模拟低保真
        const shaper = ctx.createWaveShaper()
        const makeDistortion = (amount = 20) => {
            const k = amount
            const nSamples = 44100
            const curve = new Float32Array(nSamples)
            const deg = Math.PI / 180
            for (let i = 0; i < nSamples; ++i) {
                const x = (i * 2) / nSamples - 1
                curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x))
            }
            return curve
        }
        shaper.curve = makeDistortion(10)

        // 连接
        osc.connect(shaper)
        shaper.connect(gain)
        gain.connect(ctx.destination)

        // 记录以便清理
        activeOscillators.value.add(osc)
        activeGains.value.add(gain)

        // 启动
        osc.start(now)
        if (!preset.loop) {
            osc.stop(now + preset.duration)
        }

        // 停止后清理
        osc.onended = () => {
            activeOscillators.value.delete(osc)
            activeGains.value.delete(gain)
            preset.onEnd?.()
        }

        return {
            stop: () => {
                try {
                    osc.stop()
                    osc.disconnect()
                    gain.disconnect()
                } catch (e) {
                    // ignore
                }
            }
        }
    }

    // 预设：17kHz 高频脉冲（底噪）
    const playPulse17k = (loop = true) => {
        return playTone({
            frequency: 17000,
            type: 'sine',
            duration: 0.05,
            volume: 0.01, // 极轻
            loop
        })
    }

    // 预设：天文钟滴答声（低频机械声）
    const playTick = () => {
        return playTone({
            frequency: 800,
            type: 'square',
            duration: 0.02,
            volume: 0.02
        })
    }

    // 预设：锁定/点击音效
    const playLock = () => {
        return playTone({
            frequency: 1200,
            type: 'sine',
            duration: 0.03,
            volume: 0.05
        })
    }

    // 预设：信号抖动噪音
    const playJitter = () => {
        return playTone({
            frequency: 400,
            type: 'sawtooth',
            duration: 0.1,
            volume: 0.015
        })
    }

    // 预设：女声觉醒（实际会预加载音频文件，此处仅占位）
    const playReveal = (audioUrl: string) => {
        if (!audioContext.value) return {
            stop: () => {
            }
        }
        // 使用 HTMLAudioElement 或 AudioBufferSourceNode
        // 简单实现：创建 AudioBufferSource
        // 实际项目中应预加载并解码
        console.warn('playReveal: implement with fetched audio buffer')
        return {
            stop: () => {
            }
        }
    }

    // 停止所有声音
    const stopAll = () => {
        activeOscillators.value.forEach(osc => {
            try {
                osc.stop()
            } catch (e) {
            }
        })
        activeOscillators.value.clear()
        activeGains.value.clear()
    }

    // 页面卸载时关闭上下文
    onUnmounted(() => {
        if (audioContext.value) {
            audioContext.value.close()
        }
    })

    return {
        audioContext,
        isReady,
        initContext,
        activate,
        playTone,
        playPulse17k,
        playTick,
        playLock,
        playJitter,
        playReveal,
        stopAll
    }
}
