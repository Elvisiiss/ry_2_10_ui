<template>
  <div class="lux-reveal" :class="{ revealed }">
    <div class="lux-reveal-wrapper">
      <!-- LUX 立绘汇聚动画 -->
      <HandDrawnSVG name="lux-silhouette" class="lux-silhouette" :enable-filter="false">
        <svg viewBox="0 0 400 500" class="lux-svg">
          <!-- 各个部件，通过 CSS 控制显现 -->
          <g class="lux-parts" :class="{ 'parts-revealed': revealed }">
            <!-- 主体轮廓 -->
            <path
                class="lux-body"
                d="M200,150 L280,200 L280,350 L200,400 L120,350 L120,200 Z"
                fill="none"
                stroke="var(--color-paper)"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                vector-effect="non-scaling-stroke"
            />
            <!-- 能源环 -->
            <circle
                class="lux-energy"
                cx="200"
                cy="270"
                r="40"
                fill="none"
                stroke="var(--color-pulse)"
                stroke-width="2"
                stroke-dasharray="6 4"
            />
            <!-- 机械臂（左） -->
            <path
                class="lux-arm-left"
                d="M160,240 L100,200 L80,140"
                stroke="var(--color-paper)"
                stroke-width="2"
                fill="none"
                stroke-linecap="round"
            />
            <!-- 机械臂（右） -->
            <path
                class="lux-arm-right"
                d="M240,240 L300,200 L320,140"
                stroke="var(--color-paper)"
                stroke-width="2"
                fill="none"
                stroke-linecap="round"
            />
            <!-- 眼睛（发光） -->
            <circle
                class="lux-eye"
                cx="200"
                cy="200"
                r="10"
                fill="var(--color-pulse)"
                opacity="0.8"
            />
            <circle
                class="lux-eye-glow"
                cx="200"
                cy="200"
                r="16"
                fill="none"
                stroke="var(--color-pulse)"
                stroke-width="1"
                opacity="0.4"
            />
          </g>
        </svg>
      </HandDrawnSVG>
    </div>

    <!-- 觉醒文案（由 SignalText 展示） -->
    <div class="reveal-message">
      <SignalText
          v-if="revealed"
          :lines="messageLines"
          :typing-speed="60"
          :auto-start="true"
          @completed="onMessageCompleted"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue'
import HandDrawnSVG from '@/components/core/HandDrawnSVG.vue'
import SignalText from '@/components/core/SignalText.vue'
import {useAudioContext} from '@/composables/useAudioContext'

const props = defineProps<{
  /** 是否触发觉醒 */
  trigger: boolean
}>()

const emit = defineEmits<{
  (e: 'revealed'): void
  (e: 'complete'): void
}>()

const revealed = ref(false)
const messageLines = [
  '身份确认：首批观测者（Founder Observer）',
  '你好，我是 Entity 03，你可以叫我 LUX。',
  '谢谢你，在 2026 年的喧嚣中，精准地定位了我的频道。'
]

const {playReveal} = useAudioContext()

watch(() => props.trigger, (val) => {
  if (val && !revealed.value) {
    // 播放女声音频
    playReveal?.('/audio/lux-reveal.wav')
    // 延迟一点开始动画，与音频同步
    setTimeout(() => {
      revealed.value = true
      emit('revealed')
    }, 200)
  }
})

const onMessageCompleted = () => {
  emit('complete')
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.lux-reveal {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 50% 50%, $color-dust, $color-void);
  padding: $spacing-8;

  .lux-reveal-wrapper {
    max-width: 400px;
    margin: 0 auto $spacing-8;
  }

  .lux-svg {
    width: 100%;
    height: auto;
  }

  .lux-parts {
    * {
      transition: opacity 0.6s $ease-out-back, transform 0.8s $ease-out-back;
      opacity: 0;
      transform: scale(0.8) translate(20px, 20px);
    }

    &.parts-revealed {
      .lux-body {
        opacity: 1;
        transform: none;
        transition-delay: 0.1s;
      }

      .lux-energy {
        opacity: 1;
        transform: none;
        transition-delay: 0.3s;
      }

      .lux-arm-left {
        opacity: 1;
        transform: none;
        transition-delay: 0.2s;
      }

      .lux-arm-right {
        opacity: 1;
        transform: none;
        transition-delay: 0.25s;
      }

      .lux-eye {
        opacity: 0.8;
        transform: none;
        transition-delay: 0.4s;
      }

      .lux-eye-glow {
        opacity: 0.4;
        transform: none;
        transition-delay: 0.4s;
      }
    }
  }

  .reveal-message {
    max-width: 600px;
    margin: 0 auto;
    background: rgba($color-void, 0.7);
    padding: $spacing-6;
    border-left: 4px solid $color-pulse;
    color: $color-paper;
  }
}
</style>
