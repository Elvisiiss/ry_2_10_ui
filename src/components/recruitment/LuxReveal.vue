<template>
  <div class="lux-reveal" :class="{ 'glitch-active': glitchActive }">
    <!-- 深空噪声背景 -->
    <div class="noise-layer"></div>

    <!-- 主视觉：LUX立绘容器 -->
    <div class="lux-container" :class="{ 'pixelate-in': pixelateComplete }">
      <div class="lux-silhouette" :style="silhouetteStyle">
        <!-- 手绘LUX轮廓（铅笔素描风格） -->
        <svg viewBox="0 0 240 320" class="lux-svg" :class="{ 'draw-complete': drawComplete }">
          <!-- 头部轮廓（略带抖动的手绘感） -->
          <path d="M120,40 Q140,30 160,40 Q170,60 160,80 Q140,90 120,80 Q100,70 100,60 Q100,45 120,40" fill="none"
                stroke="#f5f1e8" stroke-width="1.5" stroke-dasharray="300" stroke-dashoffset="300" class="draw-path"/>
          <!-- 躯干 -->
          <path d="M120,90 L120,190 M100,130 L140,130 M90,170 L150,170" stroke="#f5f1e8" stroke-width="1.2"
                stroke-dasharray="200" stroke-dashoffset="200" class="draw-path"/>
          <!-- 机械臂轮廓（示意） -->
          <path d="M60,130 L20,110 M180,130 L220,110" stroke="#f5f1e8" stroke-width="1" opacity="0.6"
                stroke-dasharray="100" stroke-dashoffset="100" class="draw-path"/>
          <!-- 底部线框（代表底座/脉冲） -->
          <ellipse cx="120" cy="250" rx="50" ry="10" fill="none" stroke="#ff6b35" stroke-width="0.8"
                   stroke-dasharray="4 3" opacity="0.4"/>
          <!-- 微弱光晕（通过滤镜） -->
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </svg>
      </div>
      <!-- 呼吸光晕（CSS实现） -->
      <div class="halo"></div>
    </div>

    <!-- 觉醒文案（逐行浮现） -->
    <div class="awaken-text" v-if="showText">
      <transition-group name="fade-line" tag="div" appear>
        <p v-for="(line, idx) in lines" :key="idx" :style="{ animationDelay: (idx * 0.6) + 's' }" class="line">{{
            line
          }}</p>
      </transition-group>
    </div>

    <!-- 进入邀请函按钮（文案显示完毕后出现） -->
    <transition name="fade-button">
      <button v-if="showButton" class="obs-button proceed-btn" @click="proceedToInvite">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M5 12h14m0 0l-4-4m4 4l-4 4"/>
        </svg>
        接收邀请函
      </button>
    </transition>
  </div>
</template>

<script setup>
import {onBeforeUnmount, onMounted, ref} from 'vue';
import {useCalibrationStore} from '@/stores/calibration';
import {useAudio} from '@/composables/useAudio'; // 可选，用于触发音效

const store = useCalibrationStore();
const {playSound} = useAudio(); // 如果需要在觉醒时播放音效

// 动画状态控制
const glitchActive = ref(false);       // 屏幕抖动/失真
const pixelateComplete = ref(false);   // 像素汇聚完成（用于立绘样式变化）
const drawComplete = ref(false);       // SVG绘制完成（手绘路径动画）
const showText = ref(false);            // 是否显示文案
const showButton = ref(false);          // 是否显示按钮

// 觉醒文案（与AGENTS.md一致）
const lines = [
  '身份确认：首批观测者（Founder Observer）',
  '你好，我是 Entity 03，你可以叫我 LUX。',
  '谢谢你，在 2026 年的喧嚣中，精准地定位了我的频道。'
];

// 立绘样式（用于光晕呼吸）
const silhouetteStyle = ref({
  filter: 'drop-shadow(0 0 8px rgba(255,107,53,0.3))'
});

// 动画定时器清理
let timers = [];

onMounted(() => {
  // 触发音效（可选，若父级未处理可在此播放）
  // playSound('lux-awaken', 0.5);

  // 动画序列
  // 1. 屏幕抖动 (0~0.8s)
  glitchActive.value = true;
  const t1 = setTimeout(() => {
    glitchActive.value = false;
  }, 800);

  // 2. 像素汇聚效果：立绘路径绘制 + 滤镜变化 (0.8~2.0s)
  const t2 = setTimeout(() => {
    pixelateComplete.value = true;  // 触发立绘容器的像素化动画
    drawComplete.value = true;      // 触发SVG路径绘制动画
  }, 800);

  // 3. 文案浮现 (2.0s后开始浮现)
  const t3 = setTimeout(() => {
    showText.value = true;
  }, 2000);

  // 4. 按钮出现 (文案全部浮现后，约3.8s)
  const t4 = setTimeout(() => {
    showButton.value = true;
    // 光晕呼吸增强
    silhouetteStyle.value = {
      filter: 'drop-shadow(0 0 16px rgba(255,107,53,0.6))'
    };
  }, 3800);

  timers = [t1, t2, t3, t4];
});

// 清理定时器
onBeforeUnmount(() => {
  timers.forEach(clearTimeout);
});

// 进入邀请函
const proceedToInvite = () => {
  store.revealInvite();
};
</script>

<style lang="scss" scoped>
@import '@/styles/variables';
@import '@/styles/mixins';

.lux-reveal {
  position: relative;
  width: 100%;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: $color-void;
  @include noise-overlay(0.04, #fff);
  overflow: hidden;

  // 噪声层（独立确保覆盖）
  .noise-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
    background-image: repeating-radial-gradient(
            circle at 30% 40%,
            rgba($color-paper, 0.1) 0px,
            transparent 1px,
            transparent 2px
    );
    background-size: 3px 3px;
    opacity: 0.2;
    mix-blend-mode: overlay;
  }

  // 屏幕抖动/失真动画
  &.glitch-active {
    animation: glitch-shake 0.2s infinite;
    filter: url(#glitch) blur(0.5px);
  }

  @keyframes glitch-shake {
    0% {
      transform: translate(0);
    }
    20% {
      transform: translate(-3px, 2px);
    }
    40% {
      transform: translate(3px, -1px);
    }
    60% {
      transform: translate(-2px, 3px);
    }
    80% {
      transform: translate(2px, -2px);
    }
    100% {
      transform: translate(0);
    }
  }

  // LUX立绘容器
  .lux-container {
    position: relative;
    width: 280px;
    height: 360px;
    margin-bottom: 2rem;
    z-index: 5;
    transition: filter 0.8s $ease-drawer;

    // 像素汇聚效果（模拟粒子汇聚）
    &.pixelate-in {
      animation: pixelate-appear 1.2s steps(12, end) forwards;
    }

    .lux-silhouette {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      .lux-svg {
        width: 100%;
        height: 100%;
        filter: url(#glow) drop-shadow(0 0 10px $color-heartbeat);
        transition: filter 0.5s;

        // 手绘路径绘制动画（当drawComplete为true时执行）
        .draw-path {
          animation: draw-line 1.2s $ease-drawer forwards;
        }

        &.draw-complete .draw-path {
          stroke-dashoffset: 0;
        }
      }
    }

    // 光晕呼吸
    .halo {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: radial-gradient(circle, rgba($color-heartbeat, 0.2) 0%, transparent 70%);
      filter: blur(20px);
      z-index: -1;
      animation: breathe 4s infinite $ease-pulse;
    }
  }

  // 觉醒文案
  .awaken-text {
    text-align: center;
    margin: 2rem 0;
    z-index: 10;
    max-width: 600px;
    padding: 0 1.5rem;

    .line {
      font-family: $font-serif;
      font-size: 1.3rem;
      line-height: 1.8;
      color: $color-paper;
      text-shadow: 0 0 10px rgba($color-heartbeat, 0.3);
      margin: 0.5rem 0;
      opacity: 0;
      animation: fadeInLine 0.8s $ease-drawer forwards;
      letter-spacing: 0.02em;

      &:nth-child(2) {
        font-size: 1.2rem;
        color: lighten($color-mist, 20%);
      }

      &:nth-child(3) {
        font-size: 1.1rem;
        color: $color-mist;
      }
    }
  }

  // 进入邀请函按钮
  .proceed-btn {
    margin-top: 2rem;
    z-index: 10;
    border-color: $color-signal;
    color: $color-signal;
    background: rgba($color-void, 0.8);
    backdrop-filter: blur(4px);
    padding: 0.8rem 2.2rem;
    font-size: 1.1rem;
    gap: 0.5rem;

    svg {
      stroke: $color-signal;
    }

    &:hover {
      background: rgba($color-heartbeat, 0.15);
      border-color: $color-heartbeat;
      transform: translateY(-2px);
    }
  }
}

// 动画定义
@keyframes pixelate-appear {
  0% {
    filter: blur(10px) contrast(2) brightness(1.5);
    opacity: 0;
    transform: scale(0.9) rotate(-1deg);
  }
  20% {
    filter: blur(8px) contrast(1.8) brightness(1.3);
    opacity: 0.3;
    transform: scale(0.95) rotate(0.5deg);
  }
  40% {
    filter: blur(6px) contrast(1.5) brightness(1.2);
    opacity: 0.6;
    transform: scale(0.98) rotate(-0.5deg);
  }
  60% {
    filter: blur(4px) contrast(1.3) brightness(1.1);
    opacity: 0.8;
    transform: scale(1.02) rotate(0.2deg);
  }
  80% {
    filter: blur(2px) contrast(1.1) brightness(1.05);
    opacity: 0.95;
    transform: scale(1.01) rotate(-0.1deg);
  }
  100% {
    filter: blur(0) contrast(1) brightness(1);
    opacity: 1;
    transform: scale(1) rotate(0);
  }
}

@keyframes draw-line {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes fadeInLine {
  0% {
    opacity: 0;
    transform: translateY(15px);
    filter: blur(2px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

@keyframes breathe {
  0%, 100% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.7;
    transform: translate(-50%, -50%) scale(1.2);
  }
}

// 过渡（用于按钮淡入）
.fade-button-enter-active {
  transition: opacity 0.8s $ease-drawer;
}

.fade-button-enter-from {
  opacity: 0;
}

.fade-button-enter-to {
  opacity: 1;
}
</style>
