/**
 * stores/signal.ts
 * Pinia Store - 记录答题状态、锁定状态、波长匹配度
 *
 * 核心状态：
 * - 五道题的选择答案（用 A/B/C/D 表示）
 * - 每道题是否已作答
 * - 波长锁定百分比 (0-100)
 * - 彩蛋触发状态
 * - 用户是否已连接信号（点击过连接按钮）
 * - 是否已觉醒（LUX出现）
 */

import {defineStore} from 'pinia'
import {computed, ref} from 'vue'

export interface AnswerRecord {
    /** 题目索引 0-4 */
    questionIndex: number
    /** 答案标识 'A'|'B'|'C'|'D' */
    answer: string
    /** 是否已选 */
    selected: boolean
}

export const useSignalStore = defineStore('signal', () => {
    // ---------- 状态 ----------
    /** 是否已点击“连接信号” */
    const isConnected = ref(false)
    /** 是否已完成五题 */
    const isCompleted = ref(false)
    /** 是否已觉醒（LUX出现） */
    const isRevealed = ref(false)
    /** 彩蛋是否已触发 */
    const easterEggTriggered = ref(false)

    /** 五道题答案状态 */
    const answers = ref<AnswerRecord[]>([
        {questionIndex: 0, answer: '', selected: false},
        {questionIndex: 1, answer: '', selected: false},
        {questionIndex: 2, answer: '', selected: false},
        {questionIndex: 3, answer: '', selected: false},
        {questionIndex: 4, answer: '', selected: false}
    ])

    /** 当前正在作答的题号（0-4），用于高亮频率刻度盘 */
    const currentQuestionIndex = ref(0)

    // ---------- 计算属性 ----------
    /** 已答题数量 */
    const answeredCount = computed(() =>
        answers.value.filter(a => a.selected).length
    )

    /** 波长锁定百分比 (0-100) */
    const wavelengthLocked = computed(() =>
        (answeredCount.value / 5) * 100
    )

    /** 是否所有题都已答 */
    const allAnswered = computed(() =>
        answeredCount.value === 5
    )

    /** 获取某题的答案 */
    const getAnswer = (index: number) => {
        if (index >= 0 && index < answers.value.length) {
            return answers.value[index].answer
        }
        return ''
    }

    /** 获取某题是否已答 */
    const isAnswered = (index: number) => {
        return answers.value[index]?.selected ?? false
    }

    // ---------- Actions ----------
    /** 连接信号 */
    const connectSignal = () => {
        isConnected.value = true
    }

    /** 选择答案 */
    const selectAnswer = (index: number, answer: string) => {
        if (index >= 0 && index < answers.value.length) {
            answers.value[index].answer = answer
            answers.value[index].selected = true

            // 自动推进到下一题（如果还有未答）
            if (allAnswered.value) {
                isCompleted.value = true
            } else {
                // 找到下一个未答题的索引
                const nextIndex = answers.value.findIndex((a, i) => !a.selected && i > index)
                if (nextIndex !== -1) {
                    currentQuestionIndex.value = nextIndex
                } else {
                    // 如果没有后面的，找最前面的未答
                    const firstUnanswered = answers.value.findIndex(a => !a.selected)
                    if (firstUnanswered !== -1) currentQuestionIndex.value = firstUnanswered
                }
            }
        }
    }

    /** 设置当前题号（用户可手动切换，或通过刻度盘交互） */
    const setCurrentQuestion = (index: number) => {
        if (index >= 0 && index < 5) {
            currentQuestionIndex.value = index
        }
    }

    /** 跳转到下一题 */
    const nextQuestion = () => {
        if (currentQuestionIndex.value < 4) {
            currentQuestionIndex.value++
        }
    }

    /** 跳转到上一题 */
    const prevQuestion = () => {
        if (currentQuestionIndex.value > 0) {
            currentQuestionIndex.value--
        }
    }

    /** 触发觉醒（LUX 出现） */
    const revealLux = () => {
        isRevealed.value = true
    }

    /** 触发彩蛋 */
    const triggerEasterEgg = () => {
        easterEggTriggered.value = true
    }

    /** 重置所有状态（用于调试/重试） */
    const reset = () => {
        isConnected.value = false
        isCompleted.value = false
        isRevealed.value = false
        easterEggTriggered.value = false
        answers.value.forEach(a => {
            a.answer = ''
            a.selected = false
        })
        currentQuestionIndex.value = 0
    }

    return {
        // state
        isConnected,
        isCompleted,
        isRevealed,
        easterEggTriggered,
        answers,
        currentQuestionIndex,
        // getters
        answeredCount,
        wavelengthLocked,
        allAnswered,
        getAnswer,
        isAnswered,
        // actions
        connectSignal,
        selectAnswer,
        setCurrentQuestion,
        nextQuestion,
        prevQuestion,
        revealLux,
        triggerEasterEgg,
        reset
    }
})

// 可选：持久化部分状态（如用户已经答过的题，刷新页面保留）
// 可以与 pinia-plugin-persistedstate 配合使用
