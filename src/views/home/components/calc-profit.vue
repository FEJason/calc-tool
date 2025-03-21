<template>
  <el-form :model="priceForm" label-width="auto" label-position="left">
    <el-form-item v-for="field in formFields" :key="field.key" :label="field.label">
      <el-input
        :readonly="field.readonly"
        v-model="priceForm[field.key]"
        @input="handleInput(field.key, $event)"
      >
        <template v-if="field.suffix" #suffix>{{ field.suffix }}</template>
      </el-input>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { limitDecimalInput } from '@/assets/js/common'

interface PriceForm {
  totalCost: string
  change: string
  profit: string
}

interface FormField {
  key: keyof PriceForm
  label: string
  maxlength?: number
  readonly?: boolean
  suffix?: string
}

const formFields: FormField[] = [
  { key: 'totalCost', label: 'Total cost', maxlength: 10 },
  { key: 'change', label: 'Change', maxlength: 10, suffix: '%' },
  { key: 'profit', label: 'Profit', readonly: true }
]

const priceForm = reactive<PriceForm>({
  totalCost: '',
  change: '',
  profit: ''
})

const handleInput = (field: keyof PriceForm, value: string) => {
  priceForm[field] = limitDecimalInput(value, 4, field === 'change')
  calcProfit()
}

const calcProfit = () => {
  const { totalCost, change } = priceForm
  const totalCostNum = Number(totalCost)
  const changeNum = Number(change)

  if (totalCostNum === 0 || changeNum === 0) {
    priceForm.profit = ''
    return
  }

  const res = (totalCostNum * changeNum) / 100
  priceForm.profit = res.toFixed(2)
}
</script>

<style lang="scss" scoped></style>
