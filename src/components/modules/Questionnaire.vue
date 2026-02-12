<template>
  <div class="questionnaire">
    <!-- 相位指示器（频率刻度盘 + 波长锁定条） -->
    <div class="phase-indicators">
      <FrequencyDial
          :current-index="currentIndex"
          :total="5"
          @select="setCurrentQuestion"
      />
      <WavelengthLock :percentage="wavelengthLocked"/>
    </div>

    <!-- 题目卡片容器，带过渡动画 -->
    <div class="question-container">
      <transition :name="transitionDirection" mode="out-in">
        <QuestionCard
            :key="currentIndex"
            :question="questions[currentIndex]"
            :selected-answer="getAnswer(currentIndex)"
            :is-answered="isAnswered(currentIndex)"
            :comment="currentComment"
            @select="(value) => selectAnswer(currentIndex, value)"
        />
      </transition>

      <!-- 导航箭头（仅当有未答题） -->
      <div v-if="!allAnswered" class="question-nav">
        <button
            class="nav-prev"
            :disabled="currentIndex === 0"
            @click="prevQuestion"
        >
          ←
        </button>
        <button
            class="nav-next"
            :disabled="currentIndex === questions.length - 1"
            @click="nextQuestion"
        >
          →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {useSignalStore} from '@/stores/signal'
import {useAudioContext} from '@/composables/useAudioContext'
import FrequencyDial from '@/components/modules/FrequencyDial.vue'
import WavelengthLock from '@/components/modules/WavelengthLock.vue'
import QuestionCard from '@/components/modules/QuestionCard.vue'

// 题目数据（与之前一致）
const questions = [
  {
    title: '【天文】关于「距离与时间」',
    options: [
      {value: 'A', text: '一颗表面温度 6000K 的黄超巨星。'},
      {value: 'B', text: '880 年前的过去。'},
      {value: 'C', text: '它是宇宙的灯塔，用来测量距离。'},
      {value: 'D', text: '只是天空的一张贴图。'}
    ],
    illustration: 'astronomy'
  },
  // ... 其余四题略，保持与之前相同
]

const commentMap: Record<number, Record<string, string>> = {
  0: {B: '选 B 的人，懂“视界即历史”，这才是做太空歌剧需要的时空观。'},
  1: {B: '选 B 的人，能理解为什么你的男主会痛苦，为什么我们要寻找那 0KB 的龙骨。'},
  2: {B: '选 B 是理性的产品经理/程序；遗憾是大脑的记忆机制。', C: '选 C 是感性的文案/美术；遗憾是爱过的证据。'},
  3: {B: '选 B 的人，才配去摸你的红轴键盘和黑胶唱机。'},
  4: {B: '选 B 的人，深刻理解了为什么“碳基生物”不可替代。'}
}

const signalStore = useSignalStore()
const {playLock} = useAudioContext()

const currentIndex = computed(() => signalStore.currentQuestionIndex)
const wavelengthLocked = computed(() => signalStore.wavelengthLocked)
const getAnswer = (idx: number) => signalStore.getAnswer(idx)
const isAnswered = (idx: number) => signalStore.isAnswered(idx)
const allAnswered = computed(() => signalStore.allAnswered)

const currentComment = computed(() => {
  const idx = currentIndex.value
  const ans = getAnswer(idx)
  if (!ans) return ''
  return commentMap[idx]?.[ans] || '你的选择已记录。'
})

const selectAnswer = (index: number, value: string) => {
  if (isAnswered(index)) return
  playLock?.()
  signalStore.selectAnswer(index, value)
}

const setCurrentQuestion = (index: number) => {
  signalStore.setCurrentQuestion(index)
}

const nextQuestion = () => signalStore.nextQuestion()
const prevQuestion = () => signalStore.prevQuestion()

// 过渡方向
const transitionDirection = ref('slide-right')
watch(currentIndex, (newIdx, oldIdx) => {
  transitionDirection.value = newIdx > oldIdx ? 'slide-left' : 'slide-right'
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.questionnaire {
  padding: $spacing-8 0;
}

.phase-indicators {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-10;
  flex-wrap: wrap;
}

.question-container {
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
}

.question-nav {
  display: flex;
  justify-content: space-between;
  margin-top: $spacing-6;

  button {
    background: none;
    border: 1px solid $color-paper;
    color: $color-paper;
    width: 40px;
    height: 40px;
    font-size: $font-size-xl;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.7;
    transition: $transition-default;
    cursor: pointer;

    &:hover:not(:disabled) {
      background: $color-pulse;
      border-color: $color-pulse;
      color: $color-void;
    }

    &:disabled {
      opacity: 0.2;
      cursor: not-allowed;
    }
  }
}
</style>
