<template>
  <svg viewBox="0 0 200 200" class="vinyl-illus" xmlns="http://www.w3.org/2000/svg">
    <!-- 黑胶唱片 -->
    <circle cx="100" cy="100" r="60" stroke="#F5EFE6" stroke-width="1.8" fill="none"/>
    <!-- 纹路 -->
    <circle cx="100" cy="100" r="45" stroke="#F5EFE6" stroke-width="0.8" fill="none" stroke-dasharray="3 5"
            opacity="0.6"/>
    <circle cx="100" cy="100" r="30" stroke="#F5EFE6" stroke-width="0.6" fill="none" stroke-dasharray="2 4"
            opacity="0.6"/>
    <circle cx="100" cy="100" r="15" stroke="#F5EFE6" stroke-width="0.5" fill="none" stroke-dasharray="2 3"
            opacity="0.5"/>
    <!-- 中心标签 -->
    <circle cx="100" cy="100" r="8" stroke="#FF9F4B" stroke-width="1" fill="none"/>
    <!-- 唱针 -->
    <path d="M140,60 L115,85 L108,98" stroke="#F5EFE6" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <circle cx="108" cy="98" r="2" fill="#FF9F4B"/>
    <!-- 爆豆噪点 -->
    <circle cx="70" cy="70" r="0.8" fill="#F5EFE6" opacity="0.3"/>
    <circle cx="150" cy="130" r="0.7" fill="#F5EFE6" opacity="0.3"/>
    <circle cx="130" cy="50" r="0.6" fill="#F5EFE6" opacity="0.2"/>
  </svg>
</template>

<style scoped>
.vinyl-illus {
  width: 100%;
  height: auto;
}
</style>
