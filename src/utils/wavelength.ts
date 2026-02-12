/**
 * wavelength.ts
 * 答题匹配算法——计算观测者的“波长”与海希安团队的共振程度
 * 不设标准答案，但通过选项偏好识别同频者
 */

export interface AnswerSet {
    /** 五道题答案，索引0~4，值 'A'|'B'|'C'|'D'，空字符串表示未答 */
    answers: [string, string, string, string, string]
}

export interface WavelengthResult {
    /** 匹配度 0-100 */
    score: number
    /** 命中的理想选项 */
    matchedIdeals: string[]
    /** 整体反馈文案 */
    feedback: string
    /** 波长类型 */
    type: '完美同频' | '理性偏向' | '感性偏向' | '信号微弱' | '失谐'
}

// 理想选项配置
const IDEAL_MAP = [
    {index: 0, ideal: 'B', weight: 20, description: '视界即历史'},
    {index: 1, ideal: 'B', weight: 20, description: '理解0KB的龙骨'},
    {index: 2, ideal: ['B', 'C'], weight: 20, description: '遗憾的两种温度'}, // B和C均为理想
    {index: 3, ideal: 'B', weight: 20, description: '不完美的生命力'},
    {index: 4, ideal: 'B', weight: 20, description: '碳基的有限性'}
]

/**
 * 计算波长匹配结果
 * @param answers 长度为5的数组，元素为'A','B','C','D'或空字符串
 * @returns WavelengthResult
 */
export const calculateWavelength = (answers: [string, string, string, string, string]): WavelengthResult => {
    let score = 0
    const matchedIdeals: string[] = []
    let hasBInQ3 = false
    let hasCInQ3 = false

    IDEAL_MAP.forEach((item, idx) => {
        const userAnswer = answers[idx]
        if (!userAnswer) return

        if (Array.isArray(item.ideal)) {
            // 第三题：B或C均得分，但分别记录
            if (item.ideal.includes(userAnswer)) {
                score += item.weight
                if (userAnswer === 'B') hasBInQ3 = true
                if (userAnswer === 'C') hasCInQ3 = true
                matchedIdeals.push(`Q${idx + 1}: ${userAnswer} – ${item.description}`)
            }
        } else {
            if (userAnswer === item.ideal) {
                score += item.weight
                matchedIdeals.push(`Q${idx + 1}: ${userAnswer} – ${item.description}`)
            }
        }
    })

    // 类型判定
    let type: WavelengthResult['type'] = '信号微弱'
    let feedback = ''

    if (score >= 80) {
        if (hasBInQ3 && hasCInQ3) {
            type = '完美同频'
            feedback = '你的波长与海希安完全共振——理性与感性在你体内共存，这正是我们寻找的龙骨守护者。'
        } else if (hasBInQ3) {
            type = '理性偏向'
            feedback = '你习惯用逻辑拆解世界，但内心仍为未知留有余地。我们需要你的冷静。'
        } else if (hasCInQ3) {
            type = '感性偏向'
            feedback = '你相信遗憾是爱的余烬。LUX会记得每一个为0KB驻足的人。'
        } else {
            type = '完美同频'
            feedback = '虽然错过了部分理想选项，但你的选择依然透露出对深空叙事的敏锐直觉。欢迎登船。'
        }
    } else if (score >= 50) {
        type = '信号微弱'
        feedback = '信号有些模糊，但你依然听到了造父四的脉搏。再近一点。'
    } else {
        type = '失谐'
        feedback = '频率偏移……但观测站从不拒绝任何路过的电波。也许现实世界的喧嚣太强了。'
    }

    return {
        score,
        matchedIdeals,
        feedback,
        type
    }
}

/**
 * 快速判断是否为“顶级极客”（彩蛋发现者）
 * @param hasTriggeredEasterEgg 是否触发过长按彩蛋
 * @returns 是否具备极客特质
 */
export const isEliteGeek = (hasTriggeredEasterEgg: boolean): boolean => {
    return hasTriggeredEasterEgg
}
