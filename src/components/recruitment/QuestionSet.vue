<template>
  <div class="question-set" :class="{ 'page-enter': isPageEntered }">
    <!-- 进度指示（带手绘纹理） -->
    <div class="progress">
      <span class="mono label">校准进度</span>
      <div class="bar">
        <div class="fill" :style="{ width: progressWidth + '%' }"></div>
      </div>
      <span class="counter mono">{{ currentIndex + 1 }} / 5</span>
    </div>

    <!-- 擦除转场：题目卡片 -->
    <transition :name="transitionName" mode="out-in" @before-leave="beforeLeave" @after-enter="afterEnter">
      <div v-if="currentQuestion" :key="currentIndex" class="obs-card question-card">
        <div class="question-header">
          <span class="question-number mono">{{ formattedIndex }}</span>
          <h3 class="hand-title">{{ currentQuestion.title }}</h3>
        </div>

        <!-- 选项区（手绘单选） -->
        <div class="options">
          <label
              v-for="(opt, idx) in currentQuestion.options"
              :key="idx"
              class="hand-radio"
              :class="{ disabled: isAnswered, selected: selectedOption === idx }"
          >
            <input
                type="radio"
                :name="'q' + currentIndex"
                :value="idx"
                v-model="selectedOption"
                @change="onSelect(idx)"
                :disabled="isAnswered"
            />
            <span class="radio-custom"></span>
            <span class="option-text">{{ opt }}</span>
          </label>
        </div>

        <!-- 点评区：选择后显示，带打字机动画 -->
        <div v-if="selectedOption !== null" class="comment-wrapper">
          <div ref="commentRef" class="comment typewriter" :class="{ typing: isTyping }">
            {{ displayComment }}
          </div>
        </div>

        <!-- 导航控制区（手绘按钮组） -->
        <div v-if="selectedOption !== null" class="nav-actions">
          <button
              v-if="currentIndex > 0"
              class="obs-button prev-btn"
              @click="goToPrev"
              :disabled="isAutoTimerActive"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            上一题
          </button>

          <div class="auto-hint" v-if="!isLastQuestion && !isAutoTimerActive">
            <span class="dot-pulse"></span>
            <span class="mono">2秒后自动校准</span>
          </div>

          <button
              v-if="!isLastQuestion"
              class="obs-button skip-btn"
              @click="skipAutoAndNext"
              :class="{ 'pulse-skip': isAutoTimerActive }"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M5 12h14m0 0l-4-4m4 4l-4 4"/>
            </svg>
            {{ isAutoTimerActive ? '立即继续' : '继续校准' }}
          </button>

          <button v-else class="obs-button finish-btn" @click="finishQuiz">
            完成校准
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import {computed, nextTick, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import {storeToRefs} from 'pinia';
import {useCalibrationStore} from '../../stores/calibration';
import {useAudio} from '../../composables/useAudio';

const store = useCalibrationStore();
const {playSound} = useAudio();
const {currentQuestionIndex, answers} = storeToRefs(store);

// ---------- 页面开始动画（手绘渐显）----------
const isPageEntered = ref(false);
onMounted(() => {
  // 延迟一帧触发，让CSS动画生效
  requestAnimationFrame(() => {
    isPageEntered.value = true;
  });
});

// ---------- 题目数据（与AGENTS.md完全一致）----------
const questions = [
  {
    title: '当我们在游戏里仰望距离地球 880 光年的 delta Cephei（造父四）时，我们看到的其实是？',
    options: ['A. 一颗表面温度 6000K 的黄超巨星。', 'B. 880 年前的过去。', 'C. 它是宇宙的灯塔，用来测量距离。', 'D. 只是天空的一张贴图。'],
    comments: [
      '选 A 是严谨的天文参数控。',
      '选 B 的人，懂“视界即历史”，这才是做太空歌剧需要的时空观。',
      '选 C 是实用主义者。',
      '选 D 的人需要再校准。'
    ]
  },
  {
    title: '如果我们将一个人的身体部件逐一替换成机械，最后连大脑记忆也全部数字化上传，原来的肉体销毁。现在的“他”，还是原来的“他”吗？',
    options: ['A. 是，因为记忆和思维逻辑完全延续了。', 'B. 不是，原来的他已经死了，这只是一个完美的复制品。', 'C. 无所谓，只要能活下去形式不重要。', 'D. 看法律怎么定义。'],
    comments: [
      'A 延续派，认同意识连续性。',
      '选 B 的人，能理解为什么你的男主会痛苦，为什么我们要寻找那 0KB 的龙骨。',
      'C 生存主义者。',
      'D 社会建构论者。'
    ]
  },
  {
    title: '为什么在大多数经典叙事中，“未完成的约定”往往比“大团圆结局”更让人念念不忘？',
    options: ['A. 因为人类有受虐倾向。', 'B. 因为“蔡格尼克效应”：大脑对未完成的任务记忆更深刻。', 'C. 因为遗憾是唯一能证明我们真的爱过的证据。', 'D. 因为悲剧更容易拿奖。'],
    comments: [
      'A 有点刻薄。',
      '选 B 是理性的产品经理/程序；',
      '选 C 是感性的文案/美术。这两个都得要。',
      'D 市场导向。'
    ]
  },
  {
    title: '在数字音乐采样率可以达到 192kHz 的今天，为什么我们还要在这个游戏中费力去模拟黑胶唱片的底噪和爆豆声（Crackle）？',
    options: ['A. 为了假装高端，提高售价。', 'B. 这种噪音是“不完美”的，而生命本身就是脏且不完美的。', 'C. 因为复古风现在是市场潮流。', 'D. 为了掩盖音频压缩的瑕疵。'],
    comments: [
      'A 营销视角。',
      '选 B 的人，才配去摸你的红轴键盘和黑胶唱机。',
      'C 趋势追随者。',
      'D 技术怀疑论。'
    ]
  },
  {
    title: 'AI 可以一秒钟生成一张完美的夕阳图，但它画不出“看着夕阳想起逝去亲人”的那种感觉。缺的是什么？',
    options: ['A. 算力还不够大，迟早能画出来。', 'B. 缺的是它自己“会死”的恐惧。', 'C. 缺的是随机性参数。', 'D. AI 画得挺好的啊，看不出区别。'],
    comments: [
      'A 未来主义者。',
      '选 B 的人，深刻理解了为什么“碳基生物”不可替代。',
      'C 技术还原论。',
      'D 审美失敏。'
    ]
  }
];

const currentQuestion = computed(() => questions[currentQuestionIndex.value]);
const formattedIndex = computed(() => (currentQuestionIndex.value + 1).toString().padStart(2, '0'));
const progressWidth = computed(() => ((currentQuestionIndex.value) / 5) * 100);
const isLastQuestion = computed(() => currentQuestionIndex.value === 4);

// ---------- 选中状态与自动跳转定时器 ----------
const selectedOption = ref(null);
const isAnswered = computed(() => answers.value[currentQuestionIndex.value] !== null);
const isAutoTimerActive = ref(false);
let autoTimer = null;

// 当前显示的评论（用于打字机逐字显示）
const displayComment = ref('');
const commentRef = ref(null);
const isTyping = ref(false);

// 切换题目时重置状态并恢复已选答案
watch(currentQuestionIndex, async () => {
  // 清除之前的定时器
  clearAutoTimer();
  // 恢复答案
  const saved = answers.value[currentQuestionIndex.value];
  selectedOption.value = saved !== null ? saved : null;
  displayComment.value = '';
  isTyping.value = false;
  // 如果该题已经答过，直接显示完整评论
  if (saved !== null) {
    await nextTick();
    displayComment.value = currentQuestion.value.comments[saved];
  }
}, {immediate: true});

// ---------- 选项选择 ----------
const onSelect = async (idx) => {
  if (isAnswered.value) return;
  selectedOption.value = idx;
  store.selectAnswer(currentQuestionIndex.value, idx);
  await playSound('select', 0.2);

  // 显示评论（打字机效果）
  const fullComment = currentQuestion.value.comments[idx];
  await typeWriter(fullComment);

  // 如果不是最后一题，启动2秒自动跳转
  if (!isLastQuestion.value) {
    startAutoNext();
  }
};

// 打字机逐字动画（手绘风格，非等宽但保留节奏）
const typeWriter = async (text) => {
  isTyping.value = true;
  displayComment.value = '';
  const chars = text.split('');
  for (let i = 0; i < chars.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 40)); // 每字40ms，模拟手写感
    displayComment.value += chars[i];
  }
  isTyping.value = false;
};

// ---------- 自动跳转定时器 ----------
const startAutoNext = () => {
  clearAutoTimer();
  isAutoTimerActive.value = true;
  autoTimer = setTimeout(() => {
    if (!isLastQuestion.value && selectedOption.value !== null) {
      goToNext();
    }
    isAutoTimerActive.value = false;
  }, 2000);
};

const clearAutoTimer = () => {
  if (autoTimer) {
    clearTimeout(autoTimer);
    autoTimer = null;
  }
  isAutoTimerActive.value = false;
};

// 跳过等待，立即下一题
const skipAutoAndNext = () => {
  clearAutoTimer();
  if (!isLastQuestion.value && selectedOption.value !== null) {
    goToNext();
  }
};

// ---------- 导航方法 ----------
const goToNext = () => {
  clearAutoTimer();
  store.nextQuestion();
};

const goToPrev = () => {
  clearAutoTimer();
  if (currentQuestionIndex.value > 0) {
    // 直接修改store的索引（兼容原有store）
    store.currentQuestionIndex--;
    // 播放轻微翻页音效（可选）
    playSound('select', 0.1);
  }
};

const finishQuiz = () => {
  store.completeQuiz();
};

// ---------- 转场动画钩子 ----------
const transitionName = ref('wipe');
const beforeLeave = () => {
  // 离开前若有定时器则清除，避免切换到新题后旧定时器触发
  clearAutoTimer();
};
const afterEnter = () => {
  // 进入动画完成后，如果当前题已答过，且非最后一题，可重新启动自动跳转？
  // 但为了符合“答完题才自动跳转”，已答题不再自动跳转
};

// ---------- 当所有题答完，触发觉醒 ----------
watch(answers, (newAns) => {
  if (newAns.every(a => a !== null)) {
    store.completeQuiz();
  }
}, {deep: true});

// 清理定时器
onBeforeUnmount(() => {
  clearAutoTimer();
});
</script>

<style lang="scss" scoped>
@import '../../styles/variables';
@import '../../styles/mixins';

$ease-spring: cubic-bezier(0.68, -0.55, 0.27, 1.55) !default;

// ---------- 手绘噪声卡片背景（继承AGENTS.md规范）----------
.obs-card {
  background: $color-dust;
  position: relative;
  @include noise-overlay(0.02, #000);
  box-shadow: 0 0 20px rgba($color-heartbeat, 0.08);
  border: 0.5px solid rgba($color-paper, 0.15);
  border-radius: 4px;
  padding: 2rem;
  transition: box-shadow 0.3s $ease-drawer;

  &:hover {
    box-shadow: 0 0 32px rgba($color-heartbeat, 0.12);
  }
}

// ---------- 页面开始动画（手绘晕影）----------
.question-set {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  opacity: 0;
  transform: scale(0.98);
  animation: page-appear 0.8s $ease-drawer forwards;
  filter: blur(2px);
  animation-fill-mode: forwards;

  &.page-enter {
    opacity: 1;
    transform: scale(1);
    filter: blur(0);
  }
}

@keyframes page-appear {
  0% {
    opacity: 0;
    transform: scale(0.98);
    filter: blur(3px);
  }
  100% {
    opacity: 1;
    transform: scale(1);
    filter: blur(0);
  }
}

// ---------- 进度条（手绘细线）----------
.progress {
  display: flex;
  align-items: center;
  margin-bottom: 2.5rem;
  color: $color-mist;
  font-size: 0.85rem;
  letter-spacing: 0.1em;

  .label {
    font-family: $font-mono;
    text-transform: uppercase;
    opacity: 0.7;
  }

  .bar {
    flex: 1;
    height: 1px;
    background: rgba($color-paper, 0.2);
    margin: 0 1.2rem;
    position: relative;
    overflow: hidden;

    .fill {
      height: 100%;
      background: $color-heartbeat;
      transition: width 0.4s $ease-drawer;
      box-shadow: 0 0 8px $color-heartbeat;
    }
  }

  .counter {
    font-family: $font-mono;
    color: $color-paper;
    background: rgba($color-heartbeat, 0.1);
    padding: 0.2rem 0.6rem;
    border-radius: 12px;
    font-size: 0.8rem;
    border: 0.5px solid rgba($color-heartbeat, 0.3);
  }
}

// ---------- 题目头部 ----------
.question-header {
  margin-bottom: 2rem;
  position: relative;

  .question-number {
    display: inline-block;
    color: $color-heartbeat;
    font-size: 1rem;
    margin-bottom: 0.75rem;
    font-family: $font-mono;
    border-bottom: 1px dashed $color-heartbeat;
    padding-bottom: 0.25rem;
    letter-spacing: 0.15em;
  }

  h3 {
    font-size: 1.6rem;
    line-height: 1.5;
    font-weight: 400;
    font-family: $font-serif;
    color: $color-paper;
    margin-top: 0.5rem;
    text-shadow: 0 0 10px rgba($color-paper, 0.05);

    @media (max-width: $bp-mobile) {
      font-size: 1.3rem;
    }
  }
}

// ---------- 选项（手绘单选）----------
.options {
  margin-bottom: 2rem;

  .hand-radio {
    display: flex;
    align-items: flex-start;
    margin-bottom: 1rem;
    padding: 0.75rem 1rem;
    transition: all 0.2s $ease-drawer;
    border-radius: 4px;
    border: 0.5px solid transparent;
    position: relative;
    cursor: pointer;

    &:hover {
      background: rgba($color-heartbeat, 0.05);
      border-color: rgba($color-heartbeat, 0.2);
    }

    &.disabled {
      opacity: 0.55;
      pointer-events: none;
      filter: grayscale(0.6);
    }

    &.selected {
      background: rgba($color-heartbeat, 0.08);
      border-left: 3px solid $color-heartbeat;
    }

    input[type="radio"] {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .radio-custom {
      display: inline-block;
      width: 18px;
      height: 18px;
      border: 1.5px solid $color-mist;
      border-radius: 50%;
      margin-right: 12px;
      flex-shrink: 0;
      position: relative;
      top: 2px;
      transition: all 0.15s $ease-drawer;
      background: transparent;

      &::after {
        content: '';
        position: absolute;
        top: 4px;
        left: 4px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: $color-heartbeat;
        opacity: 0;
        transform: scale(0.2);
        transition: all 0.15s $ease-spring;
      }
    }

    input[type="radio"]:checked + .radio-custom {
      border-color: $color-heartbeat;

      &::after {
        opacity: 1;
        transform: scale(1);
      }
    }

    .option-text {
      font-family: $font-hand;
      font-size: 1.1rem;
      line-height: 1.5;
      color: $color-paper;
      flex: 1;
    }
  }
}

// ---------- 点评区域（打字机逐字）----------
.comment-wrapper {
  margin: 2rem 0 1.5rem;
  padding-top: 1.2rem;
  border-top: 1px dashed rgba($color-heartbeat, 0.4);
  position: relative;

  &::before {
    content: '✧';
    position: absolute;
    top: -0.7rem;
    left: 1rem;
    background: $color-dust;
    color: $color-heartbeat;
    padding: 0 0.5rem;
    font-size: 0.9rem;
  }
}

.comment {
  font-family: $font-hand;
  font-style: italic;
  color: lighten($color-mist, 15%);
  font-size: 1.05rem;
  line-height: 1.6;
  padding: 0.2rem 0.5rem;
  white-space: pre-wrap;
  word-break: break-word;
  border-left: 2px solid rgba($color-heartbeat, 0.3);
  padding-left: 1rem;

  &.typing {
    &::after {
      content: '|';
      display: inline-block;
      animation: blink-caret 0.8s infinite;
      color: $color-heartbeat;
      font-weight: 400;
      margin-left: 2px;
    }
  }
}

@keyframes blink-caret {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

// ---------- 导航按钮组（手绘风格）----------
.nav-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2rem;
  flex-wrap: wrap;
  gap: 1rem;

  .obs-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: transparent;
    border: 1px solid rgba($color-paper, 0.3);
    color: $color-paper;
    padding: 0.6rem 1.4rem;
    font-family: $font-hand;
    font-size: 0.95rem;
    transition: all 0.2s $ease-drawer;
    cursor: pointer;
    border-radius: 30px;

    svg {
      stroke: $color-paper;
    }

    &:hover {
      border-color: $color-heartbeat;
      background: rgba($color-heartbeat, 0.08);
      color: $color-paper;
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(1px);
    }

    &.prev-btn {
      border-style: dashed;
    }

    &.skip-btn {
      border-color: rgba($color-heartbeat, 0.6);
      color: $color-heartbeat;

      svg {
        stroke: $color-heartbeat;
      }
    }

    &.finish-btn {
      border-color: $color-signal;
      color: $color-signal;

      svg {
        stroke: $color-signal;
      }
    }
  }

  .auto-hint {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: $color-mist;
    font-size: 0.8rem;
    background: rgba(0, 0, 0, 0.3);
    padding: 0.3rem 0.8rem;
    border-radius: 40px;
    border: 0.5px solid rgba($color-heartbeat, 0.2);

    .dot-pulse {
      width: 8px;
      height: 8px;
      background: $color-signal;
      border-radius: 50%;
      animation: pulse-dot 1.2s $ease-pulse infinite;
    }
  }
}

@keyframes pulse-dot {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.9);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

// ---------- 从左到右擦除转场（核心！）----------
.wipe-enter-active,
.wipe-leave-active {
  transition: clip-path 1s $ease-drawer, opacity 0.6s $ease-drawer;
  position: absolute;
  width: 100%;
}

.wipe-enter-from {
  clip-path: inset(0 100% 0 0); /* 右边完全裁剪，从右向左展开 */
  opacity: 0;
}

.wipe-leave-to {
  clip-path: inset(0 0 0 100%); /* 左边完全裁剪，从左向右擦除 */
  opacity: 0;
}

.wipe-enter-to,
.wipe-leave-from {
  clip-path: inset(0 0 0 0);
  opacity: 1;
}

// 确保卡片在转场时正确堆叠
.question-card {
  transition: all 0.2s;
}

// 小屏适配
@media (max-width: $bp-mobile) {
  .obs-card {
    padding: 1.5rem;
  }
  .nav-actions {
    flex-direction: column;
    align-items: stretch;

    .obs-button {
      justify-content: center;
    }
  }
}
</style>
