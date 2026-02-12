<template>
  <div class="signal-intro">
    <div class="pulse-container">
      <!-- 手绘光点（SVG内联） -->
      <svg width="32" height="32" viewBox="0 0 100 100" class="pulse-svg">
        <circle cx="50" cy="50" r="1" fill="#f5f1e8"/>
        <path d="M50,12 C44,12 38,18 38,26 C38,34 44,40 50,40 C56,40 62,34 62,26 C62,18 56,12 50,12"
              fill="none" stroke="#f5f1e8" stroke-width="0.8" stroke-opacity="0.9"/>
        <path d="M50,8 C40,8 30,18 30,30 C30,42 40,52 50,52 C60,52 70,42 70,30 C70,18 60,8 50,8"
              fill="none" stroke="#f5f1e8" stroke-width="0.7" stroke-dasharray="2 2" stroke-opacity="0.55"
              transform="translate(1.2, -0.8)"/>
        <path d="M50,2 C36,2 22,16 22,32 C22,48 36,62 50,62 C64,62 78,48 78,32 C78,16 64,2 50,2"
              fill="none" stroke="#f5f1e8" stroke-width="0.6" stroke-dasharray="4 4" stroke-opacity="0.25"
              transform="translate(-1.5, 1.2)"/>
      </svg>
    </div>

    <div class="text-lines">
      <p v-for="(line, index) in lines"
         :key="index"
         class="line"
         :style="{ animationDelay: index * 0.4 + 's' }">
        {{ line }}
      </p>
    </div>

    <button class="obs-button" @click="handleConnect">
      连接信号
    </button>
  </div>
</template>

<script setup>
import {ref} from 'vue';
import {useCalibrationStore} from '../../stores/calibration';
import {useAudio} from '../../composables/useAudio';

const store = useCalibrationStore();
const {playSound} = useAudio();

const lines = ref([
  '正在从 deltaCephei（造父四）接收信号...',
  '信号来源：03号观测站',
  '正在同步本地时空：2026年3月，江西，地球',
  '观测者，你听得到吗？'
]);

const handleConnect = async () => {
  await playSound('connect', 0.4);
  store.connect();
  // 触发父级页面状态切换（通过store自动响应）
};
</script>

<style lang="scss" scoped>
@import '../../styles/variables';
@import '../../styles/mixins';

.signal-intro {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;

  .pulse-container {
    margin-bottom: 3rem;

    .pulse-svg {
      width: 80px;
      height: 80px;
      animation: pulse-light 2.4s $ease-pulse infinite;

      circle, path {
        transition: all 0.2s;
      }
    }
  }

  .text-lines {
    margin-bottom: 3rem;

    .line {
      font-family: $font-serif;
      font-weight: 300;
      color: $color-paper;
      margin: 0.5rem 0;
      opacity: 0;
      animation: fadeInUp 0.8s $ease-drawer forwards;
      letter-spacing: 0.05em;
    }
  }

  @keyframes fadeInUp {
    0% {
      opacity: 0;
      transform: translateY(10px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse-light {
    0%, 100% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
  }
}
</style>
