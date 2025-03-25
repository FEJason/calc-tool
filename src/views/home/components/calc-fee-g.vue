<template>
  <el-form :model="priceForm" label-width="auto" label-position="left">
    <el-form-item v-for="field in formFields" :key="field.key" :label="field.label">
      <el-input v-model="priceForm[field.key]">
        <template v-if="field.suffix" #suffix>{{ field.suffix }}</template>
      </el-input>
    </el-form-item>
    <div class="subtitle details" :class="{ 'show-details': isShowDetails }">
      <p>Fee: {{ priceForm.commission }}% ({{ feeTotal }})</p>
      <p>Stamp Duty: 0.1% ({{ stampDuty }})</p>
      <p>Transfer Fee: {{ transferFee }}</p>
      <p>Liquidation Fees: {{ LiquidationFees }}</p>
      <p>GTransaction Levy: {{ gTransactionLevy }}</p>
      <p>CTransaction Levy: {{ cTransactionLevy }}</p>
    </div>
    <div class="more-btn" @click="toggleShowDetails">
      <template v-if="isShowDetails">
        <span>Hidden fee details</span>
        <el-icon><ArrowUpBold /></el-icon>
      </template>
      <template v-else>
        <span>Show fee details</span>
        <el-icon><ArrowDownBold /></el-icon>
      </template>
    </div>
    <p class="subtitle u-p-t-10">Total Taxes ≈ {{ totalTaxes }}</p>
  </el-form>
</template>

<script setup lang="ts">
interface FormField {
  key: keyof PriceForm
  label: string
  maxlength?: number
  suffix?: string
  readonly?: boolean
}

interface PriceForm {
  amount: string
  rate: string
  commission: string
}

const priceForm = reactive<PriceForm>({
  amount: '',
  rate: '0.92',
  commission: '0.018'
})

const formFields: FormField[] = [
  { key: 'amount', label: 'Amount', maxlength: 10 },
  { key: 'rate', label: 'Rate', maxlength: 10 },
  { key: 'commission', label: 'Commission', maxlength: 10, suffix: '%' }
]

const feeTotal = computed(() => {
  const res =
    Number(priceForm.amount) * (Number(priceForm.commission) / 100) * Number(priceForm.rate)
  const num = res > 5 ? Number(res.toFixed(2)) : 5
  return num
})

const stampDuty = computed(() => {
  const stampDuty = Number(priceForm.amount) * 0.001 * Number(priceForm.rate)
  return Number(stampDuty.toFixed(2))
})

const transferFee = computed(() => {
  const baseFee = Number(priceForm.amount) * 0.00002 * Number(priceForm.rate)
  const fixedFee = 2 * Number(priceForm.rate)
  return Number((baseFee > fixedFee ? baseFee : fixedFee).toFixed(2))
})

const LiquidationFees = computed(() => {
  const res = Number(priceForm.amount) * 0.0000565 * Number(priceForm.rate)
  return Number(res.toFixed(2))
})

const gTransactionLevy = computed(() => {
  const res = Number(priceForm.amount) * 0.000027 * Number(priceForm.rate)
  return Number(res.toFixed(2))
})

const cTransactionLevy = computed(() => {
  const res = Number(priceForm.amount) * 0.0000015 * Number(priceForm.rate)
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
  color: #606266;
  cursor: pointer;
  user-select: none;
}
.subtitle {
  font-size: 10px;
  line-height: 1.5;
  color: #9e9e9e;
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
