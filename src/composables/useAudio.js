import {ref} from 'vue';

export function useAudio() {
    // 音频上下文（延迟初始化）
    const audioContext = ref(null);
    const isReady = ref(false);

    // 音效文件路径
    const SOUNDS = {
        pulse: '/audio/17khz-pulse.mp3',
        connect: '/audio/connect-relay.wav',
        select: '/audio/option-select.wav',
        awaken: '/audio/lux-awaken.mp3',
        easter: '/audio/hdd-seek.wav'
    };

    // 初始化音频上下文（必须由用户手势触发）
    const initAudio = () => {
        if (audioContext.value) return;
        audioContext.value = new (window.AudioContext || window.webkitAudioContext)();
        isReady.value = true;
    };

    // 播放一次音效
    const playSound = async (type, volume = 0.5) => {
        if (!audioContext.value) {
            initAudio();
            // 等待上下文激活
            if (audioContext.value.state === 'suspended') {
                await audioContext.value.resume();
            }
        }

        const url = SOUNDS[type];
        if (!url) return;

        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContext.value.decodeAudioData(arrayBuffer);

            const source = audioContext.value.createBufferSource();
            source.buffer = audioBuffer;

            const gainNode = audioContext.value.createGain();
            gainNode.gain.value = volume;

            source.connect(gainNode);
            gainNode.connect(audioContext.value.destination);

            source.start();
        } catch (e) {
            console.warn('音频播放失败:', e);
        }
    };

    // 创建持续脉冲（17kHz 正弦波）
    const createPulse = (frequency = 17000) => {
        if (!audioContext.value) initAudio();
        const ctx = audioContext.value;

        const oscillator = ctx.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.01, ctx.currentTime); // 极低音量

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start();

        // 返回控制对象
        return {
            stop: () => oscillator.stop(),
            setVolume: (vol) => {
                gainNode.gain.setValueAtTime(vol, ctx.currentTime);
            }
        };
    };

    return {
        initAudio,
        playSound,
        createPulse,
        isReady
    };
}
