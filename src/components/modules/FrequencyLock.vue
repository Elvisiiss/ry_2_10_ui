<template>
  <div class="frequency-lock">
    <div class="invitation-letter handdrawn">
      <h2 class="handdrawn-font">来自海希安的邀请函</h2>
      <p class="lead">我们正在建造一艘名为《Project RY》的船。</p>
      <p class="lead">我们不需要螺丝钉，我们需要能听到星辰跳动的“船员”。</p>

      <div class="benefits">
        <p>· 第一手 ESA Gaia DR3 数据的“解密”权限。</p>
        <p>· 参与制作一张 $59.99 的物理黑胶。</p>
        <p>· 在 57 平米的实验室里，挑战这个平庸的时代。</p>
      </div>

      <div class="cta-actions">
        <ObsButton @click="handleApply">
          <span class="btn-text">📡 投递观测日志</span>
        </ObsButton>
        <ObsButton variant="outline" @click="showAddress = !showAddress">
          <span class="btn-text">⌨️ 寻找红轴键盘</span>
        </ObsButton>
      </div>

      <transition name="fade">
        <p v-if="showAddress" class="address handwritten">
          3月X日 · 江西南昌[具体地址] <br> 接头暗号：0KB
        </p>
      </transition>

      <p class="epitaph handwritten">“0KB 的空白里，藏着我们对宇宙最后的执念。”</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import ObsButton from '@/components/core/ObsButton.vue'

const router = useRouter()
const showAddress = ref(false)

const handleApply = () => {
  router.push('/apply')
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.frequency-lock {
  padding: $spacing-16 $spacing-4;
  background-color: $color-void;

  .invitation-letter {
    max-width: 700px;
    margin: 0 auto;
    background: rgba($color-paper, 0.02);
    padding: $spacing-10;
    border: 1px solid rgba($color-pulse, 0.2);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    @include handdrawn-border($color-paper, 1px, 1px, 12px, true);
  }

  h2 {
    font-size: $font-size-2xl;
    margin-bottom: $spacing-6;
    color: $color-pulse;
    font-family: $font-signal;
  }

  .lead {
    font-size: $font-size-lg;
    line-height: $line-height-loose;
    font-family: $font-body;
    font-style: italic;
    color: $color-paper;
  }

  .benefits {
    margin: $spacing-8 0;
    padding: $spacing-4 0;
    border-top: 1px dashed $color-mist;
    border-bottom: 1px dashed $color-mist;

    p {
      font-family: $font-mono;
      margin-bottom: $spacing-3;
      color: $color-paper;
    }
  }

  .cta-actions {
    display: flex;
    gap: $spacing-4;
    justify-content: center;
    margin: $spacing-8 0 $spacing-4;
    flex-wrap: wrap;
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
