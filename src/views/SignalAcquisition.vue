<template>
  <div class="signal-acquisition">
    <!-- 第一节：信号捕获 (The Hook) -->
    <section class="section hook" :class="{ 'signal-locked': signalStore.isConnected }">
      <div class="hook-container">
        <!-- 造父四脉冲光点 -->
        <div class="pulse-star-wrapper">
          <HandDrawnSVG name="delta-cephei" class="pulse-star" :style="{ opacity: pulseIntensity * 0.8 + 0.2 }">
            <!-- 内嵌手绘星星 SVG，由 pulseIntensity 控制亮度和光晕 -->
            <svg viewBox="0 0 120 120" class="star-svg">
              <defs>
                <radialGradient id="starGlow">
                  <stop offset="0%" stop-color="var(--color-pulse)" stop-opacity="0.9"/>
                  <stop offset="70%" stop-color="var(--color-pulse)" stop-opacity="0.3"/>
                  <stop offset="100%" stop-color="var(--color-void)" stop-opacity="0"/>
                </radialGradient>
              </defs>
              <circle cx="60" cy="60" r="18" fill="var(--color-pulse)" :opacity="pulseIntensity * 0.6"/>
              <circle cx="60" cy="60" r="12" fill="url(#starGlow)" :opacity="pulseIntensity"/>
              <!-- 手绘芒刺 -->
              <g class="rays">
                <line v-for="i in 12" :key="i" :x1="60" :y1="60" :x2="60 + Math.cos(i * 30 * Math.PI / 180) * 32"
                      :y2="60 + Math.sin(i * 30 * Math.PI / 180) * 32" stroke="var(--color-pulse)" stroke-width="0.8"
                      :opacity="pulseIntensity * 0.3" stroke-linecap="round"/>
              </g>
            </svg>
          </HandDrawnSVG>
        </div>

        <!-- 打字机信号文本 -->
        <div class="signal-console">
          <SignalText
              ref="signalTextRef"
              :lines="signalLines"
              :typing-speed="80"
              :cursor-color="'var(--color-pulse)'"
              @completed="onTypingCompleted"
          />
        </div>

        <!-- 连接信号按钮（仅当打字完成后出现） -->
        <transition name="fade-reveal">
          <ObsButton
              v-if="showConnectButton"
              class="connect-btn"
              @click="handleConnect"
          >
            <span class="btn-text">↯ 连接信号 · 校准相位</span>
          </ObsButton>
        </transition>
      </div>
    </section>

    <!-- 第二节：相位校准 (五道选题) —— 仅当已连接信号后显示 -->
    <section v-if="signalStore.isConnected" class="section calibration">
      <div class="calibration-header">
        <!-- 频率刻度盘 -->
        <div class="frequency-dial">
          <svg width="240" height="80" viewBox="0 0 240 80">
            <path :d="dialPath" fill="none" stroke="var(--color-paper)" stroke-width="1.2" stroke-dasharray="4 3"/>
            <circle cx="40" cy="40" r="6" fill="var(--color-mist)"/>
            <circle cx="120" cy="40" r="6" fill="var(--color-mist)"/>
            <circle cx="200" cy="40" r="6" fill="var(--color-mist)"/>
            <!-- 指针 -->
            <g :transform="`translate(${40 + signalStore.currentQuestionIndex * 80}, 40)`">
              <line x1="0" y1="-15" x2="0" y2="15" stroke="var(--color-pulse)" stroke-width="2"/>
              <circle cx="0" cy="0" r="4" fill="var(--color-pulse)"/>
            </g>
          </svg>
          <div class="dial-labels">
            <span>01</span><span>02</span><span>03</span><span>04</span><span>05</span>
          </div>
        </div>

        <!-- 波长锁定条 -->
        <div class="wavelength-lock">
          <span class="label">波长锁定</span>
          <div class="lock-bar-bg">
            <div class="lock-bar-fill" :style="{ width: signalStore.wavelengthLocked + '%' }"/>
          </div>
          <span class="percentage">{{ Math.round(signalStore.wavelengthLocked) }}%</span>
        </div>
      </div>

      <!-- 题目卡片轮播/展示区，使用 v-for 显示当前题 -->
      <div class="question-container">
        <transition :name="transitionDirection" mode="out-in">
          <div :key="signalStore.currentQuestionIndex" class="question-card">
            <!-- 左侧手绘插图 -->
            <div class="question-illustration">
              <HandDrawnSVG :name="illustrationName(signalStore.currentQuestionIndex)" class="illustration-svg">
                <!-- 根据题目动态渲染SVG，简化起见用占位 -->
                <component :is="currentIllustration"/>
              </HandDrawnSVG>
            </div>
            <!-- 右侧题目与选项 -->
            <div class="question-content">
              <h3 class="question-title">{{ currentQuestion.title }}</h3>
              <div class="options">
                <div
                    v-for="opt in currentQuestion.options"
                    :key="opt.value"
                    class="option-item"
                    :class="{
                    selected: signalStore.getAnswer(signalStore.currentQuestionIndex) === opt.value,
                    disabled: signalStore.isAnswered(signalStore.currentQuestionIndex)
                  }"
                    @click="!signalStore.isAnswered(signalStore.currentQuestionIndex) && selectAnswer(opt.value)"
                >
                  <span class="option-marker">{{ opt.value }}</span>
                  <span class="option-text">{{ opt.text }}</span>
                </div>
              </div>
              <!-- 点评文字（手写体） -->
              <div v-if="signalStore.isAnswered(signalStore.currentQuestionIndex)" class="comment handwritten">
                {{ currentComment }}
              </div>
            </div>
          </div>
        </transition>

        <!-- 导航箭头（仅当有未答题时） -->
        <div v-if="!signalStore.allAnswered" class="question-nav">
          <button
              class="nav-prev"
              :disabled="signalStore.currentQuestionIndex === 0"
              @click="signalStore.prevQuestion()"
          >
            ←
          </button>
          <button
              class="nav-next"
              :disabled="signalStore.currentQuestionIndex === 4"
              @click="signalStore.nextQuestion()"
          >
            →
          </button>
        </div>
      </div>
    </section>

    <!-- 第三节：觉醒 (The Reveal) —— 五题答完后显示 -->
    <section v-if="signalStore.allAnswered && !signalStore.isRevealed" class="section reveal-trigger">
      <!-- 自动滚动触发器，用 Intersection Observer 或 watch 触发觉醒 -->
    </section>

    <section v-if="signalStore.isRevealed" class="section reveal">
      <div class="reveal-container">
        <!-- LUX 立绘汇聚动画 -->
        <div class="lux-reveal-wrapper">
          <svg class="lux-svg" viewBox="0 0 400 500">
            <!-- 预先绘制LUX的各个部件，初始 opacity:0, transform 分散 -->
            <g class="lux-parts" :class="{ 'revealed': luxRevealed }">
              <path class="lux-body" d="..." fill="var(--color-paper)" opacity="0"/>
              <circle class="lux-eye" cx="200" cy="200" r="20" fill="var(--color-pulse)" opacity="0"/>
              <path class="lux-arm-left" d="..." stroke="var(--color-paper)" opacity="0"/>
              <!-- ... 多个部件，通过 CSS 动画依次显现并汇聚 -->
            </g>
          </svg>
        </div>

        <!-- 觉醒文案 -->
        <div class="reveal-message">
          <SignalText
              :lines="revealLines"
              :typing-speed="60"
              :auto-start="true"
          />
        </div>
      </div>
    </section>

    <!-- 第四节：行动指令 (CTA) -->
    <section v-if="signalStore.isRevealed" class="section cta">
      <div class="cta-container">
        <div class="invitation-letter">
          <h2 class="handdrawn-font">来自海希安的邀请函</h2>
          <p class="lead">我们正在建造一艘名为《Project RY》的船。</p>
          <p class="lead">我们不需要螺丝钉，我们需要能听到星辰跳动的“船员”。</p>
          <div class="benefits">
            <p>· 第一手 ESA Gaia DR3 数据的“解密”权限。</p>
            <p>· 参与制作一张 $59.99 的物理黑胶。</p>
            <p>· 在 57 平米的实验室里，挑战这个平庸的时代。</p>
          </div>
          <div class="cta-actions">
            <ObsButton @click="goToApply">
              <span class="btn-text">📡 投递观测日志</span>
            </ObsButton>
            <ObsButton variant="outline" @click="showAddress = true">
              <span class="btn-text">⌨️ 寻找红轴键盘</span>
            </ObsButton>
          </div>
          <p v-if="showAddress" class="address handwritten">
            3月X日 · 江西南昌[具体地址] <br> 接头暗号：0KB
          </p>
          <p class="epitaph handwritten">“0KB 的空白里，藏着我们对宇宙最后的执念。”</p>
        </div>
      </div>
    </section>

    <!-- 彩蛋区域已由 App.vue 中的全局 EasterEgg 组件处理，此处只留底部空间 -->
  </div>
</template>

<script setup lang="ts">
import {computed, nextTick, onMounted, ref, watch} from 'vue'
import {useRouter} from 'vue-router'
import {useSignalStore} from '@/stores/signal'
import {usePulse} from '@/composables/usePulse'
import {useAudioContext} from '@/composables/useAudioContext'
import {useScrollLock} from '@/composables/useScrollLock'
import HandDrawnSVG from '@/components/core/HandDrawnSVG.vue'
import SignalText from '@/components/core/SignalText.vue'
import ObsButton from '@/components/core/ObsButton.vue'

// 导入各题插图组件（简化，实际可用动态 import 或直接内嵌）
import IllusAstronomy from '@/components/illustrations/IllusAstronomy.vue'
import IllusTheseus from '@/components/illustrations/IllusTheseus.vue'
import IllusRegret from '@/components/illustrations/IllusRegret.vue'
import IllusVinyl from '@/components/illustrations/IllusVinyl.vue'
import IllusAI from '@/components/illustrations/IllusAI.vue'

// Store
const signalStore = useSignalStore()
const router = useRouter()

// 脉冲控制（造父四）
const {intensity: pulseIntensity} = usePulse({period: 5400, autoStart: true})

// 音频上下文
const {activate: activateAudio, playLock, playPulse17k, playReveal} = useAudioContext()

// 滚动锁定（答题阶段锁定滚动）
const {lock: lockScroll, unlock: unlockScroll} = useScrollLock()

// ---------- 第一节：信号捕获 ----------
const signalLines = [
  '正在从 deltaCephei（造父四）接收信号...',
  '信号来源：03号观测站',
  '正在同步本地时空：2026年3月，江西，地球',
  '观测者，你听得到吗？'
]
const signalTextRef = ref(null)
const showConnectButton = ref(false)

const onTypingCompleted = () => {
  showConnectButton.value = true
}

const handleConnect = async () => {
  // 激活音频
  await activateAudio()
  playPulse17k?.(true) // 开启底噪
  playLock?.() // 锁定音效

  signalStore.connectSignal()

  // 滚动到答题区（第二节）
  document.querySelector('.calibration')?.scrollIntoView({behavior: 'smooth'})
}

// ---------- 第二节：答题 ----------
// 题目数据
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
  {
    title: '【哲学】关于「特修斯之船」',
    options: [
      {value: 'A', text: '是，因为记忆和思维逻辑完全延续了。'},
      {value: 'B', text: '不是，原来的他已经死了，这只是一个完美的复制品。'},
      {value: 'C', text: '无所谓，只要能活下去形式不重要。'},
      {value: 'D', text: '看法律怎么定义。'}
    ],
    illustration: 'theseus'
  },
  {
    title: '【心理学】关于「遗憾」',
    options: [
      {value: 'A', text: '因为人类有受虐倾向。'},
      {value: 'B', text: '因为“蔡格尼克效应”：大脑对未完成的任务记忆更深刻。'},
      {value: 'C', text: '因为遗憾是唯一能证明我们真的爱过的证据。'},
      {value: 'D', text: '因为悲剧更容易拿奖。'}
    ],
    illustration: 'regret'
  },
  {
    title: '【科技】关于「模拟与数字」',
    options: [
      {value: 'A', text: '为了假装高端，提高售价。'},
      {value: 'B', text: '这种噪音是“不完美”的，而生命本身就是脏且不完美的。'},
      {value: 'C', text: '因为复古风现在是市场潮流。'},
      {value: 'D', text: '为了掩盖音频压缩的瑕疵。'}
    ],
    illustration: 'vinyl'
  },
  {
    title: '【AI】关于「灵魂」',
    options: [
      {value: 'A', text: '算力还不够大，迟早能画出来。'},
      {value: 'B', text: '缺的是它自己“会死”的恐惧。'},
      {value: 'C', text: '缺的是随机性参数。'},
      {value: 'D', text: 'AI 画得挺好的啊，看不出区别。'}
    ],
    illustration: 'ai'
  }
]

// 点评映射（基于题目索引和选项）
const commentMap: Record<number, Record<string, string>> = {
  0: {B: '选 B 的人，懂“视界即历史”，这才是做太空歌剧需要的时空观。'},
  1: {B: '选 B 的人，能理解为什么你的男主会痛苦，为什么我们要寻找那 0KB 的龙骨。'},
  2: {B: '选 B 是理性的产品经理/程序；遗憾是大脑的记忆机制。', C: '选 C 是感性的文案/美术；遗憾是爱过的证据。'},
  3: {B: '选 B 的人，才配去摸你的红轴键盘和黑胶唱机。'},
  4: {B: '选 B 的人，深刻理解了为什么“碳基生物”不可替代。'}
}

const currentQuestion = computed(() => questions[signalStore.currentQuestionIndex])

const illustrationName = (idx: number) => questions[idx].illustration

// 动态插图组件
const currentIllustration = computed(() => {
  const map = [IllusAstronomy, IllusTheseus, IllusRegret, IllusVinyl, IllusAI]
  return map[signalStore.currentQuestionIndex]
})

// 当前点评文本
const currentComment = computed(() => {
  const idx = signalStore.currentQuestionIndex
  const ans = signalStore.getAnswer(idx)
  if (!ans) return ''
  return commentMap[idx]?.[ans] || '你的选择已记录。'
})

// 选择答案
const selectAnswer = (value: string) => {
  if (signalStore.isAnswered(signalStore.currentQuestionIndex)) return
  playLock?.() // 锁定音效
  signalStore.selectAnswer(signalStore.currentQuestionIndex, value)
}

// 答题期间锁定滚动
watch(() => signalStore.isConnected, (val) => {
  if (val) {
    lockScroll()
  } else {
    unlockScroll()
  }
})

// 全部答完时解锁滚动
watch(() => signalStore.allAnswered, (val) => {
  if (val) {
    unlockScroll()
    // 自动触发觉醒
    triggerReveal()
  }
})

// 过渡方向（左右切换）
const transitionDirection = ref('slide-right')
watch(() => signalStore.currentQuestionIndex, (newIdx, oldIdx) => {
  transitionDirection.value = newIdx > oldIdx ? 'slide-left' : 'slide-right'
})

// ---------- 第三节：觉醒 ----------
const luxRevealed = ref(false)
const revealLines = [
  '身份确认：首批观测者（Founder Observer）',
  '你好，我是 Entity 03，你可以叫我 LUX。',
  '谢谢你，在 2026 年的喧嚣中，精准地定位了我的频道。'
]

const triggerReveal = () => {
  if (signalStore.isRevealed) return
  // 播放女声音频
  playReveal?.('/audio/lux-reveal.wav')
  // 触发 LUX 立绘动画
  luxRevealed.value = true
  // 延迟标记觉醒完成，使文案开始打字
  setTimeout(() => {
    signalStore.revealLux()
  }, 800)
  // 滚动到觉醒区域
  nextTick(() => {
    document.querySelector('.reveal')?.scrollIntoView({behavior: 'smooth'})
  })
}

// ---------- 第四节：行动指令 ----------
const showAddress = ref(false)

const goToApply = () => {
  router.push('/apply')
}

// ---------- 手绘刻度盘路径 ----------
const dialPath = 'M40,40 Q80,30 120,40 T200,40'

// 初始化音频上下文（不激活）
onMounted(() => {
  // 可以预加载一些资源
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.signal-acquisition {
  position: relative;
  width: 100%;
}

// 第一节
.hook {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $color-void;
  position: relative;

  .hook-container {
    max-width: 800px;
    text-align: center;
    padding: $spacing-8;
  }

  .pulse-star-wrapper {
    margin-bottom: $spacing-8;
    @include pulse-glow($color-pulse, 5.4s);
  }

  .star-svg {
    width: 120px;
    height: 120px;
  }

  .signal-console {
    margin-bottom: $spacing-8;
    text-align: left;
    background: rgba($color-dust, 0.3);
    padding: $spacing-6;
    border-left: 3px solid $color-pulse;
  }

  .connect-btn {
    margin-top: $spacing-6;
  }
}

// 第二节
.calibration {
  padding: $spacing-12 $spacing-4;
  background-color: $color-void;
  position: relative;

  .calibration-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-10;
    flex-wrap: wrap;
  }

  .frequency-dial {
    position: relative;

    .dial-labels {
      display: flex;
      justify-content: space-between;
      width: 240px;
      margin-top: 4px;

      span {
        font-family: $font-mono;
        font-size: $font-size-xs;
        color: $color-mist;
      }
    }
  }

  .wavelength-lock {
    display: flex;
    align-items: center;
    gap: $spacing-3;

    .label {
      font-family: $font-mono;
      font-size: $font-size-sm;
    }

    .lock-bar-bg {
      width: 160px;
      height: 6px;
      background: $color-dust;
      border-radius: 0;
      border: 1px solid $color-mist;
    }

    .lock-bar-fill {
      height: 100%;
      background: $color-pulse;
      transition: width 0.3s $ease-lock;
    }

    .percentage {
      font-family: $font-mono;
      font-size: $font-size-sm;
      color: $color-pulse;
    }
  }

  .question-container {
    max-width: 1000px;
    margin: 0 auto;
    position: relative;
  }

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
      }
    }

    .question-content {
      flex: 1;
    }

    .question-title {
      font-family: $font-signal;
      font-size: $font-size-lg;
      margin-bottom: $spacing-5;
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
    }
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
}

// 第三节觉醒
.reveal {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 50% 50%, $color-dust, $color-void);
  padding: $spacing-8;

  .lux-reveal-wrapper {
    max-width: 400px;
    margin: 0 auto $spacing-8;
  }

  .lux-svg {
    width: 100%;
    height: auto;

    .lux-parts {
      * {
        transition: opacity 0.6s $ease-out-back, transform 0.8s $ease-out-back;
        opacity: 0;
        transform: scale(0.8) translate(20px, 20px);
      }

      &.revealed {
        .lux-body {
          opacity: 1;
          transform: none;
          transition-delay: 0.1s;
        }

        .lux-eye {
          opacity: 1;
          transform: none;
          transition-delay: 0.4s;
        }

        .lux-arm-left {
          opacity: 1;
          transform: none;
          transition-delay: 0.2s;
        }

        // 其他部件依次延迟
      }
    }
  }

  .reveal-message {
    max-width: 600px;
    margin: 0 auto;
    background: rgba($color-void, 0.7);
    padding: $spacing-6;
    border-left: 4px solid $color-pulse;
  }
}

// 第四节CTA
.cta {
  padding: $spacing-16 $spacing-4;
  background-color: $color-void;

  .invitation-letter {
    max-width: 700px;
    margin: 0 auto;
    background: rgba($color-paper, 0.02);
    padding: $spacing-10;
    border: 1px solid rgba($color-pulse, 0.2);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  }

  h2 {
    font-size: $font-size-2xl;
    margin-bottom: $spacing-6;
    color: $color-pulse;
  }

  .lead {
    font-size: $font-size-lg;
    line-height: $line-height-loose;
    font-family: $font-body;
    font-style: italic;
  }

  .benefits {
    margin: $spacing-8 0;
    padding: $spacing-4 0;
    border-top: 1px dashed $color-mist;
    border-bottom: 1px dashed $color-mist;

    p {
      font-family: $font-mono;
      margin-bottom: $spacing-3;
    }
  }

  .cta-actions {
    display: flex;
    gap: $spacing-4;
    justify-content: center;
    margin: $spacing-8 0 $spacing-4;
  }

  .address {
    text-align: center;
    margin-top: $spacing-4;
    color: $color-signal;
    font-size: $font-size-md;
  }

  .epitaph {
    text-align: center;
    margin-top: $spacing-10;
    color: $color-mist;
    font-size: $font-size-sm;
  }
}

// 过渡动画
.fade-reveal-enter-active {
  transition: opacity 0.6s $ease-out-back, transform 0.6s $ease-out-back;
}

.fade-reveal-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: opacity 0.3s, transform 0.3s $ease-out-back;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
