<template>
  <div class="signal-pulse" :class="{ 'signal-locked': locked }">
    <HandDrawnSVG
        name="delta-cephei"
        class="pulse-star"
        :style="{
        opacity: pulseIntensity * 0.8 + 0.2,
        transform: `scale(${1 + pulseIntensity * 0.1})`
      }"
        :enable-filter="true"
        :animate-on-load="false"
    >
      <!-- 自定义芒刺效果，覆盖预设 -->
      <svg viewBox="0 0 120 120" class="star-svg">
        <defs>
          <radialGradient id="starGlowDynamic">
            <stop offset="0%" :stop-color="pulseColor" stop-opacity="0.9"/>
            <stop offset="70%" :stop-color="pulseColor" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="var(--color-void)" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="60" cy="60" r="18" :fill="pulseColor" :opacity="pulseIntensity * 0.6"/>
        <circle cx="60" cy="60" r="12" fill="url(#starGlowDynamic)" :opacity="pulseIntensity"/>
        <g class="rays">
          <line
              v-for="i in 12"
              :key="i"
              :x1="60"
              :y1="60"
              :x2="60 + Math.cos(i * 30 * Math.PI / 180) * 32"
              :y2="60 + Math.sin(i * 30 * Math.PI / 180) * 32"
              :stroke="pulseColor"
              stroke-width="0.8"
              :opacity="pulseIntensity * 0.3"
              stroke-linecap="round"
          />
        </g>
      </svg>
    </HandDrawnSVG>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import HandDrawnSVG from '@/components/core/HandDrawnSVG.vue'
import {usePulse} from '@/composables/usePulse'

const props = withDefaults(
    defineProps<{
      /** 脉冲周期（毫秒），默认5400（5.4s，造父四压缩周期） */
      period?: number
      /** 是否锁定信号（常亮） */
      locked?: boolean
      /** 心跳色，默认 --color-pulse */
      color?: string
    }>(),
    {
      period: 5400,
      locked: false,
      color: 'var(--color-pulse)'
    }
)

const {intensity} = usePulse({period: props.period, autoStart: !props.locked})
const pulseIntensity = computed(() => props.locked ? 1 : intensity.value)
const pulseColor = computed(() => props.color)
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.signal-pulse {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  .pulse-star {
    width: 120px;
    height: 120px;
    transition: opacity 0.2s, transform 0.2s;
  }

  &.signal-locked {
    .pulse-star {
      animation: none;
      @include pulse-glow($color-pulse, 3s);
    }
  }
}

.star-svg {
  width: 100%;
  height: 100%;
}
</style>
