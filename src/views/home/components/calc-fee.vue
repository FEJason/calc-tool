<template>
  <el-form :model="priceForm" label-width="auto" label-position="left">
    <el-form-item v-for="field in formFields" :key="field.key" :label="field.label">
      <el-input v-model="priceForm[field.key]">
        <template v-if="field.suffix" #suffix>{{ field.suffix }}</template>
      </el-input>
    </el-form-item>
    <div class="subtitle">
      <p>Fee: {{ priceForm.commission }}% ({{ feeTotal }})</p>
      <p>Stamp duty: 0.1% ({{ stampDuty }})</p>
      <p>totalTaxes ≈ {{ totalTaxes }}</p>
    </div>
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
  commission: string
}

const priceForm = reactive<PriceForm>({
  amount: '',
  commission: '0.018'
})

const formFields: FormField[] = [
  { key: 'amount', label: 'Amount', maxlength: 10 },
  { key: 'commission', label: 'Commission', maxlength: 10, suffix: '%' }
]

const feeTotal = computed(() => {
  const res = Number(priceForm.amount) * (Number(priceForm.commission) / 100)
  const str = res > 5 ? Number(res.toFixed(2)) : 5
  return str
})

const stampDuty = computed(() => {
  const res = Number(priceForm.amount) * 0.001
  return Number(res.toFixed(2))
})

const transferFee = computed(() => {
  const baseFee = Number(priceForm.amount) * 0.00002
  const fixedFee = 2 * 0.92347
  return Number((baseFee > fixedFee ? baseFee : fixedFee).toFixed(2))
})

const LiquidationFees = computed(() => {
  const res = Number(priceForm.amount) * 0.0000565
  return Number(res.toFixed(2))
})

const gTransactionLevy = computed(() => {
  const res = Number(priceForm.amount) * 0.000027
  return Number(res.toFixed(2))
})

const cTransactionLevy = computed(() => {
  const res = Number(priceForm.amount) * 0.0000015
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
</script>

<style lang="scss" scoped>
.subtitle {
  font-size: 10px;
  line-height: 1.5;
  color: #9e9e9e;
}
</style>
