<template>
  <div class="signal-text-container" :class="{ 'signal-locked': locked }">
    <div v-for="(line, idx) in displayedLines" :key="idx" class="signal-line">
      <span
          class="text-content"
          :class="{ 'typing-active': isTyping && idx === currentLineIndex }"
      >
        {{ line }}
        <span
            v-if="showCursor && idx === currentLineIndex && cursorVisible"
            class="cursor"
            :style="{ backgroundColor: cursorColor }"
        />
      </span>
    </div>
    <div v-if="showSecondaryCursor && !isTyping" class="static-cursor" :style="{ backgroundColor: cursorColor }"/>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, onUnmounted, ref, watch} from 'vue'

const props = withDefaults(
    defineProps<{
      /** 要显示的文本行数组 */
      lines: string[]
      /** 打字速度（毫秒/字符） */
      typingSpeed?: number
      /** 行间延迟（毫秒） */
      lineDelay?: number
      /** 是否自动开始打字 */
      autoStart?: boolean
      /** 光标颜色 */
      cursorColor?: string
      /** 完成后是否保留静态光标 */
      retainCursor?: boolean
      /** 是否锁定信号状态（特殊样式） */
      locked?: boolean
    }>(),
    {
      typingSpeed: 80,
      lineDelay: 400,
      autoStart: true,
      cursorColor: 'var(--color-pulse)',
      retainCursor: true,
      locked: false
    }
)

const emit = defineEmits<{
  (e: 'completed'): void
  (e: 'lineCompleted', index: number): void
}>()

// 当前已经完整打印出的行（不包括正在打印的行）
const completedLines = ref<string[]>([])
// 当前正在打印的行内容（逐步追加）
const currentTypingLine = ref('')
// 当前行索引
const currentLineIndex = ref(0)
// 是否正在打字
const isTyping = ref(false)
// 光标闪烁状态
const cursorVisible = ref(true)
let typingTimer: NodeJS.Timeout | null = null
let cursorInterval: NodeJS.Timeout | null = null
let lineTimer: NodeJS.Timeout | null = null

// 最终显示的行：已完成的 + 正在打印的（如果有）
const displayedLines = computed(() => {
  const lines = [...completedLines.value]
  if (isTyping.value && currentLineIndex.value < props.lines.length) {
    // 如果正在打印，当前行显示 currentTypingLine，其余已完成行已加入
    while (lines.length < currentLineIndex.value) {
      lines.push(props.lines[lines.length])
    }
    lines.push(currentTypingLine.value)
  } else {
    // 完成状态：所有行已完成
    while (lines.length < props.lines.length) {
      lines.push(props.lines[lines.length])
    }
  }
  return lines
})

const showCursor = computed(() => isTyping.value || (props.retainCursor && !isTyping.value))
const showSecondaryCursor = computed(() => !isTyping.value && props.retainCursor && displayedLines.value.length === props.lines.length)

// 开始打字
const startTyping = () => {
  if (isTyping.value) return
  reset()
  isTyping.value = true
  typeNextChar(0)
}

// 重置状态
const reset = () => {
  completedLines.value = []
  currentTypingLine.value = ''
  currentLineIndex.value = 0
  if (typingTimer) clearTimeout(typingTimer)
  if (lineTimer) clearTimeout(lineTimer)
  typingTimer = null
  lineTimer = null
}

// 打印下一个字符
const typeNextChar = (charIndex: number) => {
  if (!isTyping.value) return
  const line = props.lines[currentLineIndex.value]
  if (charIndex < line.length) {
    currentTypingLine.value += line[charIndex]
    typingTimer = setTimeout(() => typeNextChar(charIndex + 1), props.typingSpeed)
  } else {
    // 本行完成
    completedLines.value.push(line)
    currentTypingLine.value = ''
    emit('lineCompleted', currentLineIndex.value)
    // 检查是否所有行都完成
    if (currentLineIndex.value + 1 >= props.lines.length) {
      isTyping.value = false
      emit('completed')
      return
    }
    // 延迟进入下一行
    currentLineIndex.value++
    lineTimer = setTimeout(() => {
      typeNextChar(0)
    }, props.lineDelay)
  }
}

// 光标闪烁
const startCursorBlink = () => {
  cursorInterval = setInterval(() => {
    cursorVisible.value = !cursorVisible.value
  }, 500)
}

onMounted(() => {
  if (props.autoStart) {
    startTyping()
  }
  startCursorBlink()
})

onUnmounted(() => {
  if (typingTimer) clearTimeout(typingTimer)
  if (lineTimer) clearTimeout(lineTimer)
  if (cursorInterval) clearInterval(cursorInterval)
})

// 监听 lines 变化，可重新触发（外部控制）
watch(() => props.lines, () => {
  reset()
  if (props.autoStart) startTyping()
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.signal-text-container {
  font-family: $font-mono;
  font-size: $font-size-lg;
  line-height: $line-height-loose;
  color: $color-paper;

  &.signal-locked {
    color: $color-signal;
  }

  .signal-line {
    min-height: 1.8em;
    position: relative;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .text-content {
    position: relative;
    display: inline;
  }

  .cursor {
    display: inline-block;
    width: 2px;
    height: 1.2em;
    background-color: $color-pulse;
    vertical-align: middle;
    margin-left: 2px;
    animation: blink 1s step-end infinite;
  }

  .static-cursor {
    display: inline-block;
    width: 2px;
    height: 1.2em;
    background-color: $color-pulse;
    vertical-align: middle;
    margin-left: 2px;
    opacity: 0.6;
  }
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>
