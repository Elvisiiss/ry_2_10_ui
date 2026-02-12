<template>
  <footer class="site-footer">
    <div class="footer-container">
      <!-- 天文钟 SVG（复用彩蛋区域，但此处仅为装饰） -->
      <div class="footer-clock">
        <HandDrawnSVG name="astronomical-clock" class="clock-svg-small">
          <svg viewBox="0 0 40 40" class="clock-small">
            <circle cx="20" cy="20" r="18" fill="none" stroke="var(--color-mist)" stroke-width="0.6"
                    stroke-dasharray="2 1"/>
            <line x1="20" y1="20" x2="20" y2="10" stroke="var(--color-pulse)" stroke-width="0.8"
                  :transform="`rotate(${hourAngle}, 20, 20)`"/>
            <line x1="20" y1="20" x2="20" y2="7" stroke="var(--color-paper)" stroke-width="0.6"
                  :transform="`rotate(${minuteAngle}, 20, 20)`"/>
          </svg>
        </HandDrawnSVG>
      </div>

      <!-- 版权信息 & 致敬语 -->
      <div class="footer-info">
        <p class="copyright">© 2026 Halcyon · 03号观测站</p>
        <p class="credits handwritten">
          在数据荒原寻找真实心跳
          <span class="separator">|</span>
          对抗界面虚无主义
        </p>
      </div>

      <!-- 彩蛋区域（已单独存在，此处可保留触发区，也可不加） -->
      <!-- 但为不重复，只保留纯展示的天文钟，彩蛋已在全局 EasterEgg 实现 -->
    </div>
  </footer>
</template>

<script setup lang="ts">
import {onMounted, onUnmounted, ref} from 'vue'
import HandDrawnSVG from '@/components/core/HandDrawnSVG.vue'

const hourAngle = ref(180)
const minuteAngle = ref(210)

let interval: NodeJS.Timeout
onMounted(() => {
  interval = setInterval(() => {
    hourAngle.value = (hourAngle.value - 0.05) % 360
    minuteAngle.value = (minuteAngle.value - 0.3) % 360
  }, 100)
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.site-footer {
  padding: $spacing-8 $spacing-6;
  background: rgba($color-void, 0.95);
  border-top: 1px solid rgba($color-pulse, 0.15);
  margin-top: $spacing-12;

  .footer-container {
    max-width: $breakpoint-xl;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-4;
  }

  .footer-clock {
    width: 40px;
    height: 40px;
    opacity: 0.5;
  }

  .footer-info {
    text-align: center;

    .copyright {
      font-family: $font-mono;
      font-size: $font-size-xs;
      color: $color-mist;
      margin-bottom: $spacing-2;
    }

    .credits {
      font-size: $font-size-xs;
      color: $color-mist;
      display: flex;
      gap: $spacing-2;
      align-items: center;

      .separator {
        color: $color-pulse;
        opacity: 0.5;
      }

      @media (max-width: $breakpoint-sm) {
        flex-direction: column;
        gap: $spacing-1;
      }
    }
  }
}
</style>
