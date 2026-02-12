<template>
  <div class="frequency-dial">
    <svg :width="width" :height="height" viewBox="0 0 240 80">
      <!-- 手绘刻度线路径 -->
      <path
          :d="dialPath"
          fill="none"
          stroke="var(--color-paper)"
          stroke-width="1.2"
          stroke-dasharray="4 3"
          opacity="0.7"
      />
      <!-- 五个刻度点 -->
      <circle
          v-for="i in 5"
          :key="i"
          :cx="40 + (i - 1) * 40"
          cy="40"
          r="6"
          fill="var(--color-mist)"
          :opacity="i - 1 === currentIndex ? 0.8 : 0.3"
      />
      <!-- 指针 -->
      <g :transform="`translate(${40 + currentIndex * 40}, 40)`">
        <line x1="0" y1="-20" x2="0" y2="20" stroke="var(--color-pulse)" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="0" cy="0" r="5" fill="var(--color-pulse)"/>
      </g>
    </svg>
    <div class="dial-labels">
      <span
          v-for="i in 5"
          :key="i"
          class="label"
          :class="{ active: i - 1 === currentIndex }"
          @click="handleLabelClick(i - 1)"
      >
        {{ `0${i}` }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{
  /** 当前选中索引 0-4 */
  currentIndex: number
  /** 总刻度数（固定5） */
  total?: number
  /** SVG 宽度 */
  width?: string | number
  /** SVG 高度 */
  height?: string | number
}>()

const emit = defineEmits<{
  (e: 'select', index: number): void
}>()

const dialPath = 'M40,40 Q80,30 120,40 T200,40'

const handleLabelClick = (index: number) => {
  emit('select', index)
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.frequency-dial {
  display: inline-flex;
  flex-direction: column;
  align-items: center;

  svg {
    max-width: 100%;
    height: auto;
  }

  .dial-labels {
    display: flex;
    justify-content: space-between;
    width: 240px;
    margin-top: $spacing-1;
    padding: 0 $spacing-2;

    .label {
      font-family: $font-mono;
      font-size: $font-size-xs;
      color: $color-mist;
      cursor: pointer;
      transition: color 0.2s;

      &:hover {
        color: $color-pulse;
      }

      &.active {
        color: $color-pulse;
        font-weight: $font-weight-bold;
        text-decoration: underline;
        text-underline-offset: 4px;
      }
    }
  }
}
</style>
