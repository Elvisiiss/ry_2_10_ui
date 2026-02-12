<template>
  <button
      class="obs-button"
      :class="[
      `variant-${variant}`,
      { pressed: isPressed, 'with-icon': $slots.icon }
    ]"
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseLeave"
      @click="handleClick"
      v-bind="$attrs"
  >
    <span v-if="$slots.icon" class="button-icon">
      <slot name="icon"/>
    </span>
    <span class="button-text">
      <slot/>
    </span>
    <!-- 手绘装饰角（仅 primary 变体） -->
    <span v-if="variant === 'primary'" class="corner top-left"/>
    <span v-if="variant === 'primary'" class="corner bottom-right"/>
  </button>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {useAudioContext} from '@/composables/useAudioContext'

const props = withDefaults(
    defineProps<{
      /** 按钮变体: primary, outline, ghost */
      variant?: 'primary' | 'outline' | 'ghost'
      /** 是否禁用 */
      disabled?: boolean
    }>(),
    {
      variant: 'primary',
      disabled: false
    }
)

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const isPressed = ref(false)
const {playLock} = useAudioContext()

const handleMouseDown = (e: MouseEvent) => {
  if (props.disabled) return
  isPressed.value = true
  // 按压音效
  playLock?.()
}

const handleMouseUp = (e: MouseEvent) => {
  isPressed.value = false
}

const handleMouseLeave = (e: MouseEvent) => {
  isPressed.value = false
}

const handleClick = (e: MouseEvent) => {
  if (props.disabled) return
  emit('click', e)
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.obs-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-2;
  padding: $spacing-3 $spacing-6;
  font-family: $font-signal;
  font-size: $font-size-md;
  font-weight: $font-weight-medium;
  line-height: 1;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: $transition-default;
  color: $color-paper;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    pointer-events: none;
  }

  // 手绘装饰角
  .corner {
    position: absolute;
    width: 8px;
    height: 8px;
    border-style: solid;
    border-color: $color-pulse;
    pointer-events: none;

    &.top-left {
      top: -2px;
      left: -2px;
      border-width: 2px 0 0 2px;
    }

    &.bottom-right {
      bottom: -2px;
      right: -2px;
      border-width: 0 2px 2px 0;
    }
  }

  // 主按钮（填充心跳色）
  &.variant-primary {
    background: $color-pulse;
    color: $color-void;
    @include handdrawn-border($color-pulse, 2px, 1px, 8px, false);

    &:hover:not(:disabled) {
      background: lighten($color-pulse, 8%);
      transform: translateY(-1px);
    }

    &:active,
    &.pressed {
      @include pressed-effect(2px);
    }
  }

  // 轮廓按钮（空心手绘线）
  &.variant-outline {
    background: transparent;
    border: 1px solid $color-pulse;
    color: $color-pulse;

    &:hover:not(:disabled) {
      background: rgba($color-pulse, 0.1);
    }

    &:active,
    &.pressed {
      background: rgba($color-pulse, 0.2);
    }
  }

  // 幽灵按钮（仅文本）
  &.variant-ghost {
    background: transparent;
    color: $color-mist;

    &:hover:not(:disabled) {
      color: $color-pulse;
    }

    &.pressed {
      color: $color-pulse;
    }
  }

  // 图标支持
  &.with-icon {
    padding-left: $spacing-4;

    .button-icon {
      display: inline-flex;
      align-items: center;
    }
  }
}
</style>
