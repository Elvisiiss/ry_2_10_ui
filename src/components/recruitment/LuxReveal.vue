<template>
  <div class="lux-reveal" :class="{ awaken: isAwaken }">
    <div v-if="!isAwaken" class="awaiting">
      <!-- 等待觉醒：显示信号失真动画 -->
      <div class="distortion">
        <svg class="static" width="200" height="200">
          <rect width="200" height="200" fill="black"/>
          <circle cx="100" cy="100" r="40" fill="none" stroke="#f5f1e8" stroke-width="0.5" stroke-dasharray="4 4"
                  opacity="0.3"/>
        </svg>
        <p class="mono">信号失真中...</p>
      </div>
    </div>

    <div v-else class="awakened">
      <!-- 像素汇聚动画（简化：使用CSS逐帧） -->
      <div class="particle-container">
        <div v-for="i in 30" :key="i" class="particle" :style="particleStyle(i)"></div>
      </div>

      <!-- LUX立绘（手绘SVG） -->
      <div class="lux-portrait">
        <svg viewBox="0 0 100 100" class="lux-svg">
          <!-- LUX侧影轮廓（来自lux-silhouette.svg） -->
          <path
              d="M32,44 C28,34 30,20 44,16 C58,12 76,18 80,32 C84,46 78,62 64,68 C50,74 34,68 30,54 C28,48 30,44 32,44"
              fill="none" stroke="#f5f1e8" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M44,30 C52,26 62,26 70,32" fill="none" stroke="#f5f1e8" stroke-width="0.7" opacity="0.6"/>
          <path d="M48,46 C56,42 64,42 72,48" fill="none" stroke="#f5f1e8" stroke-width="0.7" opacity="0.6"/>
          <path d="M42,58 C50,54 58,56 66,62" fill="none" stroke="#f5f1e8" stroke-width="0.7" opacity="0.6"/>
          <path d="M74,38 C80,36 86,34 90,30 C94,26 94,22 90,20" fill="none" stroke="#f5f1e8" stroke-width="1"
                stroke-linecap="round"/>
          <path d="M90,20 L94,18 L92,22" fill="none" stroke="#f5f1e8" stroke-width="0.8" stroke-linecap="round"/>
          <path d="M76,44 L82,40 L86,36" fill="none" stroke="#f5f1e8" stroke-width="0.7" opacity="0.7"
                stroke-linecap="round"/>
        </svg>
      </div>

      <!-- 觉醒文案 -->
      <div class="awaken-text">
        <p class="line1 hand-title">身份确认：首批观测者（Founder Observer）</p>
        <p class="line2 hand-title">你好，我是 Entity 03，你可以叫我 LUX。</p>
        <p class="line3 hand-title">谢谢你，在 2026 年的喧嚣中，精准地定位了我的频道。</p>
      </div>

      <!-- 继续按钮，进入邀请函 -->
      <button class="obs-button" @click="proceedToInvite">
        聆听邀请
      </button>
    </div>
  </div>
</template>

<script setup>
import {onMounted} from 'vue';
import {useCalibrationStore} from '../../stores/calibration';
import {storeToRefs} from 'pinia';
import {useAudio} from '../../composables/useAudio';

const store = useCalibrationStore();
const {isAwaken} = storeToRefs(store);
const {playSound} = useAudio();

// 播放觉醒音效（在觉醒时触发）
onMounted(() => {
  if (isAwaken.value) {
    playSound('awaken', 0.5);
  }
});

// 粒子样式（随机位置，用于动画）
const particleStyle = (i) => {
  const left = Math.random() * 100;
  const top = Math.random() * 100;
  const delay = Math.random() * 0.5;
  return {
    left: left + '%',
    top: top + '%',
    animationDelay: delay + 's'
  };
};

const proceedToInvite = () => {
  store.revealInvite();
};
</script>

<style lang="scss" scoped>
@import '../../styles/variables';

.lux-reveal {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;

  .awaiting {
    .static {
      animation: shake 0.2s infinite;
    }
  }

  .awakened {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;

    .particle-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;

      .particle {
        position: absolute;
        width: 2px;
        height: 2px;
        background: $color-paper;
        opacity: 0.8;
        animation: converge 1.5s $ease-linear forwards;
      }
    }

    .lux-portrait {
      width: 240px;
      height: 240px;
      margin-bottom: 2rem;
      z-index: 2;

      .lux-svg {
        width: 100%;
        height: 100%;
        filter: drop-shadow(0 0 12px $color-heartbeat);
        animation: breathe 4s infinite ease-in-out;
      }
    }

    .awaken-text {
      text-align: center;
      margin-bottom: 2rem;
      z-index: 2;

      p {
        opacity: 0;
        animation: fadeInUp 0.8s $ease-drawer forwards;

        &.line1 {
          animation-delay: 0.2s;
        }

        &.line2 {
          animation-delay: 0.8s;
        }

        &.line3 {
          animation-delay: 1.4s;
        }
      }

      .hand-title {
        font-size: 1.5rem;
        font-weight: 400;
        margin: 0.5rem 0;

        @media (max-width: $bp-mobile) {
          font-size: 1.2rem;
        }
      }
    }
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(3px);
  }
  75% {
    transform: translateX(-3px);
  }
}

@keyframes converge {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(0);
    opacity: 0;
  }
}

@keyframes breathe {
  0%, 100% {
    filter: drop-shadow(0 0 8px $color-heartbeat);
  }
  50% {
    filter: drop-shadow(0 0 20px $color-heartbeat);
  }
}
</style>
