<template>
  <div class="question-set" :class="{ 'page-enter': isPageEntered }">
    <!-- 进度条（蚀刻细线） -->
    <div class="progress">
      <span class="mono label">校准进度</span>
      <div class="bar">
        <div class="fill" :style="{ width: progressWidth + '%' }"></div>
      </div>
      <span class="counter mono">{{ currentQuestionIndex + 1 }} / 5</span>
    </div>

    <!-- ========== 擦除转场：每道题独立卡片 ========== -->
    <transition :name="transitionName" mode="out-in" @before-leave="beforeLeave" @after-enter="afterEnter">
      <div v-if="currentQuestion" :key="'card-' + currentQuestionIndex" class="obs-card question-card">
        <!-- 卡片头部 -->
        <div class="question-header">
          <span class="question-number mono">{{ formattedIndex }}</span>
          <h3 class="hand-title">{{ currentQuestion.title }}</h3>
        </div>

        <!-- 选项区（手绘单选 + 波纹反馈） -->
        <div class="options">
          <label
              v-for="(opt, idx) in currentQuestion.options"
              :key="idx"
              class="hand-radio"
              :class="{
              disabled: isAnswered || localAnswered,
              selected: selectedOption === idx,
              'ripple-active': rippleIndex === idx
            }"
              @click="onSelect(idx)"
          >
            <input
                type="radio"
                :name="'q' + currentQuestionIndex"
                :value="idx"
                v-model="selectedOption"
                :disabled="isAnswered || localAnswered"
            />
            <span class="radio-custom"></span>
            <span class="option-text">{{ opt }}</span>
          </label>
        </div>

        <!-- ===== 点评区：必现，打字机 ===== -->
        <div v-if="selectedOption !== null" class="comment-wrapper">
          <div class="comment-marker">✧ 观测笔记</div>
          <div ref="commentRef" class="comment typewriter" :class="{ typing: isTyping }">
            {{ displayComment }}
          </div>
        </div>

        <!-- ===== 导航控制区 ===== -->
        <div v-if="selectedOption !== null" class="nav-actions">
          <!-- 上一题 -->
          <button v-if="currentQuestionIndex > 0" class="obs-button prev-btn" @click="goToPrev">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            上一题
          </button>

          <!-- 自动跳转倒计时（仅当自动跳转激活） -->
          <div v-if="!isLastQuestion && isAutoTimerActive" class="auto-hint">
            <span class="dot-pulse"></span>
            <span class="mono">校准倒计时 {{ countdown }}s</span>
          </div>

          <!-- 立即继续 / 跳过等待 -->
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

          <!-- 最后一题：完成按钮 -->
          <button v-else class="obs-button finish-btn" @click="finishQuiz">
            完成校准
          </button>
        </div>

        <!-- 纸张磨损装饰 -->
        <div class="paper-tear-top"></div>
        <div class="paper-tear-bottom"></div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import {computed, nextTick, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import {storeToRefs} from 'pinia';
import {useCalibrationStore} from '@/stores/calibration.js';
import {useAudio} from '@/composables/useAudio.js';

const store = useCalibrationStore();
const {playSound} = useAudio();
const {currentQuestionIndex, answers} = storeToRefs(store);

// ---------- 页面入场动画 ----------
const isPageEntered = ref(false);
onMounted(() => {
  requestAnimationFrame(() => {
    isPageEntered.value = true;
  });
});

// ---------- 题目数据（与AGENTS.md一致）----------
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
const progressWidth = computed(() => (currentQuestionIndex.value / 5) * 100);
const isLastQuestion = computed(() => currentQuestionIndex.value === 4);

// ---------- 交互状态 ----------
const selectedOption = ref(null);
const isAnswered = computed(() => answers.value[currentQuestionIndex.value] !== null);
const displayComment = ref('');
const isTyping = ref(false);
const rippleIndex = ref(null);
const localAnswered = ref(false); // 本地锁，防止重复点击

// ---------- 导航锁，防止重复跳转 ----------
const isNavigating = ref(false);

// ---------- 自动跳转定时器（完全受控）----------
const isAutoTimerActive = ref(false);
const countdown = ref(2);
let autoTimer = null;
let countdownInterval = null;
// 存储启动定时器时的题目索引，用于防止过时跳转
let timerStartIndex = null;

// 清除所有定时器（组件卸载或离开题目时强制清理）
const clearAutoTimer = () => {
  if (autoTimer) {
    clearTimeout(autoTimer);
    autoTimer = null;
  }
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  isAutoTimerActive.value = false;
  countdown.value = 2;
  timerStartIndex = null;
};

// 启动自动跳转（仅在点评完全显示后调用一次）
const startAutoNext = () => {
  if (isLastQuestion.value) return;
  clearAutoTimer(); // 确保没有残留定时器
  isAutoTimerActive.value = true;
  countdown.value = 2;
  timerStartIndex = currentQuestionIndex.value; // 记录当前索引

  countdownInterval = setInterval(() => {
    countdown.value -= 1;
    if (countdown.value <= 0) {
      clearInterval(countdownInterval);
      countdown.value = 0;
    }
  }, 1000);

  autoTimer = setTimeout(() => {
    // 只有当前索引与启动时一致，且没有正在导航，且不是最后一题，才执行跳转
    if (
        !isLastQuestion.value &&
        selectedOption.value !== null &&
        currentQuestionIndex.value === timerStartIndex &&
        !isNavigating.value
    ) {
      goToNext();
    }
    clearAutoTimer(); // 跳转后清理（或条件不满足时清理）
  }, 2000);
};

// 跳过等待，立即下一题
const skipAutoAndNext = () => {
  if (isNavigating.value || isLastQuestion.value) return;
  clearAutoTimer();
  if (!isLastQuestion.value && selectedOption.value !== null) {
    goToNext();
  }
};

// ---------- 切换题目时重置状态（不自动启动任何定时器）----------
watch(currentQuestionIndex, async (newIdx, oldIdx) => {
  clearAutoTimer();               // 离开旧题时强制清除定时器
  localAnswered.value = false;    // 重置本地锁
  rippleIndex.value = null;
  isTyping.value = false;
  isNavigating.value = false;    // 重置导航锁

  // 恢复已选答案（如果有）
  const saved = answers.value[newIdx];
  selectedOption.value = saved !== null ? saved : null;
  displayComment.value = '';

  if (saved !== null) {
    // 已答题：直接显示完整评论，不自动跳转
    await nextTick();
    displayComment.value = currentQuestion.value.comments[saved];
    localAnswered.value = true;   // 标记本地已答
  }
}, {immediate: true});

// ---------- 选项选择：严格的防重复锁 ----------
const onSelect = async (idx) => {
  // 禁止：已答过、本地已锁、正在打字、自动跳转激活时、正在导航
  if (isAnswered.value || localAnswered.value || isTyping.value || isAutoTimerActive.value || isNavigating.value) return;
  if (selectedOption.value !== null) return; // 已经选过

  // 立即清除可能残留的旧定时器，确保全新选择
  clearAutoTimer();

  // 波纹反馈
  rippleIndex.value = idx;
  setTimeout(() => {
    rippleIndex.value = null;
  }, 300);

  // 锁定，防止重复触发
  localAnswered.value = true;
  selectedOption.value = idx;
  store.selectAnswer(currentQuestionIndex.value, idx);
  await playSound('select', 0.2);

  // 打字机显示完整点评
  const fullComment = currentQuestion.value.comments[idx];
  await typeWriter(fullComment);

  // 点评结束后，自动跳转（仅非最后一题）
  if (!isLastQuestion.value) {
    startAutoNext();
  }
};

// 打字机逐字动画（40ms/字）
const typeWriter = (text) => {
  return new Promise((resolve) => {
    isTyping.value = true;
    displayComment.value = '';
    const chars = text.split('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < chars.length) {
        displayComment.value += chars[i];
        i++;
      } else {
        clearInterval(interval);
        isTyping.value = false;
        resolve();
      }
    }, 40);
  });
};

// ---------- 导航方法 ----------
const goToNext = () => {
  if (isNavigating.value || isLastQuestion.value) return;
  isNavigating.value = true;
  clearAutoTimer();               // 主动跳转时清理定时器
  store.nextQuestion();
  // nextQuestion 会触发 currentQuestionIndex 的 watcher，其中会将 isNavigating 重置为 false
  // 但为了保险，在异步完成后重置
  nextTick(() => {
    isNavigating.value = false;
  });
};

const goToPrev = () => {
  if (isNavigating.value || currentQuestionIndex.value <= 0) return;
  isNavigating.value = true;
  clearAutoTimer();               // 返回上一题时清理
  store.currentQuestionIndex--;
  playSound('select', 0.1);
  nextTick(() => {
    isNavigating.value = false;
  });
};

const finishQuiz = () => {
  if (isNavigating.value) return;
  store.completeQuiz();
};

// ---------- 转场动画钩子（确保动画过程中无定时器干扰）----------
const transitionName = ref('wipe');
const beforeLeave = () => {
  clearAutoTimer();              // 离开动画开始前，强制清除所有定时器
};
const afterEnter = () => {
  // 进入新题后，无需额外操作（状态已在 watch 中恢复）
};

// ---------- 全部答完自动觉醒 ----------
watch(answers, (newAns) => {
  if (newAns.every((a) => a !== null)) {
    store.completeQuiz();
  }
}, {deep: true});

// 组件卸载时清理
onBeforeUnmount(() => {
  clearAutoTimer();
});
</script>

<style lang="scss" scoped>
// ----- 全局变量后备（确保独立运行）-----
$color-void: #0a0c0e !default;
$color-dust: #1a1e24 !default;
$color-heartbeat: #ff6b35 !default;
$color-paper: #f5f1e8 !default;
$color-mist: #a0a9b2 !default;
$color-signal: #ff8c5a !default;
$font-mono: 'JetBrains Mono', monospace !default;
$font-serif: 'Source Serif 4', serif !default;
$font-hand: 'Switzer', sans-serif !default;
$ease-drawer: cubic-bezier(0.22, 0.98, 0.5, 1.02) !default;
$ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1) !default;
$bp-mobile: 768px !default;

// 噪声纹理混合宏（纯CSS）
@mixin noise-overlay($opacity: 0.02, $color: #000) {
  position: relative;
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    background-image: repeating-radial-gradient(
            circle at 20% 30%,
            rgba($color, 0.1) 0px,
            transparent 1px,
            transparent 2px
    ),
    repeating-radial-gradient(
            circle at 80% 70%,
            rgba($color, 0.08) 0px,
            transparent 2px,
            transparent 3px
    );
    background-size: 4px 4px, 6px 6px;
    opacity: $opacity;
    mix-blend-mode: overlay;
  }
}

// ---------- 观测卡片（旧纸纹理）----------
.obs-card {
  background: $color-dust;
  @include noise-overlay(0.03, #000);
  box-shadow: 0 0 20px rgba($color-heartbeat, 0.08);
  border: 0.5px solid rgba($color-paper, 0.2);
  border-radius: 4px;
  padding: 2.5rem;
  transition: box-shadow 0.3s $ease-drawer;
  // 不设置 position，由动画类接管绝对定位
  overflow: hidden;

  &:hover {
    box-shadow: 0 0 32px rgba($color-heartbeat, 0.12);
  }

  // 手绘磨损边缘
  .paper-tear-top,
  .paper-tear-bottom {
    position: absolute;
    left: 0;
    width: 100%;
    height: 6px;
    background: repeating-linear-gradient(
            90deg,
            rgba($color-paper, 0.1) 0px,
            rgba($color-paper, 0.1) 2px,
            transparent 2px,
            transparent 6px
    );
    pointer-events: none;
  }

  .paper-tear-top {
    top: -3px;
  }

  .paper-tear-bottom {
    bottom: -3px;
  }
}

// ---------- 页面入场动画（手绘晕影）----------
.question-set {
  width: 100%;
  max-width: 820px;
  margin: 0 auto;
  opacity: 0;
  transform: scale(0.98);
  filter: blur(3px);
  animation: page-appear 0.8s $ease-drawer forwards;
  position: relative; // 为绝对定位的过渡元素提供容器

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

// ---------- 进度条 ----------
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
    background: rgba($color-paper, 0.15);
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
    padding: 0.2rem 0.8rem;
    border-radius: 30px;
    font-size: 0.8rem;
    border: 0.5px solid rgba($color-heartbeat, 0.3);
  }
}

// ---------- 题目头部 ----------
.question-header {
  margin-bottom: 2rem;

  .question-number {
    display: inline-block;
    color: $color-heartbeat;
    font-size: 0.95rem;
    margin-bottom: 0.75rem;
    font-family: $font-mono;
    border-bottom: 1px dashed $color-heartbeat;
    padding-bottom: 0.25rem;
    letter-spacing: 0.2em;
  }

  h3 {
    font-size: 1.7rem;
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

// ---------- 手绘单选 ----------
.options {
  margin-bottom: 2rem;

  .hand-radio {
    display: flex;
    align-items: flex-start;
    margin-bottom: 0.8rem;
    padding: 0.9rem 1.2rem;
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

    &.ripple-active {
      background: rgba($color-heartbeat, 0.15);
    }

    input[type='radio'] {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .radio-custom {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 1.5px solid $color-mist;
      border-radius: 50%;
      margin-right: 14px;
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
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: $color-heartbeat;
        opacity: 0;
        transform: scale(0.2);
        transition: all 0.15s $ease-spring;
      }
    }

    input[type='radio']:checked + .radio-custom {
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
      letter-spacing: 0.02em;
    }
  }
}

// ---------- 点评区（打字机）----------
.comment-wrapper {
  margin: 2rem 0 1.5rem;
  padding: 1.2rem 1.5rem;
  background: rgba($color-void, 0.3);
  border-left: 3px solid $color-heartbeat;
  position: relative;
  @include noise-overlay(0.01, $color-heartbeat);

  .comment-marker {
    position: absolute;
    top: -0.6rem;
    left: 1rem;
    background: $color-dust;
    color: $color-heartbeat;
    padding: 0 0.6rem;
    font-size: 0.75rem;
    font-family: $font-mono;
    text-transform: uppercase;
    letter-spacing: 0.2em;
  }
}

.comment {
  font-family: $font-hand;
  font-style: italic;
  color: lighten($color-mist, 18%);
  font-size: 1.05rem;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;

  &.typing::after {
    content: '|';
    display: inline-block;
    animation: blink-caret 0.8s infinite;
    color: $color-heartbeat;
    margin-left: 2px;
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

// ---------- 导航按钮 ----------
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
    padding: 0.7rem 1.6rem;
    font-family: $font-hand;
    font-size: 0.95rem;
    transition: all 0.2s $ease-drawer;
    cursor: pointer;
    border-radius: 40px;
    letter-spacing: 0.05em;

    svg {
      stroke: $color-paper;
      width: 18px;
      height: 18px;
    }

    &:hover {
      border-color: $color-heartbeat;
      background: rgba($color-heartbeat, 0.08);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(1px);
    }

    &.prev-btn {
      border-style: dashed;
    }

    &.skip-btn {
      border-color: rgba($color-heartbeat, 0.7);
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
    gap: 0.6rem;
    color: $color-mist;
    font-size: 0.85rem;
    background: rgba(0, 0, 0, 0.5);
    padding: 0.4rem 1.2rem;
    border-radius: 40px;
    border: 0.5px solid rgba($color-heartbeat, 0.3);
    backdrop-filter: blur(2px);

    .dot-pulse {
      width: 8px;
      height: 8px;
      background: $color-signal;
      border-radius: 50%;
      animation: pulse-dot 1.2s infinite;
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

// ========== 核心：从左到右擦除转场（1秒，抽屉缓动）==========
.wipe-enter-active,
.wipe-leave-active {
  transition: clip-path 1s $ease-drawer, opacity 0.8s $ease-drawer;
  position: absolute !important; // 强制脱离文档流，与父容器相对定位配合
  width: 100%;
}

.wipe-enter-from {
  clip-path: inset(0 0 0 100%);
  opacity: 0;
}

.wipe-leave-to {
  clip-path: inset(0 100% 0 0);
  opacity: 0;
}

.wipe-enter-to,
.wipe-leave-from {
  clip-path: inset(0 0 0 0);
  opacity: 1;
}

// 卡片本身不再设置 position，由过渡类接管
.question-card {
  // 无 position 设置，由 .wipe-* 中的 absolute 控制
}

// ---------- 移动端适配 ----------
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
  .comment {
    font-size: 0.95rem;
  }
}
</style>
