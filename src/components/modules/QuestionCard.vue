<template>
  <div class="question-card handdrawn">
    <!-- 左侧手绘插图 -->
    <div class="question-illustration">
      <HandDrawnSVG :name="question.illustration" class="illustration-svg"/>
    </div>
    <!-- 右侧题目与选项 -->
    <div class="question-content">
      <h3 class="question-title">{{ question.title }}</h3>
      <div class="options">
        <div
            v-for="opt in question.options"
            :key="opt.value"
            class="option-item"
            :class="{
            selected: selectedAnswer === opt.value,
            disabled: isAnswered
          }"
            @click="!isAnswered && handleSelect(opt.value)"
        >
          <span class="option-marker">{{ opt.value }}</span>
          <span class="option-text">{{ opt.text }}</span>
        </div>
      </div>
      <!-- 点评文字 -->
      <div v-if="isAnswered && comment" class="comment handwritten">
        {{ comment }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import HandDrawnSVG from '@/components/core/HandDrawnSVG.vue'

defineProps<{
  question: {
    title: string
    options: Array<{ value: string; text: string }>
    illustration: string
  }
  selectedAnswer: string
  isAnswered: boolean
  comment: string
}>()

const emit = defineEmits<{
  (e: 'select', value: string): void
}>()

const handleSelect = (value: string) => {
  emit('select', value)
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.question-card {
  display: flex;
  gap: $spacing-8;
  align-items: flex-start;
  background: rgba($color-dust, 0.4);
  padding: $spacing-6;
  border: 1px dashed $color-mist;
  @include handdrawn-border($color-paper, 1px, 1px, 8px, true);

  .question-illustration {
    flex: 0 0 200px;

    svg {
      width: 100%;
      height: auto;
      @include handdrawn-svg;
    }
  }

  .question-content {
    flex: 1;
  }

  .question-title {
    font-family: $font-signal;
    font-size: $font-size-lg;
    margin-bottom: $spacing-5;
    color: $color-paper;
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: $spacing-3;
  }

  .option-item {
    display: flex;
    align-items: baseline;
    gap: $spacing-3;
    padding: $spacing-2 $spacing-3;
    border: 1px solid rgba($color-paper, 0.3);
    cursor: pointer;
    transition: $transition-default;
    font-size: $font-size-base;
    color: $color-paper;

    &:hover:not(.selected):not(.disabled) {
      border-color: $color-pulse;
      background: rgba($color-pulse, 0.05);
    }

    &.selected {
      border-color: $color-pulse;
      background: rgba($color-pulse, 0.1);
      box-shadow: 0 0 12px rgba($color-pulse, 0.2);
    }

    &.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .option-marker {
      font-family: $font-mono;
      font-weight: $font-weight-bold;
      color: $color-pulse;
      width: 24px;
      text-align: center;
    }
  }

  .comment {
    margin-top: $spacing-6;
    padding-top: $spacing-4;
    border-top: 1px dashed $color-mist;
    color: $color-mist;
    font-size: $font-size-sm;
    font-style: italic;
  }
}

// 响应式调整
@media (max-width: $breakpoint-md) {
  .question-card {
    flex-direction: column;

    .question-illustration {
      flex: 0 0 auto;
      width: 100%;
      max-width: 200px;
      margin: 0 auto;
    }
  }
}
</style>
