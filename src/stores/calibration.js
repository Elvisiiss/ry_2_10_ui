import {defineStore} from 'pinia';

export const useCalibrationStore = defineStore('calibration', {
    state: () => ({
        // 连接状态
        hasConnected: false,
        // 答题状态: 0未开始, 1答题中, 2已完成
        quizPhase: 0,
        // 当前题目索引 (0-4)
        currentQuestionIndex: 0,
        // 答案记录 [null, null, null, null, null]
        answers: new Array(5).fill(null),
        // 是否已觉醒
        isAwaken: false,
        // 是否显示邀请函
        showInvite: false,
        // 彩蛋触发状态
        easterEggTriggered: false,
    }),

    getters: {
        allQuestionsAnswered: (state) => {
            return state.answers.every(ans => ans !== null);
        },
        isQuizFinished: (state) => {
            return state.quizPhase === 2;
        }
    },

    actions: {
        // 连接信号
        connect() {
            this.hasConnected = true;
            this.quizPhase = 1; // 进入答题
        },

        // 选择答案
        selectAnswer(questionIndex, optionIndex) {
            this.answers[questionIndex] = optionIndex;
            // 自动进入下一题（如果还没到最后一题）
            if (questionIndex === this.currentQuestionIndex && questionIndex < 4) {
                this.currentQuestionIndex++;
            }
        },

        // 手动跳转下一题（由按钮触发）
        nextQuestion() {
            if (this.currentQuestionIndex < 4) {
                this.currentQuestionIndex++;
            }
        },

        // 完成所有答题，触发觉醒
        completeQuiz() {
            if (this.allQuestionsAnswered) {
                this.quizPhase = 2;
                this.isAwaken = true;
            }
        },

        // 觉醒完成后显示邀请函
        revealInvite() {
            this.showInvite = true;
        },

        // 触发彩蛋
        triggerEasterEgg() {
            this.easterEggTriggered = true;
            // 8秒后自动重置
            setTimeout(() => {
                this.easterEggTriggered = false;
            }, 8000);
        }
    }
});
