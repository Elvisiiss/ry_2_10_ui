<template>
  <div class="question-set">
    <!-- 进度指示 -->
    <div class="progress">
      <span class="mono">校准进度</span>
      <div class="bar">
        <div class="fill" :style="{ width: progressWidth + '%' }"></div>
      </div>
      <span class="counter">{{ currentIndex + 1 }} / 5</span>
    </div>

    <!-- 题目卡片（单题） -->
    <transition name="slide" mode="out-in">
      <div v-if="currentQuestion" :key="currentIndex" class="obs-card question-card">
        <div class="question-header">
          <span class="question-number mono">{{ formattedIndex }}</span>
          <h3 class="hand-title">{{ currentQuestion.title }}</h3>
        </div>

        <div class="options">
          <label v-for="(opt, idx) in currentQuestion.options"
                 :key="idx"
                 class="hand-radio"
                 :class="{ disabled: isAnswered }">
            <input type="radio"
                   :name="'q' + currentIndex"
                   :value="idx"
                   v-model="selectedOption"
                   @change="onSelect(idx)"
                   :disabled="isAnswered">
            <span class="radio-custom"></span>
            <span class="option-text">{{ opt }}</span>
          </label>
        </div>

        <!-- 点评区域（选择后显示） -->
        <div v-if="selectedOption !== null" class="comment typewriter">
          {{ currentQuestion.comments[selectedOption] }}
        </div>

        <!-- 继续按钮（非最后一题显示） -->
        <button v-if="selectedOption !== null && currentIndex < 4"
                class="obs-button next-btn"
                @click="goToNext">
          继续校准
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import {computed, ref, watch} from 'vue';
import {storeToRefs} from 'pinia';
import {useCalibrationStore} from '../../stores/calibration';
import {useAudio} from '../../composables/useAudio';

const store = useCalibrationStore();
const {playSound} = useAudio();
const {currentQuestionIndex, answers} = storeToRefs(store);

const selectedOption = ref(null);
const isAnswered = computed(() => answers.value[currentQuestionIndex.value] !== null);

// 题目数据（完整）
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
const formattedIndex = computed(() => {
  return (currentQuestionIndex.value + 1).toString().padStart(2, '0');
});
const progressWidth = computed(() => ((currentQuestionIndex.value) / 5) * 100);

// 监听当前题目索引变化，重置选中状态
watch(currentQuestionIndex, () => {
  const saved = answers.value[currentQuestionIndex.value];
  selectedOption.value = saved !== null ? saved : null;
});

// 选择答案
const onSelect = async (idx) => {
  if (isAnswered.value) return;
  selectedOption.value = idx;
  store.selectAnswer(currentQuestionIndex.value, idx);
  await playSound('select', 0.2);
};

// 下一题
const goToNext = () => {
  store.nextQuestion();
};

// 当所有题答完，触发完成
watch(answers, (newAns) => {
  if (newAns.every(a => a !== null)) {
    store.completeQuiz();
  }
}, {deep: true});
</script>

<style lang="scss" scoped>
@import '../../styles/variables';
@import '../../styles/mixins';

.question-set {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;

  .progress {
    display: flex;
    align-items: center;
    margin-bottom: 2rem;
    color: $color-mist;
    font-size: 0.9rem;

    .bar {
      flex: 1;
      height: 2px;
      background: rgba($color-paper, 0.2);
      margin: 0 1rem;
      position: relative;

      .fill {
        height: 100%;
        background: $color-heartbeat;
        transition: width 0.3s $ease-drawer;
      }
    }
  }

  .question-card {
    .question-header {
      margin-bottom: 2rem;

      .question-number {
        display: block;
        color: $color-heartbeat;
        font-size: 1.2rem;
        margin-bottom: 0.5rem;
      }

      h3 {
        font-size: 1.5rem;
        line-height: 1.4;
        font-weight: 400;
      }
    }

    .options {
      margin-bottom: 2rem;

      .hand-radio {
        display: flex;
        align-items: flex-start;
        margin-bottom: 1rem;
        padding: 0.5rem;
        transition: all 0.2s;
        border-radius: 4px;

        &:hover {
          background: rgba($color-heartbeat, 0.05);
        }

        &.disabled {
          opacity: 0.5;
          pointer-events: none;
        }

        .option-text {
          font-family: $font-hand;
          font-size: 1.1rem;
          line-height: 1.4;
        }
      }
    }

    .comment {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px dashed rgba($color-heartbeat, 0.5);
      font-style: italic;
      color: $color-mist;
      font-family: $font-hand;
      white-space: normal;
      animation: fadeIn 0.5s;
    }

    .next-btn {
      margin-top: 2rem;
      width: 100%;
    }
  }

  .slide-enter-active, .slide-leave-active {
    transition: all 0.3s $ease-drawer;
  }

  .slide-enter-from {
    opacity: 0;
    transform: translateX(30px);
  }

  .slide-leave-to {
    opacity: 0;
    transform: translateX(-30px);
  }
}
</style>
