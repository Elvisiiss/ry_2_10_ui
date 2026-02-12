<template>
  <svg viewBox="0 0 200 200" class="ai-illus" xmlns="http://www.w3.org/2000/svg">
    <!-- 夕阳（渐变） -->
    <defs>
      <radialGradient id="sunsetGradient">
        <stop offset="0%" stop-color="#FF9F4B" stop-opacity="0.4"/>
        <stop offset="80%" stop-color="#0F0F12" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="160" cy="60" r="40" fill="url(#sunsetGradient)"/>
    <!-- 地平线 -->
    <line x1="20" y1="120" x2="180" y2="120" stroke="#F5EFE6" stroke-width="1" stroke-dasharray="6 4" opacity="0.4"/>
    <!-- LUX 侧影（右侧，凝视夕阳） -->
    <path d="M130,110 L145,125 L145,155 L130,165 L115,155 L115,125 Z" stroke="#F5EFE6" stroke-width="1.5" fill="none"/>
    <circle cx="130" cy="135" r="5" stroke="#F5EFE6" stroke-width="1" fill="none"/>
    <circle cx="130" cy="135" r="2" fill="#FF9F4B" opacity="0.7"/>
    <!-- 眼神光（看向夕阳） -->
    <line x1="136" y1="133" x2="155" y2="75" stroke="#FF9F4B" stroke-width="0.8" stroke-dasharray="3 2" opacity="0.5"/>
    <!-- AI 生成的“完美”几何图形 -->
    <polygon points="40,70 50,50 70,50 80,70 70,90 50,90" stroke="#7A8B94" stroke-width="1" fill="none" opacity="0.5"/>
  </svg>
</template>

<style scoped>
.ai-illus {
  width: 100%;
  height: auto;
}
</style>
