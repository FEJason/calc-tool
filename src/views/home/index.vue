<template>
  <div class="home">
    <CalcChange class="wrap" />
    <CalcProfit class="wrap" />
    <!-- <CalcFee class="wrap" /> -->
  </div>
</template>

<script setup lang="ts">
import CalcChange from './components/calc-change.vue'
import CalcProfit from './components/calc-profit.vue'
// import CalcFee from './components/calc-fee.vue'
</script>

<style lang="scss" scoped>
.home {
  position: fixed;
  bottom: 20px;
  left: 20px;
  display: flex;
  gap: 20px;
  .wrap {
    max-width: 256px;
    border: 1px solid #dcdfe6;
    border-radius: 12px;
    padding: 12px;
  }
}
</style>
