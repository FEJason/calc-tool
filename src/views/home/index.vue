<template>
  <div class="home">
    <CalcChange class="wrap" />
    <CalcProfit class="wrap" />
    <div>
      <div>
        <el-button @click="showFeeG">FeeG</el-button>
      </div>
      <div class="u-m-t-10">
        <el-button @click="showFeeA">FeeA</el-button>
      </div>
    </div>
    <CalcFeeG class="wrap" v-show="isShowFeeG" />
    <CalcFeeA class="wrap" v-show="isShowFeeA" />
  </div>
</template>

<script setup lang="ts">
import CalcChange from './components/calc-change.vue'
import CalcProfit from './components/calc-profit.vue'
import CalcFeeG from './components/calc-fee-g.vue'
import CalcFeeA from './components/calc-fee-a.vue'

const isShowFeeG = ref(false)
const showFeeG = () => {
  isShowFeeG.value = !isShowFeeG.value
}

const isShowFeeA = ref(false)
const showFeeA = () => {
  isShowFeeA.value = !isShowFeeA.value
}
</script>

<style lang="scss" scoped>
.home {
  position: fixed;
  bottom: 20px;
  left: 20px;
  display: flex;
  align-items: flex-end;
  gap: 20px;
  opacity: 0.6;
  .wrap {
    max-width: 256px;
    box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color)) inset;
    border-radius: 12px;
    padding: 12px;
  }
}
</style>
