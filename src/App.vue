<template>
  <div id="app" class="halcyon-observatory">
    <!-- 全局噪声画布背景，带 CRT 扫描线与胶片颗粒 -->
    <AppCanvas/>

    <!-- 路由视图：信号接收终端、申请页、404等 -->
    <router-view v-slot="{ Component }">
      <transition name="fade-signal" mode="out-in">
        <component :is="Component"/>
      </transition>
    </router-view>

    <!-- 天文钟彩蛋区域（全局底部，404页面不显示） -->
    <EasterEgg v-if="$route.name !== 'NotFound'"/>
  </div>
</template>

<script setup lang="ts">
import {onMounted} from 'vue'
import {useSignalStore} from '@/stores/signal'
import {useAudioContext} from '@/composables/useAudioContext'
import AppCanvas from '@/components/core/AppCanvas.vue'
import EasterEgg from '@/components/modules/EasterEgg.vue'

// 初始化 Pinia store
const signalStore = useSignalStore()

// 初始化音频上下文（不自动激活，等待用户手势）
const {initContext} = useAudioContext()
onMounted(() => {
  initContext()
  // 标记 JS 已启用，可用于样式降级
  document.documentElement.classList.add('js-enabled')
  // 预加载字体等（可选）
})
</script>

<style lang="scss">
@use '@/styles/main.scss';

#app {
  position: relative;
  min-height: 100vh;
  width: 100%;
  color: $color-paper; // 来自全局变量
  background-color: $color-void;
  overflow-x: hidden; // 防止滚动视差溢出
}

// 页面切换淡入淡出，使用 LUX 机械臂缓动
.fade-signal-enter-active,
.fade-signal-leave-active {
  transition: opacity 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fade-signal-enter-from,
.fade-signal-leave-to {
  opacity: 0;
}

// 确保路由视图容器占满
.router-view-container {
  min-height: 100vh;
}
</style>
