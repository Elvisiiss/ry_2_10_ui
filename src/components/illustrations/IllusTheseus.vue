<template>
  <svg viewBox="0 0 200 200" class="theseus-illus" xmlns="http://www.w3.org/2000/svg">
    <!-- 左半人形，右半机械 -->
    <!-- 人体轮廓（左侧） -->
    <path d="M60,120 L60,80 Q70,60 85,60 L90,70" stroke="#F5EFE6" stroke-width="1.8" fill="none"/>
    <circle cx="70" cy="50" r="12" stroke="#F5EFE6" stroke-width="1.5" fill="none"/>
    <!-- 机械部分（右侧） -->
    <rect x="100" y="55" width="25" height="35" stroke="#FF9F4B" stroke-width="1.5" fill="none" rx="3"/>
    <circle cx="112" cy="45" r="8" stroke="#FF9F4B" stroke-width="1.2" fill="none"/>
    <line x1="125" y1="70" x2="145" y2="60" stroke="#FF9F4B" stroke-width="1.2"/>
    <!-- 连接线/过渡 -->
    <path d="M85,70 Q95,80 100,75" stroke="#7A8B94" stroke-width="1.2" stroke-dasharray="4 3"/>
    <!-- 神经元火花 -->
    <circle cx="135" cy="110" r="2" fill="#FF9F4B" opacity="0.8"/>
    <circle cx="145" cy="100" r="1.5" fill="#FF9F4B" opacity="0.6"/>
    <circle cx="150" cy="120" r="1.8" fill="#FF9F4B" opacity="0.7"/>
  </svg>
</template>

<style scoped>
.theseus-illus {
  width: 100%;
  height: auto;
}
</style>
