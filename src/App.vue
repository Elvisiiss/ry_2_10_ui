<template>
  <div id="app">
    <router-view v-if="$route"/>
    <RecruitmentPage v-else/>
  </div>
</template>

<script setup>
import RecruitmentPage from './views/RecruitmentPage.vue';
// 若没有使用vue-router，直接渲染招聘页面
</script>

<style lang="scss">
@import './styles/main.scss';
</style>
