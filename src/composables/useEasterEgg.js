import {ref} from 'vue';
import {useAudio} from './useAudio';

export function useEasterEgg() {
    const isPressed = ref(false);
    const pressTimer = ref(null);
    const triggered = ref(false);
    const {playSound} = useAudio();

    // 开始长按
    const startPress = () => {
        isPressed.value = true;
        pressTimer.value = setTimeout(() => {
            // 长按3秒触发
            triggered.value = true;
            playSound('easter', 0.3);

            // 8秒后自动清除触发状态
            setTimeout(() => {
                triggered.value = false;
            }, 8000);
        }, 3000);
    };

    // 取消长按
    const cancelPress = () => {
        isPressed.value = false;
        if (pressTimer.value) {
            clearTimeout(pressTimer.value);
            pressTimer.value = null;
        }
    };

    return {
        isPressed,
        triggered,
        startPress,
        cancelPress
    };
}
