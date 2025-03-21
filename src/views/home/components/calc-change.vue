<template>
  <el-form :model="priceForm" label-width="auto" label-position="left">
    <!-- 使用动态渲染减少重复代码 -->
    <el-form-item v-for="field in formFields" :key="field.key" :label="field.label">
      <el-input
        :readonly="field.readonly"
        :maxlength="field.maxlength"
        v-model="priceForm[field.key]"
        @input="handleInput(field.key, $event)"
      >
        <!-- 动态添加 suffix 插槽 -->
        <template v-if="field.suffix" #suffix>{{ field.suffix }}</template>
      </el-input>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { limitDecimalInput } from '@/assets/js/common'

// 定义表单数据的接口
interface PriceForm {
  costPrice?: string
  currentPrice?: string
  change?: string
}

// 定义表单字段配置的接口
interface FormField {
  key: keyof PriceForm // 确保 key 是 PriceForm 的合法键
  label: string
  maxlength?: number
  readonly?: boolean
  suffix?: string
}

// 使用 reactive 创建响应式表单对象
const priceForm = reactive<PriceForm>({
  costPrice: '',
  currentPrice: '',
  change: ''
})

// 定义表单字段配置
const formFields: FormField[] = [
  { key: 'costPrice', label: 'Cost price', maxlength: 10 },
  { key: 'currentPrice', label: 'Current price', maxlength: 10 },
  { key: 'change', label: 'Change', readonly: true, suffix: '%' }
]

// 处理输入值的通用方法
const handleInput = (field: keyof PriceForm, value: string) => {
  priceForm[field] = limitDecimalInput(value, 4)
  calcChange()
}

const calcChange = () => {
  const { currentPrice, costPrice } = priceForm
  const currentPriceNum = Number(currentPrice)
  const costPriceNum = Number(costPrice)

  if (currentPriceNum === 0 || costPriceNum === 0) {
    priceForm.change = ''
    return
  }

  const res = ((currentPriceNum - costPriceNum) / costPriceNum) * 100
  priceForm.change = res.toFixed(2)
}
</script>

<style lang="scss" scoped></style>
