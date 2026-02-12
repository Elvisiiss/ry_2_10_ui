<template>
  <div class="wavelength-lock">
    <span class="label">波长锁定</span>
    <div class="lock-bar-bg">
      <div
          class="lock-bar-fill"
          :style="{ width: `${percentage}%` }"
          :class="{ 'full': percentage >= 100 }"
      />
    </div>
    <span class="percentage">{{ Math.round(percentage) }}%</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  percentage: number
}>()
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.wavelength-lock {
  display: flex;
  align-items: center;
  gap: $spacing-3;

  .label {
    font-family: $font-mono;
    font-size: $font-size-sm;
    color: $color-paper;
  }

  .lock-bar-bg {
    width: 160px;
    height: 8px;
    background: $color-dust;
    border: 1px solid $color-mist;
    position: relative;
    overflow: hidden;
  }

  .lock-bar-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: $color-pulse;
    transition: width 0.3s $ease-lock;

    &.full {
      background: $color-signal;
      box-shadow: 0 0 8px $color-signal;
    }
  }

  .percentage {
    font-family: $font-mono;
    font-size: $font-size-sm;
    color: $color-pulse;
    min-width: 48px;
    text-align: right;
  }
}
</style>
