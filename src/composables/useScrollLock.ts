/**
 * useScrollLock.ts
 * 答题阶段锁定滚动，防止用户在答题过程中意外滚动页面
 * 提供锁定/解锁方法，支持多层锁定计数
 */

import {Ref, ref, watchEffect} from 'vue'

export function useScrollLock() {
    // 锁定计数器，支持多个组件同时请求锁定
    const lockCount = ref(0)
    // 原始overflow样式备份
    let originalOverflow = ''
    let originalPaddingRight = ''

    // 实际锁定/解锁逻辑
    const applyLock = (shouldLock: boolean) => {
        if (typeof document === 'undefined') return

        if (shouldLock) {
            // 记录原始样式
            originalOverflow = document.body.style.overflow
            originalPaddingRight = document.body.style.paddingRight

            // 锁定滚动，保留滚动条宽度避免页面跳动
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
            document.body.style.overflow = 'hidden'
            if (scrollbarWidth > 0) {
                document.body.style.paddingRight = `${scrollbarWidth}px`
            }
        } else {
            // 恢复原始样式
            document.body.style.overflow = originalOverflow
            document.body.style.paddingRight = originalPaddingRight
        }
    }

    // 监听锁定计数器，当从0->1时锁定，从1->0时解锁
    watchEffect(() => {
        const shouldLock = lockCount.value > 0
        applyLock(shouldLock)
    })

    // 增加一层锁定
    const lock = () => {
        lockCount.value++
    }

    // 减少一层锁定
    const unlock = () => {
        if (lockCount.value > 0) {
            lockCount.value--
        }
    }

    // 强制解锁（重置计数器并解锁）
    const forceUnlock = () => {
        lockCount.value = 0
    }

    // 当前是否锁定
    const isLocked = () => lockCount.value > 0

    return {
        lockCount,
        lock,
        unlock,
        forceUnlock,
        isLocked
    }
}

// 用于特定元素滚动的锁定（如图片全屏浏览等）
export function useElementScrollLock(element: Ref<HTMLElement | null>) {
    const locked = ref(false)
    let originalOverflow = ''

    const lock = () => {
        if (!element.value) return
        originalOverflow = element.value.style.overflow
        element.value.style.overflow = 'hidden'
        locked.value = true
    }

    const unlock = () => {
        if (!element.value) return
        element.value.style.overflow = originalOverflow
        locked.value = false
    }

    return {lock, unlock, locked}
}
