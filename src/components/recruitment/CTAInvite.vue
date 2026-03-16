<template>
  <div class="cta-invite">
    <!-- 邀请函信封（手绘风格） -->
    <div class="envelope">
      <svg viewBox="0 0 200 120" class="envelope-svg">
        <!-- 信封主体 -->
        <rect x="10" y="30" width="180" height="80" fill="none" stroke="#f5f1e8" stroke-width="1.2"
              stroke-dasharray="4 3"/>
        <!-- 封口 -->
        <path d="M10,30 L100,10 L190,30" fill="none" stroke="#f5f1e8" stroke-width="1.2"/>
        <!-- 徽章压印（station-03-badge简化版） -->
        <circle cx="100" cy="70" r="12" fill="none" stroke="#f5f1e8" stroke-width="0.8" opacity="0.6"/>
        <path d="M100,58 L100,82 M88,70 L112,70" stroke="#f5f1e8" stroke-width="0.6" opacity="0.4"/>
      </svg>
    </div>

    <!-- 邀请文案 -->
    <div class="invitation-text">
      <h2 class="hand-title signal">来自海希安的邀请函</h2>
      <p class="lead">我们正在建造一艘名为《Project RY》的船。</p>
      <p class="lead">我们不需要螺丝钉，我们需要能听到星辰跳动的“船员”。</p>

      <div class="benefits">
        <p>你将获得：</p>
        <ul>
          <li>第一手 ESA Gaia DR3 数据的“解密”权限。</li>
          <li>参与制作一张 $59.99 的物理黑胶。</li>
          <li>在 57 平米的实验室里，挑战这个平庸的时代。</li>
        </ul>
      </div>

      <div class="actions">
        <button class="obs-button" @click="onApply">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 3v12m0 0-3-3m3 3 3-3M5 21h14"/>
          </svg>
          投递简历/作品集
        </button>
        <p class="offline-hint">
          或者： 带着你的“波长”，于 3月X日 到 [学校地址] 寻找那个
          <span class="underline-hand">拿着红轴键盘的男人</span>。
        </p>
      </div>

      <footer class="epitaph">
        “0KB 的空白里，藏着我们对宇宙最后的执念。”
      </footer>
    </div>
  </div>
</template>

<script setup>
import {useCalibrationStore} from '../../stores/calibration';

const store = useCalibrationStore();

const onApply = () => {
  // 投递简历行为：可跳转至招聘表单
  window.open('http://www.elvel.cn/recruitment', '_blank');
};
</script>

<style lang="scss" scoped>
@import '../../styles/variables';
@import '../../styles/mixins';

.cta-invite {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 3rem;
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;

  @media (max-width: $bp-tablet) {
    flex-direction: column;
  }

  .envelope {
    flex: 0 0 200px;

    .envelope-svg {
      width: 100%;
      height: auto;
    }
  }

  .invitation-text {
    flex: 1;

    h2 {
      font-size: 2rem;
      margin-bottom: 1.5rem;
    }

    .lead {
      font-size: 1.2rem;
      line-height: 1.6;
      margin-bottom: 0.5rem;
      font-family: $font-serif;
    }

    .benefits {
      margin: 2rem 0;

      ul {
        list-style: none;
        padding-left: 0;

        li {
          padding-left: 1.5rem;
          position: relative;
          margin-bottom: 0.5rem;

          &::before {
            content: '•';
            position: absolute;
            left: 0;
            color: $color-heartbeat;
            font-size: 1.2rem;
          }
        }
      }
    }

    .actions {
      margin: 2rem 0;

      .obs-button {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }

      .offline-hint {
        color: $color-mist;

        .underline-hand {
          @include handdrawn-underline($color-heartbeat, 1px);
          cursor: help;
        }
      }
    }

    .epitaph {
      margin-top: 3rem;
      font-style: italic;
      color: $color-mist;
      font-size: 1.1rem;
      border-left: 2px solid $color-heartbeat;
      padding-left: 1rem;
    }
  }
}
</style>
