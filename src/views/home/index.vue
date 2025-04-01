<template>
  <div class="home">
    <CalcChange class="wrap" @calcChange="handleCalcChange" />
    <CalcProfit class="wrap" :change="change" />
    <div class="hidden-xs">
      <div>
        <el-button @click="showFeeG">FeeG</el-button>
      </div>
      <div class="u-m-t-10">
        <el-button @click="showFeeA">FeeA</el-button>
      </div>
    </div>
    <div class="hidden-lg xs-button-wrap">
      <van-button class="btn" plain @click="showFeeG">FeeG</van-button>
      <van-button class="btn" plain @click="showFeeA">FeeA</van-button>
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

const change = ref('')
const handleCalcChange = (val: string) => {
  change.value = val
}
</script>

<style lang="scss" scoped>
.home {
  opacity: 0.6;
  position: fixed;
  bottom: 20px;
  left: 20px;
  display: flex;
  align-items: flex-end;
  gap: 20px;
  .wrap {
    max-width: 256px;
    box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color)) inset;
    border-radius: 12px;
    padding: 12px;
  }
}
@media screen and (max-width: 828px) {
  .home {
    opacity: initial;
    padding: 20px 0;
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    position: initial;
    .wrap {
      max-width: initial;
      width: 100%;
      box-shadow: initial;
      border-radius: initial;
      padding: initial;
    }
    .xs-button-wrap {
      width: 100%;
      display: flex;
      gap: 16px;
      padding: var(--van-cell-group-inset-padding);
      .btn {
        width: 50%;
      }
    }
  }
}
</style>
