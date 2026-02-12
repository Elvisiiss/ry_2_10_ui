<template>
  <div
      ref="eggRef"
      class="easter-egg"
      @mousedown="startPress"
      @touchstart="startPress"
      @mouseup="cancelPress"
      @touchend="cancelPress"
      @mouseleave="cancelPress"
  >
    <!-- 天文钟 SVG，作为彩蛋触发区域 -->
    <HandDrawnSVG name="astronomical-clock" class="clock-svg" :enable-filter="true">
      <svg viewBox="0 0 100 100" class="clock-face">
        <!-- 表盘 -->
        <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-paper)" stroke-width="1" stroke-dasharray="3 2"/>
        <!-- 刻度 -->
        <line v-for="i in 12" :key="i" :x1="50" :y1="10" :x2="50" :y2="15" stroke="var(--color-paper)"
              stroke-width="0.8" :transform="`rotate(${i * 30}, 50, 50)`"/>
        <!-- 指针（缓慢逆向旋转） -->
        <line class="hour-hand" x1="50" y1="50" x2="50" y2="25" stroke="var(--color-pulse)" stroke-width="1.5"
              stroke-linecap="round" :transform="`rotate(${hourAngle}, 50, 50)`"/>
        <line class="minute-hand" x1="50" y1="50" x2="50" y2="15" stroke="var(--color-paper)" stroke-width="1"
              stroke-linecap="round" :transform="`rotate(${minuteAngle}, 50, 50)`"/>
      </svg>
    </HandDrawnSVG>

    <!-- 隐藏代码提示，长按后显示 -->
    <transition name="fade">
      <div v-if="codeVisible" class="secret-code">
        <code>&gt; resolve states via physical interference...</code>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import {onMounted, onUnmounted, ref} from 'vue'
import HandDrawnSVG from '@/components/core/HandDrawnSVG.vue'
import {useSignalStore} from '@/stores/signal'
import {useAudioContext} from '@/composables/useAudioContext'

const LONG_PRESS_DURATION = 3000 // 3秒

const eggRef = ref<HTMLElement | null>(null)
const codeVisible = ref(false)
let pressTimer: NodeJS.Timeout | null = null

const signalStore = useSignalStore()
const {playTick} = useAudioContext()

// 指针角度（缓慢逆向旋转）
const hourAngle = ref(180)
const minuteAngle = ref(210)

// 启动长按定时器
const startPress = () => {
  if (codeVisible.value || signalStore.easterEggTriggered) return
  pressTimer = setTimeout(() => {
    codeVisible.value = true
    signalStore.triggerEasterEgg()
    // 播放特殊音效（可选）
    playTick?.()
    // 5秒后自动隐藏
    setTimeout(() => {
      codeVisible.value = false
    }, 5000)
  }, LONG_PRESS_DURATION)
}

const cancelPress = () => {
  if (pressTimer) {
    clearTimeout(pressTimer)
    pressTimer = null
  }
}

// 模拟天文钟指针逆向缓慢旋转
let interval: NodeJS.Timeout
onMounted(() => {
  interval = setInterval(() => {
    hourAngle.value = (hourAngle.value - 0.1) % 360
    minuteAngle.value = (minuteAngle.value - 0.6) % 360
  }, 100)
})

onUnmounted(() => {
  cancelPress()
  clearInterval(interval)
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.easter-egg {
  position: fixed;
  bottom: $spacing-6;
  right: $spacing-6;
  width: 60px;
  height: 60px;
  cursor: pointer;
  z-index: $z-index-max;
  opacity: 0.6;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }

  .clock-svg {
    width: 100%;
    height: 100%;
  }

  .secret-code {
    position: absolute;
    bottom: 70px;
    right: 0;
    background: rgba($color-void, 0.9);
    border: 1px solid $color-pulse;
    padding: $spacing-3 $spacing-4;
    white-space: nowrap;
    font-family: $font-mono;
    font-size: $font-size-sm;
    color: $color-signal;
    box-shadow: 0 0 20px rgba($color-pulse, 0.2);
    pointer-events: none;

    @media (max-width: $breakpoint-sm) {
      white-space: normal;
      right: 0;
      left: auto;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
