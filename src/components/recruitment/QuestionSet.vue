<template>
  <div class="question-set" :class="{ 'page-enter': isPageEntered }">
    <!-- ========== 擦除转场：每道题独立卡片 ========== -->
    <transition :name="transitionName" mode="out-in" @before-leave="beforeLeave" @after-enter="afterEnter">
      <div v-if="currentQuestion" :key="'card-' + currentQuestionIndex" class="obs-card question-card">
        <!-- 进度条（移入卡片内部，确保不会被绝对定位的卡片遮盖） -->
        <div class="progress">
          <span class="mono label">校准进度</span>
          <div class="bar">
            <div class="fill" :style="{ width: progressWidth + '%' }"></div>
          </div>
          <span class="counter mono">{{ currentQuestionIndex + 1 }} / 5</span>
        </div>

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
  // ===== 修复：强制重置 store 问卷状态 =====
  store.$patch({
    currentQuestionIndex: 0,
    answers: [null, null, null, null, null],
    isQuizFinished: false
  });
  // 触发入场动画
  requestAnimationFrame(() => {
    isPageEntered.value = true;
  });
});

// ---------- 题目数据 ----------
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

// ---------- 导航锁 ----------
const isNavigating = ref(false);

// ========== 统一自动跳转控制器 ==========
const autoNextController = {
  timer: null,
  countdownTimer: null,
  startIndex: null,
  active: ref(false),
  countdown: ref(2),

  cancel() {
    if (this.timer) clearTimeout(this.timer);
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    this.timer = null;
    this.countdownTimer = null;
    this.startIndex = null;
    this.active.value = false;
    this.countdown.value = 2;
  },

  start(index, delay = 2000) {
    this.cancel(); // 总是先取消旧定时器
    this.startIndex = index;
    this.active.value = true;
    this.countdown.value = 2;

    this.countdownTimer = setInterval(() => {
      if (this.countdown.value > 0) this.countdown.value -= 1;
    }, 1000);

    this.timer = setTimeout(() => {
      if (this.startIndex === null) return;
      if (
          !isLastQuestion.value &&
          selectedOption.value !== null &&
          currentQuestionIndex.value === this.startIndex &&
          !isNavigating.value
      ) {
        goToNext();
      }
      this.cancel();
    }, delay);
  }
};

// 供模板使用的响应式状态
const isAutoTimerActive = computed(() => autoNextController.active.value);
const countdown = computed(() => autoNextController.countdown.value);

// ========== 打字机（setTimeout 链 + 唯一 ID 防护）=========
const typewriterTimer = ref(null);
let currentTypewriterId = 0; // 全局递增，用于终止旧打字机

const clearTypewriter = () => {
  if (typewriterTimer.value) {
    clearTimeout(typewriterTimer.value);
    typewriterTimer.value = null;
  }
  isTyping.value = false;
  // 递增ID，使任何正在进行的打字机回调自动失效
  currentTypewriterId++;
};

const typeWriter = (text) => {
  return new Promise((resolve) => {
    clearTypewriter(); // 清理旧打字机
    isTyping.value = true;
    displayComment.value = '';

    const typeId = ++currentTypewriterId; // 本次打字机的唯一ID
    const targetIndex = currentQuestionIndex.value; // 启动时的题目索引
    const chars = text.split('');
    let i = 0;

    const addChar = () => {
      // 校验：是否已被新的打字机覆盖 / 题目已切换
      if (typeId !== currentTypewriterId || targetIndex !== currentQuestionIndex.value) {
        isTyping.value = false;
        resolve();
        return;
      }

      if (i < chars.length) {
        displayComment.value += chars[i];
        i++;
        typewriterTimer.value = setTimeout(addChar, 40);
      } else {
        isTyping.value = false;
        typewriterTimer.value = null;
        resolve();
      }
    };

    addChar();
  });
};

// ========== 自动完成定时器（第五题延迟跳转）=========
const autoCompleteTimer = ref(null);

// ---------- 选项选择 ----------
const onSelect = async (idx) => {
  // 多重锁：已答、正在打字、自动跳转激活、导航中
  if (isAnswered.value || localAnswered.value || isTyping.value || isNavigating.value) return;
  if (selectedOption.value !== null) return;

  // 立即取消任何待执行的自动跳转
  autoNextController.cancel();

  // 波纹反馈
  rippleIndex.value = idx;
  setTimeout(() => {
    rippleIndex.value = null;
  }, 300);

  // 锁定本地状态
  localAnswered.value = true;
  selectedOption.value = idx;

  // ===== 修复：记录当前索引，防止 store 内部自动前进 =====
  const beforeIndex = currentQuestionIndex.value;
  store.selectAnswer(beforeIndex, idx);
  // 如果 store 自动修改了索引，立即回退（仅保留答案，不跳题）
  if (store.currentQuestionIndex !== beforeIndex && !isNavigating.value) {
    console.warn('🛑 store 自动跳转已被拦截');
    store.currentQuestionIndex = beforeIndex;
  }

  await playSound('select', 0.2);

  // 开始打字机
  const fullComment = currentQuestion.value.comments[idx];
  await typeWriter(fullComment);

  // 打字机结束后：如果是最后一题则延迟完成，否则启动自动跳转
  if (isLastQuestion.value) {
    autoCompleteTimer.value = setTimeout(() => {
      if (!isNavigating.value && selectedOption.value !== null) {
        store.completeQuiz();
      }
    }, 2000);
  } else {
    autoNextController.start(currentQuestionIndex.value, 2000);
  }
};

// ---------- 跳过等待，立即下一题 ----------
const skipAutoAndNext = () => {
  if (isNavigating.value || isLastQuestion.value) return;
  autoNextController.cancel();
  if (!isLastQuestion.value && selectedOption.value !== null) {
    goToNext();
  }
};

// ---------- 导航方法（强制步长=1，防重跳）----------
const goToNext = () => {
  if (isNavigating.value || isLastQuestion.value || selectedOption.value === null) return;

  const beforeIdx = currentQuestionIndex.value;
  const nextIdx = beforeIdx + 1;
  if (nextIdx >= questions.length) return;

  // 防御：如果目标索引已被其他操作设置，不再重复执行
  if (store.currentQuestionIndex === nextIdx) {
    console.warn('[goToNext] already at target index, skip');
    isNavigating.value = false;
    return;
  }

  isNavigating.value = true;
  autoNextController.cancel(); // 取消自动跳转
  clearTypewriter(); // 终止打字机

  store.currentQuestionIndex = nextIdx;

  // 延长锁释放时机，确保同一宏任务内无法再次调用
  setTimeout(() => {
    isNavigating.value = false;
  }, 0);
};

const goToPrev = () => {
  if (isNavigating.value || currentQuestionIndex.value <= 0) return;
  isNavigating.value = true;
  autoNextController.cancel();
  clearTypewriter();
  store.currentQuestionIndex = currentQuestionIndex.value - 1;
  playSound('select', 0.1);
  setTimeout(() => {
    isNavigating.value = false;
  }, 0);
};

const finishQuiz = () => {
  if (isNavigating.value) return;
  // 清除自动完成定时器，防止重复调用
  if (autoCompleteTimer.value) {
    clearTimeout(autoCompleteTimer.value);
    autoCompleteTimer.value = null;
  }
  store.completeQuiz();
};

// ---------- 监听题目索引变化（重置所有状态 + 跳跃矫正 + 答案残留清理）----------
watch(currentQuestionIndex, async (newIdx, oldIdx) => {
  // ----- 跳跃矫正：如果索引跨度大于1，强制回退到旧索引+1 -----
  if (oldIdx !== undefined && newIdx - oldIdx > 1) {
    console.warn(`索引跳跃异常: ${oldIdx} → ${newIdx}，已自动修正`);
    store.currentQuestionIndex = oldIdx + 1;
    return; // 修正后会再次触发 watch，无需继续执行
  }

  // 1. 强制终止所有异步任务
  autoNextController.cancel();
  clearTypewriter();

  // 2. 重置本地交互状态
  localAnswered.value = false;
  rippleIndex.value = null;
  isTyping.value = false;
  isNavigating.value = false;
  displayComment.value = ''; // 立即清空评论

  // 3. 从 store 恢复答案，同时清除历史残留答案
  const saved = answers.value[newIdx];
  selectedOption.value = saved !== null ? saved : null;

  if (saved !== null) {
    // 判断该答案是否为本次会话中刚刚选择的（通过 localAnswered 标记）
    if (!localAnswered.value) {
      // 不是刚刚选择的 -> 视为脏数据，清除 store 中的答案
      store.$patch((state) => {
        state.answers[newIdx] = null;
      });
      selectedOption.value = null;
      displayComment.value = '';
    } else {
      // 是刚刚选择的，直接显示完整点评（无打字机效果，不触发自动跳转）
      localAnswered.value = true; // 保持锁定状态
      await nextTick();
      displayComment.value = currentQuestion.value.comments[saved];
    }
  }
}, {immediate: true});

// ---------- 转场动画钩子 ----------
const transitionName = ref('wipe');
const beforeLeave = () => {
  autoNextController.cancel();
  clearTypewriter();
};
const afterEnter = () => {
  // 不需要额外逻辑，状态已在 watch 中恢复
};

// ---------- 组件卸载时完全清理 ----------
onBeforeUnmount(() => {
  autoNextController.cancel();
  clearTypewriter();
  if (autoCompleteTimer.value) {
    clearTimeout(autoCompleteTimer.value);
    autoCompleteTimer.value = null;
  }
});
</script>

<style lang="scss" scoped>
/* ===== 样式部分：完全保持原样，无任何修改 ===== */
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
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;

  &:hover {
    box-shadow: 0 0 32px rgba($color-heartbeat, 0.12);
  }

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
  height: 600px; // 固定高度，消除卡片高度跳动
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 820px;
  min-width: 600px;
  margin: 0 auto;
  position: relative; // 为内部绝对定位卡片提供参照

  opacity: 0;
  transform: scale(0.98);
  filter: blur(3px);
  animation: page-appear 0.8s $ease-drawer forwards;

  &.page-enter {
    opacity: 1;
    transform: scale(1);
    filter: blur(0);
  }

  @media (max-width: $bp-mobile) {
    min-width: auto;
    padding: 0 12px;
  }

  .obs-card {
    flex: 1; // 占据剩余高度
    overflow-y: auto; // 内部滚动
    position: relative !important; // 覆盖 transition 强加的 absolute
    height: auto; // 由 flex 决定
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

// ---------- 进度条（移入卡片内部）----------
.progress {
  display: flex;
  align-items: center;
  margin-bottom: 2rem; // 与卡片内容保持间距
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

// ========== 核心：从左到右擦除转场（改为透明度+位移，避免高度塌陷）==========
.wipe-enter-active,
.wipe-leave-active {
  transition: opacity 0.5s $ease-drawer, transform 0.5s $ease-drawer;
  position: absolute; // 卡片重叠，父容器固定高度保证不塌陷
  width: 100%;
  top: 0;
  left: 0;
}

.wipe-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.wipe-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.wipe-enter-to,
.wipe-leave-from {
  opacity: 1;
  transform: translateX(0);
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
