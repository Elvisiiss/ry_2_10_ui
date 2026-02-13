<template>
  <div class="recruitment-page">
    <!-- 深空背景星点（纯CSS绘制） -->
    <div class="stars" aria-hidden="true">
      <span v-for="i in 60" :key="i" :style="starStyle(i)"></span>
    </div>

    <!-- 阴极扫描线（固定图层） -->
    <div class="crt-scanline"></div>

    <!-- 全局噪声纹理（彩蛋触发时增强故障感） -->
    <div class="noise-dynamic" :class="{ 'noise-intense': easter.triggered }"></div>

    <!-- 彩蛋齿轮 —— 长按旋转反馈 -->
    <div class="easter-egg"
         :class="{ pressing: cogPressed }"
         @mousedown="onCogPress"
         @mouseup="onCogRelease"
         @mouseleave="onCogRelease"
         @touchstart="onCogPress"
         @touchend="onCogRelease"
         @touchcancel="onCogRelease">
      <svg viewBox="0 0 100 100" class="cog">
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

    <!-- 彩蛋触发提示 + 故障闪烁层 (消息自动消失) -->
    <transition name="glitch-slide">
      <div v-if="showEasterMessage" class="easter-message mono">
        > resolve states via physical interference...
      </div>
    </transition>
    <div v-if="easter.triggered" class="glitch-overlay"></div>

    <!-- 主内容区 —— 四阶段切换动画 -->
    <main class="main-content">
      <!-- 阶段1：信号捕获（SignalIntro） -->
      <transition v-if="!store.hasConnected" name="fade-signal" mode="out-in">
        <SignalIntro key="signal"/>
      </transition>

      <!-- 阶段2：问卷校准（QuestionSet） -->
      <transition v-else-if="!store.isQuizFinished" name="slide-question" mode="out-in">
        <QuestionSet key="quiz"/>
      </transition>

      <!-- 阶段3：觉醒时刻（LuxReveal） -->
      <transition v-else-if="store.isAwaken && !store.showInvite" name="distort-awaken" mode="out-in">
        <LuxReveal key="lux"/>
      </transition>

      <!-- 阶段4：邀请函（CTAInvite） -->
      <transition v-else-if="store.showInvite" name="fade-invite" mode="out-in">
        <CTAInvite key="invite"/>
      </transition>
    </main>

    <!-- 脉冲频率指示器（彩蛋触发后显示，增加动态信号条） -->
    <div v-if="easter.triggered" class="pulse-indicator mono">
      <span class="pulse-dot"></span>
      <span class="pulse-text">17kHz ███████░░░ 73%</span>
      <div class="signal-bars">
        <span v-for="n in 5" :key="n" :style="{ animationDelay: n * 0.1 + 's' }"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, onUnmounted, ref, watch} from 'vue';
import {useCalibrationStore} from '../stores/calibration';
import {usePulse} from '../composables/usePulse';
import {useEasterEgg} from '../composables/useEasterEgg';
import {useAudio} from '../composables/useAudio';

// 子组件
import SignalIntro from '../components/recruitment/SignalIntro.vue';
import QuestionSet from '../components/recruitment/QuestionSet.vue';
import LuxReveal from '../components/recruitment/LuxReveal.vue';
import CTAInvite from '../components/recruitment/CTAInvite.vue';

const store = useCalibrationStore();
const {startPulse, stopPulse} = usePulse();
const {initAudio} = useAudio();
const easter = useEasterEgg();

// 彩蛋齿轮按压状态
const cogPressed = ref(false);
const onCogPress = () => {
  easter.startPress();
  cogPressed.value = true;
};
const onCogRelease = () => {
  easter.cancelPress();
  cogPressed.value = false;
};

// 彩蛋消息单独控制，8秒后自动消失
const showEasterMessage = ref(false);
let messageTimer = null;

watch(() => easter.triggered.value, (val) => {
  // 彩蛋触发时同步到store
  if (val) store.triggerEasterEgg();

  // 处理消息显示/隐藏
  if (val) {
    // 清除之前的定时器
    if (messageTimer) clearTimeout(messageTimer);
    showEasterMessage.value = true;
    messageTimer = setTimeout(() => {
      showEasterMessage.value = false;
      messageTimer = null;
    }, 8000);
  } else {
    // 如果彩蛋状态被外部重置，也隐藏消息
    if (messageTimer) {
      clearTimeout(messageTimer);
      messageTimer = null;
    }
    showEasterMessage.value = false;
  }
});

// 组件卸载时清除定时器
onUnmounted(() => {
  if (messageTimer) clearTimeout(messageTimer);
});

// 随机生成星点位置与闪烁延迟
const starStyle = (i) => {
  const size = Math.floor(Math.random() * 2) + 1;
  const left = Math.random() * 100;
  const top = Math.random() * 100;
  const duration = Math.random() * 8 + 4;
  const delay = Math.random() * 5;
  const opacity = (Math.random() * 0.4 + 0.1).toFixed(2);
  return {
    width: size + 'px',
    height: size + 'px',
    left: left + '%',
    top: top + '%',
    opacity: opacity,
    animation: `twinkle ${duration}s infinite ease-in-out ${delay}s`
  };
};

// 页面加载时仅预初始化音频
onMounted(() => {
});
</script>

<style lang="scss" scoped>
// ----- 变量后备值 -----
$color-signal: #FF8C5A !default;
$ease-pulse: cubic-bezier(0.45, 0.05, 0.55, 0.95) !default;
$ease-drawer: cubic-bezier(0.22, 0.98, 0.5, 1.02) !default;
$ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1) !default;

@import '../styles/variables';
@import '../styles/mixins';

.recruitment-page {
  position: relative;
  min-height: 100vh;
  background-color: $color-void;
  @include noise-overlay(0.03, #fff);
  overflow-x: hidden;

  // 深空星点
  .stars {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;

    span {
      position: absolute;
      background: $color-paper;
      border-radius: 50%;
      box-shadow: 0 0 4px rgba($color-paper, 0.2);
    }
  }

  @keyframes twinkle {
    0%, 100% {
      opacity: 0.1;
    }
    50% {
      opacity: 0.7;
    }
  }

  // CRT 扫描线
  .crt-scanline {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 2;
    background: repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0) 0px,
            rgba(0, 0, 0, 0.1) 1px,
            rgba(0, 0, 0, 0.2) 2px,
            rgba(0, 0, 0, 0.1) 3px,
            rgba(0, 0, 0, 0) 4px
    );
    opacity: 0.2;
    mix-blend-mode: overlay;
    animation: scanlineMove 8s infinite linear;
  }

  @keyframes scanlineMove {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(100vh);
    }
  }

  // 动态噪声
  .noise-dynamic {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
    opacity: 0;
    transition: opacity 0.2s;
    background-image: repeating-radial-gradient(
            circle at 20% 30%,
            rgba($color-paper, 0.15) 0px,
            transparent 1px,
            transparent 2px
    );
    background-size: 4px 4px;
    mix-blend-mode: overlay;

    &.noise-intense {
      opacity: 0.1;
      animation: noiseShift 0.2s infinite steps(2);
    }
  }

  @keyframes noiseShift {
    0% {
      background-position: 0 0;
    }
    100% {
      background-position: 4px 4px;
    }
  }

  // 彩蛋齿轮
  .easter-egg {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 32px;
    height: 32px;
    opacity: 0.08;
    cursor: pointer;
    z-index: $z-easter;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.15;
    }

    &.pressing .cog {
      animation: cog-rotate 0.6s infinite linear;
    }

    .cog {
      width: 100%;
      height: 100%;
    }
  }

  @keyframes cog-rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  // 彩蛋消息
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
    white-space: nowrap;
    border-left: 3px solid $color-heartbeat;
    box-shadow: 0 0 16px rgba($color-heartbeat, 0.2);
    backdrop-filter: blur(2px);
  }

  .glitch-slide-enter-active {
    animation: slideDown 0.3s $ease-drawer;
  }

  .glitch-slide-leave-active {
    animation: slideDown 0.2s $ease-drawer reverse;
  }

  // 故障特效层
  .glitch-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: $z-overlay - 1;
    background: linear-gradient(
            45deg,
            rgba($color-heartbeat, 0.02) 0%,
            rgba($color-signal, 0.02) 50%,
            rgba($color-heartbeat, 0.02) 100%
    );
    mix-blend-mode: screen;
    animation: glitchFlash 0.8s infinite steps(2);
  }

  @keyframes glitchFlash {
    0%, 100% {
      opacity: 0.1;
      transform: translate(0);
    }
    25% {
      opacity: 0.2;
      transform: translate(-2px, 1px);
    }
    50% {
      opacity: 0.15;
      transform: translate(2px, -1px);
    }
    75% {
      opacity: 0.2;
      transform: translate(-1px, -2px);
    }
  }

  // 脉冲指示器（新增动态信号条）
  .pulse-indicator {
    position: fixed;
    bottom: 24px;
    left: 24px;
    font-family: $font-mono;
    font-size: 12px;
    color: $color-mist;
    background: rgba(0, 0, 0, 0.7);
    padding: 6px 12px;
    border-radius: 20px;
    letter-spacing: 2px;
    z-index: $z-easter + 1;
    border: 0.5px solid rgba($color-heartbeat, 0.3);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    gap: 8px;

    .pulse-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      background: $color-signal;
      border-radius: 50%;
      animation: pulseDot 1.2s infinite $ease-pulse;
      box-shadow: 0 0 8px $color-signal;
    }

    .pulse-text {
      // 保留原有文本
    }

    // 动态信号条
    .signal-bars {
      display: flex;
      align-items: flex-end;
      gap: 2px;
      height: 12px;

      span {
        display: block;
        width: 4px;
        background: $color-signal;
        border-radius: 1px;
        animation: barPulse 0.8s infinite ease-in-out alternate;
        box-shadow: 0 0 6px $color-signal;
      }
    }
  }

  @keyframes pulseDot {
    0%, 100% {
      opacity: 0.4;
      transform: scale(0.8);
    }
    50% {
      opacity: 1;
      transform: scale(1.2);
    }
  }

  @keyframes barPulse {
    0% {
      height: 4px;
      opacity: 0.6;
    }
    100% {
      height: 12px;
      opacity: 1;
    }
  }

  // 主内容容器
  .main-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
    position: relative;
    z-index: 10;
  }

  // 阶段切换动画（保持不变）
  .fade-signal-enter-active,
  .fade-signal-leave-active {
    transition: opacity 0.6s $ease-drawer, transform 0.6s $ease-drawer;
  }

  .fade-signal-enter-from {
    opacity: 0;
    transform: translateY(8px);
  }

  .fade-signal-leave-to {
    opacity: 0;
    transform: translateY(-8px);
  }

  .slide-question-enter-active {
    transition: all 0.5s cubic-bezier(0.22, 0.98, 0.5, 1.02);
  }

  .slide-question-leave-active {
    transition: all 0.3s $ease-drawer;
  }

  .slide-question-enter-from {
    opacity: 0;
    transform: translateX(40px);
  }

  .slide-question-leave-to {
    opacity: 0;
    transform: translateX(-40px);
  }

  .distort-awaken-enter-active {
    animation: distortIn 0.8s steps(6, end);
  }

  .distort-awaken-leave-active {
    animation: distortOut 0.4s steps(4, end);
  }

  @keyframes distortIn {
    0% {
      opacity: 0;
      filter: blur(4px) contrast(2);
      transform: scale(0.9) rotate(-1deg);
    }
    20% {
      opacity: 0.3;
      filter: blur(2px) contrast(1.6);
      transform: scale(0.95) rotate(0.5deg);
    }
    40% {
      opacity: 0.6;
      filter: blur(1px) contrast(1.3);
      transform: scale(0.98) rotate(-0.5deg);
    }
    60% {
      opacity: 0.8;
      filter: blur(0.5px) contrast(1.1);
      transform: scale(1.02) rotate(0.2deg);
    }
    80% {
      opacity: 0.95;
      filter: blur(0) contrast(1);
      transform: scale(1.01) rotate(-0.1deg);
    }
    100% {
      opacity: 1;
      filter: blur(0) contrast(1);
      transform: scale(1) rotate(0);
    }
  }
  @keyframes distortOut {
    0% {
      opacity: 1;
      filter: blur(0);
      transform: scale(1);
    }
    100% {
      opacity: 0;
      filter: blur(4px) contrast(2);
      transform: scale(0.9) rotate(1deg);
    }
  }

  .fade-invite-enter-active {
    transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .fade-invite-leave-active {
    transition: all 0.3s $ease-drawer;
  }

  .fade-invite-enter-from {
    opacity: 0;
    transform: translateY(30px);
  }

  .fade-invite-leave-to {
    opacity: 0;
    transform: translateY(-20px);
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
}
</style>
