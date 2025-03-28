<template>
  <div>
    <el-form :model="priceForm" label-width="auto" label-position="left" class="hidden-xs">
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

    <van-form class="form-wrap hidden-lg">
      <van-cell-group inset>
        <van-field
          v-model="priceForm[field.key]"
          v-for="field in formFields"
          :key="field.key"
          :label="field.label"
          :placeholder="field.label"
          @update:model-value="handleInput(field.key, $event)"
        >
          <template v-if="field.suffix" #right-icon>{{ field.suffix }}</template>
        </van-field>
      </van-cell-group>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { limitDecimalInput } from '@/assets/js/common'

interface PriceForm {
  amount: string
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
  { key: 'amount', label: 'Amount', maxlength: 10 },
  { key: 'change', label: 'Change', maxlength: 10, suffix: '%' },
  { key: 'profit', label: 'Profit', readonly: true }
]

const priceForm = reactive<PriceForm>({
  amount: '',
  change: '',
  profit: ''
})

const handleInput = (field: keyof PriceForm, value: string) => {
  priceForm[field] = limitDecimalInput(value, 4, field === 'change')
  calcProfit()
}

const calcProfit = () => {
  const { amount, change } = priceForm
  const amountNum = Number(amount)
  const changeNum = Number(change)

  if (amountNum === 0 || changeNum === 0) {
    priceForm.profit = ''
    return
  }

  const res = (amountNum * changeNum) / 100
  priceForm.profit = res.toFixed(2)
}
</script>

<style lang="scss" scoped>
.form-wrap {
  width: 100%;
}
</style>
