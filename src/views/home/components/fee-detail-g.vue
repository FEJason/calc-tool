<template>
  <div>
    <div class="subtitle details" :class="{ 'show-details': isShowDetails }">
      <p>{{ t('fee') }}: {{ priceForm.commission }}% ({{ feeTotal }})</p>
      <p>{{ t('stampDuty') }}: 0.1% ({{ stampDuty }})</p>
      <p>{{ t('transferFee') }}: {{ transferFee }}</p>
      <p>{{ t('liquidationFees') }}: {{ LiquidationFees }}</p>
      <p>{{ t('gTransactionLevy') }}: {{ gTransactionLevy }}</p>
      <p>{{ t('cTransactionLevy') }}: {{ cTransactionLevy }}</p>
    </div>
    <div class="more-btn" @click="toggleShowDetails">
      <template v-if="isShowDetails">
        <span>{{ t('hideFeeDetails') }}</span>
        <el-icon><ArrowUpBold /></el-icon>
      </template>
      <template v-else>
        <span>{{ t('showFeeDetails') }}</span>
        <el-icon><ArrowDownBold /></el-icon>
      </template>
    </div>
    <p class="subtitle u-p-t-10 u-flex u-row-between">
      <span>{{ t('totalTaxes') }} {{ totalTaxes }}</span>
      <span>{{ t('fxRates', { date: priceForm.ratesDate, rates: priceForm.rates }) }}</span>
    </p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useMainStore } from '@/store/main'

const { t } = useI18n()
const mainStore = useMainStore()

const props = defineProps({
  priceForm: {
    type: Object,
    default() {
      return {}
    }
  }
})

const feeTotal = computed(() => {
  const { amount, commission, rates, isExemptFive } = props.priceForm

  let fee = Number(amount) * (Number(commission) / 100) * Number(rates)
  if (isExemptFive !== 'Yes') {
    fee = fee > 5 ? Number(fee.toFixed(2)) : 5
  }
  return Number(fee.toFixed(2))
})

const stampDuty = computed(() => {
  const { amount, rates } = props.priceForm

  const stampDuty = Number(amount) * 0.001 * Number(rates)
  return Number(stampDuty.toFixed(2))
})

const transferFee = computed(() => {
  const { amount, rates } = props.priceForm

  const baseFee = Number(amount) * 0.00002 * Number(rates)
  const fixedFee = 2 * Number(rates)
  return Number((baseFee > fixedFee ? baseFee : fixedFee).toFixed(2))
})

const LiquidationFees = computed(() => {
  const { amount, rates } = props.priceForm

  const res = Number(amount) * 0.0000565 * Number(rates)
  return Number(res.toFixed(2))
})

const gTransactionLevy = computed(() => {
  const { amount, rates } = props.priceForm

  const res = Number(amount) * 0.000027 * Number(rates)
  return Number(res.toFixed(2))
})

const cTransactionLevy = computed(() => {
  const { amount, rates } = props.priceForm

  const res = Number(amount) * 0.0000015 * Number(rates)
  return Number(res.toFixed(2))
})

const totalTaxes = computed(() => {
  const res =
    feeTotal.value +
    stampDuty.value +
    transferFee.value +
    LiquidationFees.value +
    gTransactionLevy.value +
    cTransactionLevy.value

  mainStore.setTotalTaxesG(res.toFixed(2))
  return res.toFixed(2)
})

const isShowDetails = ref(false)
const toggleShowDetails = () => {
  isShowDetails.value = !isShowDetails.value
}
</script>

<style lang="scss" scoped>
.more-btn {
  display: flex;
  gap: 2px;
  align-items: center;
  font-size: 12px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  user-select: none;
}
.subtitle {
  font-size: 10px;
  line-height: 1.5;
  color: var(--el-text-color-placeholder);
}
.details {
  height: 0;
  overflow: hidden;
}
.show-details {
  height: initial;
  overflow: initial;
  margin-bottom: 10px;
}
</style>