<template>
  <div class="not-found">
    <div class="radar-screen">
      <!-- 手绘雷达 SVG，带旋转扫描线 -->
      <svg
          viewBox="0 0 400 400"
          class="radar-svg handdrawn"
          :style="{ filter: 'drop-shadow(0 0 8px rgba(255,159,75,0.2))' }"
      >
        <!-- 背景网格：手绘风格同心圆+十字线 -->
        <g class="radar-grid">
          <circle
              v-for="r in [40, 80, 120, 160]"
              :key="r"
              :cx="200"
              :cy="200"
              :r="r"
              fill="none"
              stroke="var(--color-paper)"
              stroke-width="0.8"
              :stroke-dasharray="handdrawnDash(r)"
              opacity="0.3"
          />
          <line
              x1="40"
              y1="200"
              x2="360"
              y2="200"
              stroke="var(--color-paper)"
              stroke-width="0.8"
              :stroke-dasharray="handdrawnDash(200)"
              opacity="0.2"
          />
          <line
              x1="200"
              y1="40"
              x2="200"
              y2="360"
              stroke="var(--color-paper)"
              stroke-width="0.8"
              :stroke-dasharray="handdrawnDash(200)"
              opacity="0.2"
          />
        </g>

        <!-- 扫描线（旋转） -->
        <line
            x1="200"
            y1="200"
            x2="360"
            y2="200"
            stroke="var(--color-pulse)"
            stroke-width="1.5"
            stroke-linecap="round"
            :transform="`rotate(${scanAngle}, 200, 200)`"
            style="transition: transform 0.1s linear"
            opacity="0.7"
        >
          <animate
              attributeName="transform"
              type="rotate"
              from="0 200 200"
              to="360 200 200"
              dur="8s"
              repeatCount="indefinite"
              easing="linear"
          />
        </line>

        <!-- 中心光点——微弱，无信号 -->
        <circle
            cx="200"
            cy="200"
            r="6"
            fill="var(--color-mist)"
            opacity="0.4"
        >
          <animate
              attributeName="r"
              values="6;7;6"
              dur="3s"
              repeatCount="indefinite"
          />
        </circle>

        <!-- 手写噪点（随机静态） -->
        <g class="noise" v-html="noiseSvg"/>
      </svg>

      <h1 class="display-404 handdrawn-font">404</h1>
      <p class="subtitle signal-text">信号丢失 · 坐标未收录</p>
      <p class="message handwritten">
        “有些东西，存在过，但从来没被正式建档...”
      </p>
    </div>

    <ObsButton @click="retune">
      <template #default>
        <span class="button-text">↻ 重新调频</span>
      </template>
    </ObsButton>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import ObsButton from '@/components/core/ObsButton.vue'
import {noisePoints} from '@/utils/drawingUtils'
import {useRouter} from 'vue-router'

const router = useRouter()
const scanAngle = ref(0)
const noiseSvg = ref('')

onMounted(() => {
  // 生成随机静态噪点
  noiseSvg.value = noisePoints(40, {width: 400, height: 400}, [0.8, 1.8])
})

// 手绘虚线样式（为每个圆生成不同的 dasharray）
const handdrawnDash = (length: number) => {
  const seg = Math.floor(length / 12)
  return `${seg}, ${seg * 0.6}`
}

const retune = () => {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--color-void);
  padding: $spacing-8;

  .radar-screen {
    max-width: 500px;
    width: 100%;
    margin-bottom: $spacing-8;
    text-align: center;
  }

  .radar-svg {
    width: 100%;
    height: auto;
    margin-bottom: $spacing-6;
  }

  .display-404 {
    font-family: $font-signal;
    font-size: $font-size-3xl * 1.5;
    color: var(--color-pulse);
    margin-bottom: $spacing-2;
    letter-spacing: 0.1em;
    text-shadow: 0 0 10px rgba($color-pulse, 0.3);
  }

  .subtitle {
    font-family: $font-mono;
    font-size: $font-size-lg;
    color: var(--color-paper);
    margin-bottom: $spacing-4;
  }

  .message {
    font-size: $font-size-base;
    color: var(--color-mist);
    max-width: 300px;
    margin: 0 auto;
  }
}
</style>
