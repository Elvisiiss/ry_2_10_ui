<template>
  <div
      class="handdrawn-svg-container"
      :class="{ 'has-jitter': enableJitter }"
      :style="containerStyle"
  >
    <svg
        ref="svgRef"
        :viewBox="viewBox"
        :width="width"
        :height="height"
        class="handdrawn-svg"
        :class="{ animated: animateOnLoad }"
        v-bind="$attrs"
    >
      <!-- 全局滤镜：模拟手绘不完美边缘 -->
      <defs v-if="enableFilter">
        <filter id="handdrawn-turbulence">
          <feTurbulence
              type="fractalNoise"
              baseFrequency="0.01 0.01"
              numOctaves="1"
              seed="2"
          />
          <feDisplacementMap in="SourceGraphic" scale="1.5"/>
        </filter>
        <filter id="handdrawn-sketch">
          <feConvolveMatrix
              order="3,3"
              kernelMatrix="0 -1 0 -1 4 -1 0 -1 0"
              preserveAlpha="true"
          />
        </filter>
      </defs>

      <!-- 实际内容插槽，可通过两种方式提供：默认插槽或 name 属性预置 -->
      <g
          v-if="$slots.default"
          :filter="enableFilter ? 'url(#handdrawn-turbulence)' : undefined"
      >
        <slot/>
      </g>
      <g
          v-else-if="name"
          :filter="enableFilter ? 'url(#handdrawn-turbulence)' : undefined"
      >
        <!-- 根据 name 预定义的一些手绘 SVG 图形 -->
        <component :is="presetComponent"/>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import {computed, ref, useAttrs} from 'vue'

// 预定义图形（可根据项目扩展）
import DeltaCepheiSVG from '@/assets/svg/presets/delta-cephei.svg?component'
import LuxSilhouetteSVG from '@/assets/svg/presets/lux-silhouette.svg?component'
import ObservatorySVG from '@/assets/svg/presets/observatory-03.svg?component'
import AstronomyIllus from '@/components/illustrations/IllusAstronomy.vue'
import TheseusIllus from '@/components/illustrations/IllusTheseus.vue'
import RegretIllus from '@/components/illustrations/IllusRegret.vue'
import VinylIllus from '@/components/illustrations/IllusVinyl.vue'
import AiIllus from '@/components/illustrations/IllusAI.vue'

const props = withDefaults(
    defineProps<{
      /** 预设图形名称，与预定义组件映射 */
      name?: string
      /** SVG viewBox，默认 '0 0 100 100' */
      viewBox?: string
      /** 宽度，默认 '100%' */
      width?: string | number
      /** 高度，默认 '100%' */
      height?: string | number
      /** 是否启用抖动/手绘滤镜，默认 true */
      enableFilter?: boolean
      /** 是否启用额外路径抖动（通过 CSS 动画） */
      enableJitter?: boolean
      /** 是否在加载时播放描边动画 */
      animateOnLoad?: boolean
    }>(),
    {
      viewBox: '0 0 100 100',
      width: '100%',
      height: '100%',
      enableFilter: true,
      enableJitter: false,
      animateOnLoad: false,
      name: undefined
    }
)

const attrs = useAttrs()
const svgRef = ref<SVGElement | null>(null)

const containerStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height
}))

// 预设组件映射
const presetMap: Record<string, any> = {
  'delta-cephei': DeltaCepheiSVG,
  'lux-silhouette': LuxSilhouetteSVG,
  'observatory-03': ObservatorySVG,
  astronomy: AstronomyIllus,
  theseus: TheseusIllus,
  regret: RegretIllus,
  vinyl: VinylIllus,
  ai: AiIllus
}

const presetComponent = computed(() => {
  if (!props.name) return null
  return presetMap[props.name] || null
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.handdrawn-svg-container {
  display: inline-block;
  line-height: 0;

  &.has-jitter {
    animation: jitter 0.3s $ease-shake infinite;
  }

  .handdrawn-svg {
    width: 100%;
    height: 100%;
    @include handdrawn-svg; // mixin 设置 stroke-linecap/join 等

    // 描边动画：stroke-dashoffset
    &.animated {
      path,
      circle,
      line,
      polyline {
        stroke-dasharray: 1000;
        stroke-dashoffset: 1000;
        animation: dash 1.5s $ease-out-back forwards;
      }
    }
  }
}

@keyframes dash {
  to {
    stroke-dashoffset: 0;
  }
}
</style>
