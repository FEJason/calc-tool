<template>
  <div class="words-page">
    <van-tabs v-model:active="activeTab">
      <van-tab title="卡片" name="flashcard"><FlashCard /></van-tab>
      <van-tab title="今日复习" name="today"><TodayWords /></van-tab>
      <van-tab title="指定日期" name="date"><DateWords /></van-tab>
    </van-tabs>
  </div>
</template>

<script setup lang="ts">
import FlashCard from './components/FlashCard.vue'
import TodayWords from './components/TodayWords.vue'
import DateWords from './components/DateWords.vue'

const activeTab = ref('flashcard')
</script>

<style lang="scss" scoped>
.words-page {
  padding: 12px;
}
</style>
