<template>
  <svg viewBox="0 0 200 200" class="regret-illus" xmlns="http://www.w3.org/2000/svg">
    <!-- 未完成的纸船 -->
    <path d="M60,110 L90,70 L120,110 L60,110" stroke="#F5EFE6" stroke-width="2" fill="none" stroke-linejoin="round"/>
    <!-- 折叠虚线 -->
    <line x1="90" y1="70" x2="90" y2="110" stroke="#F5EFE6" stroke-width="1" stroke-dasharray="5 4"/>
    <!-- 断掉的磁带 -->
    <path d="M130,80 L160,80" stroke="#7A8B94" stroke-width="2" stroke-dasharray="2 6"/>
    <circle cx="130" cy="80" r="3" stroke="#7A8B94" fill="none"/>
    <circle cx="160" cy="80" r="3" stroke="#7A8B94" fill="none"/>
    <!-- 飘散的音符/遗憾符号 -->
    <path d="M70,150 Q80,140 90,150 T110,145" stroke="#FF9F4B" stroke-width="1" fill="none" opacity="0.5"/>
    <circle cx="75" cy="155" r="1.5" fill="#FF9F4B" opacity="0.4"/>
    <circle cx="105" cy="150" r="1.2" fill="#FF9F4B" opacity="0.3"/>
  </svg>
</template>

<style scoped>
.regret-illus {
  width: 100%;
  height: auto;
}
</style>
