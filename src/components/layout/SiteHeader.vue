<template>
  <header class="site-header" :class="{ 'signal-locked': signalStore.isConnected }">
    <div class="header-container">
      <!-- 03号观测站标志 -->
      <div class="station-badge" @click="goHome">
        <HandDrawnSVG name="observatory-03" class="badge-svg" width="40" height="40"/>
        <span class="station-name">03号观测站</span>
      </div>

      <!-- 极简导航（可选） -->
      <nav v-if="showNav" class="main-nav">
        <router-link to="/" class="nav-link" active-class="active">信号终端</router-link>
        <router-link to="/apply" class="nav-link" active-class="active">上载日志</router-link>
      </nav>

      <!-- 状态指示（已连接信号） -->
      <div v-if="signalStore.isConnected" class="connection-status">
        <span class="pulse-dot"/>
        <span class="status-text">信号锁定</span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import {useRouter} from 'vue-router'
import {useSignalStore} from '@/stores/signal'
import HandDrawnSVG from '@/components/core/HandDrawnSVG.vue'

const router = useRouter()
const signalStore = useSignalStore()

const goHome = () => {
  router.push('/')
}

defineProps<{
  showNav?: boolean
}>()
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.site-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: $spacing-4 $spacing-6;
  background: rgba($color-void, 0.8);
  backdrop-filter: blur(4px);
  z-index: $z-index-header;
  border-bottom: 1px solid rgba($color-pulse, 0.2);

  &.signal-locked {
    border-bottom-color: $color-pulse;
  }

  .header-container {
    max-width: $breakpoint-xl;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .station-badge {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    cursor: pointer;

    .badge-svg {
      filter: drop-shadow(0 0 4px rgba($color-pulse, 0.3));
    }

    .station-name {
      font-family: $font-signal;
      font-size: $font-size-md;
      color: $color-paper;
      letter-spacing: 0.1em;
    }
  }

  .main-nav {
    display: flex;
    gap: $spacing-6;

    .nav-link {
      font-family: $font-mono;
      font-size: $font-size-sm;
      color: $color-mist;
      text-decoration: none;
      padding-bottom: $spacing-1;
      border-bottom: 1px dashed transparent;
      transition: $transition-default;

      &:hover,
      &.active {
        color: $color-pulse;
        border-bottom-color: $color-pulse;
      }
    }
  }

  .connection-status {
    display: flex;
    align-items: center;
    gap: $spacing-2;

    .pulse-dot {
      width: 8px;
      height: 8px;
      background: $color-pulse;
      border-radius: 50%;
      animation: pulse-dot 1.5s infinite;
    }

    .status-text {
      font-family: $font-mono;
      font-size: $font-size-xs;
      color: $color-pulse;
    }
  }
}

@keyframes pulse-dot {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: $breakpoint-md) {
  .site-header {
    .station-name {
      display: none;
    }

    .main-nav {
      display: none; // 移动端可考虑菜单折叠
    }
  }
}
</style>
