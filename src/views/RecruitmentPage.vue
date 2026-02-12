<template>
  <div class="recruitment-page">
    <!-- 彩蛋齿轮（全局常驻） -->
    <div class="easter-egg"
         @mousedown="easter.startPress"
         @mouseup="easter.cancelPress"
         @mouseleave="easter.cancelPress"
         @touchstart="easter.startPress"
         @touchend="easter.cancelPress"
         @touchcancel="easter.cancelPress">
      <svg viewBox="0 0 100 100" class="cog">
        <!-- cog-easter.svg 内容精简 -->
        <path d="M50,12 C64,12 80,24 82,40 C84,56 72,76 54,82 C36,88 18,80 14,62 C10,44 20,24 36,16 C44,12 48,12 50,12"
              fill="none" stroke="#f5f1e8" stroke-width="1.8"/>
        <path d="M82,40 L92,38 L94,44 L84,46" fill="none" stroke="#f5f1e8" stroke-width="1.2"/>
        <path d="M72,70 L78,80 L84,76 L76,66" fill="none" stroke="#f5f1e8" stroke-width="1.2"/>
        <path d="M38,84 L36,96 L44,98 L46,86" fill="none" stroke="#f5f1e8" stroke-width="1.2"/>
        <path d="M16,44 L6,46 L4,52 L14,50" fill="none" stroke="#f5f1e8" stroke-width="1.2" stroke-dasharray="3 2"
              opacity="0.5"/>
        <path d="M24,22 L18,12 L12,16 L20,26" fill="none" stroke="#f5f1e8" stroke-width="1.2"/>
        <path d="M60,16 L62,4 L70,6 L66,18" fill="none" stroke="#f5f1e8" stroke-width="1.2"/>
        <ellipse cx="48" cy="52" rx="12" ry="10" fill="none" stroke="#f5f1e8" stroke-width="1"
                 transform="rotate(-8, 48, 52)"/>
      </svg>
    </div>

    <!-- 彩蛋触发提示 -->
    <div v-if="easter.triggered.value" class="easter-message mono">
      > resolve states via physical interference...
    </div>

    <!-- 主内容区：根据校准阶段切换组件 -->
    <main class="main-content">
      <!-- 开场 -->
      <SignalIntro v-if="!store.hasConnected"/>

      <!-- 答题阶段 -->
      <QuestionSet v-else-if="!store.isQuizFinished"/>

      <!-- 觉醒阶段（未点击邀请函时） -->
      <LuxReveal v-else-if="store.isAwaken && !store.showInvite"/>

      <!-- 邀请函 -->
      <CTAInvite v-else-if="store.showInvite"/>
    </main>
  </div>
</template>

<script setup>
// 监听彩蛋触发，存入store
import {onMounted, watch} from 'vue';
import {useCalibrationStore} from '../stores/calibration';
import {usePulse} from '../composables/usePulse';
import {useEasterEgg} from '../composables/useEasterEgg';
import {useAudio} from '../composables/useAudio';

import SignalIntro from '../components/recruitment/SignalIntro.vue';
import QuestionSet from '../components/recruitment/QuestionSet.vue';
import LuxReveal from '../components/recruitment/LuxReveal.vue';
import CTAInvite from '../components/recruitment/CTAInvite.vue';

const store = useCalibrationStore();
const {startPulse, stopPulse} = usePulse();
const {initAudio} = useAudio();
const easter = useEasterEgg();

// 页面加载时预初始化音频（等待手势）
onMounted(() => {
  // 不自动播放，等待用户交互
});

watch(() => easter.triggered.value, (val) => {
  if (val) store.triggerEasterEgg();
});
</script>

<style lang="scss" scoped>
@import '../styles/variables';
@import '../styles/mixins';

.recruitment-page {
  position: relative;
  min-height: 100vh;
  background-color: $color-void;
  @include noise-overlay(0.03, #fff);

  .easter-egg {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 32px;
    height: 32px;
    opacity: 0.08;
    cursor: pointer;
    z-index: $z-easter;

    &:active {
      opacity: 0.1;
    }

    .cog {
      width: 100%;
      height: 100%;
    }
  }

  .easter-message {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.9);
    color: $color-paper;
    padding: 0.75rem 1.5rem;
    border-radius: 2px;
    font-family: $font-mono;
    letter-spacing: 0.2em;
    z-index: $z-overlay;
    animation: slideDown 0.3s $ease-drawer;
    white-space: nowrap;
    border-left: 3px solid $color-heartbeat;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  .main-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
  }
}
</style>
