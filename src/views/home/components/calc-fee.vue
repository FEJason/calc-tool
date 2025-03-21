<template>
  <el-form :model="priceForm" label-width="auto" label-position="left">
    <el-form-item v-for="field in formFields" :key="field.key" :label="field.label">
      <el-input v-model="priceForm[field.key]">
        <template v-if="field.suffix" #suffix>{{ field.suffix }}</template>
      </el-input>
    </el-form-item>
    <p class="subtitle">Fee: 0.018% ({{ feeTotal }}); Stamp duty: 0.1% ({{ stampDuty }})</p>
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
  totalTaxes: string
}

const priceForm = reactive<PriceForm>({
  amount: '',
  commission: '0.018',
  totalTaxes: ''
})

const formFields: FormField[] = [
  { key: 'amount', label: 'Amount', maxlength: 10 },
  { key: 'commission', label: 'Commission', maxlength: 10, suffix: '%' }
  // { key: 'totalTaxes', label: 'Total taxes', readonly: true }
]

const feeTotal = computed(() => {
  const res = Number(priceForm.amount) * (Number(priceForm.commission) / 100)
  return res.toFixed(2)
})

const stampDuty = computed(() => {
  const res = Number(priceForm.amount) * 0.001
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
