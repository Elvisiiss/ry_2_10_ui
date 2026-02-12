import {onUnmounted, ref} from 'vue';
import {useAudio} from './useAudio';

export function usePulse() {
    const {createPulse} = useAudio();
    const pulseInstance = ref(null);
    const isPlaying = ref(false);

    const startPulse = () => {
        if (pulseInstance.value) return;
        pulseInstance.value = createPulse(17000);
        isPlaying.value = true;
    };

    const stopPulse = () => {
        if (pulseInstance.value) {
            pulseInstance.value.stop();
            pulseInstance.value = null;
            isPlaying.value = false;
        }
    };

    const setVolume = (vol) => {
        if (pulseInstance.value) {
            pulseInstance.value.setVolume(vol);
        }
    };

    // 自动清理
    onUnmounted(() => {
        stopPulse();
    });

    return {
        startPulse,
        stopPulse,
        setVolume,
        isPlaying
    };
}
