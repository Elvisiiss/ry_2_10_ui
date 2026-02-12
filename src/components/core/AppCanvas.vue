<template>
  <div class="app-canvas" aria-hidden="true">
    <canvas ref="canvasRef" class="noise-canvas"/>
    <div class="crt-overlay"/>
  </div>
</template>

<script setup lang="ts">
import {onMounted, onUnmounted, ref} from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationFrame: number | null = null
let ctx: CanvasRenderingContext2D | null = null

// 胶片颗粒强度（可外部控制）
const grainIntensity = ref(0.025)

// 初始化画布
const initCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  ctx = canvas.getContext('2d')

  const resize = () => {
    const w = window.innerWidth
    const h = window.innerHeight
    canvas.width = w * devicePixelRatio
    canvas.height = h * devicePixelRatio
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    if (ctx) {
      ctx.scale(devicePixelRatio, devicePixelRatio)
      ctx.fillStyle = '#0f0f12' // $color-void
      ctx.fillRect(0, 0, w, h)
    }
  }
  resize()
  window.addEventListener('resize', resize)

  const drawNoise = () => {
    if (!ctx || !canvas) return
    const w = window.innerWidth
    const h = window.innerHeight
    const imageData = ctx.getImageData(0, 0, w, h)
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 255 * grainIntensity.value
      data[i] += noise
      data[i + 1] += noise
      data[i + 2] += noise
    }
    ctx.putImageData(imageData, 0, 0)
    animationFrame = requestAnimationFrame(drawNoise)
  }

  // 清空画布为纯黑
  const clear = () => {
    if (!ctx || !canvas) return
    ctx.fillStyle = '#0f0f12'
    const w = window.innerWidth
    const h = window.innerHeight
    ctx.fillRect(0, 0, w, h)
  }

  clear()
  drawNoise()
}

onMounted(() => {
  initCanvas()
})

onUnmounted(() => {
  if (animationFrame) cancelAnimationFrame(animationFrame)
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.app-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: $z-index-canvas;

  .noise-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: block;
  }

  .crt-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url($texture-crt), url($texture-grain);
    background-size: 2px 2px, 128px 128px;
    background-repeat: repeat, repeat;
    opacity: 0.03;
    mix-blend-mode: overlay;
    pointer-events: none;
  }
}
</style>
