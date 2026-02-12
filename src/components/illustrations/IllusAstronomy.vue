<template>
  <svg viewBox="0 0 200 200" class="astronomy-illus" xmlns="http://www.w3.org/2000/svg">
    <!-- 造父四（大） -->
    <circle cx="100" cy="80" r="24" fill="#FF9F4B" opacity="0.3"/>
    <circle cx="100" cy="80" r="16" fill="#FF9F4B" opacity="0.7"/>
    <circle cx="100" cy="80" r="10" fill="#FF9F4B"/>
    <!-- 芒刺 -->
    <line v-for="i in 10" :key="i" :x1="100" :y1="80" :x2="100 + Math.cos(i * 36 * Math.PI / 180) * 42"
          :y2="80 + Math.sin(i * 36 * Math.PI / 180) * 42" stroke="#FF9F4B" stroke-width="1.2" opacity="0.4"
          stroke-linecap="round"/>
    <!-- 地球（远处） -->
    <circle cx="160" cy="140" r="12" stroke="#F5EFE6" stroke-width="1.2" fill="none" stroke-dasharray="3 2"/>
    <circle cx="160" cy="140" r="3" fill="#7A8B94"/>
    <!-- 光行差示意：波浪线 -->
    <path d="M110,85 Q130,70 150,80 T190,90" stroke="#59B89C" stroke-width="1.2" fill="none" stroke-dasharray="5 3"
          opacity="0.6"/>
    <path d="M108,95 Q128,90 148,100 T188,115" stroke="#59B89C" stroke-width="1" fill="none" stroke-dasharray="4 3"
          opacity="0.5"/>
    <!-- 标注：880 ly -->
    <text x="140" y="60" font-family="JetBrains Mono, monospace" font-size="12" fill="#F5EFE6">880 ly</text>
  </svg>
</template>

<style scoped>
.astronomy-illus {
  width: 100%;
  height: auto;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
