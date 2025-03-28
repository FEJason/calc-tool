<template>
  <div>
    <el-form :model="priceForm" label-width="auto" label-position="left" class="hidden-xs">
      <el-form-item v-for="field in formFields" :key="field.key" :label="field.label">
        <el-input v-model="priceForm[field.key]">
          <template v-if="field.suffix" #suffix>{{ field.suffix }}</template>
        </el-input>
      </el-form-item>
      <FeeDetailG :price-form="priceForm" />
    </el-form>

    <van-form class="form-wrap hidden-lg">
      <van-cell-group inset>
        <van-field
          v-model="priceForm[field.key]"
          v-for="field in formFields"
          :key="field.key"
          :label="field.label"
          :placeholder="field.label"
        >
          <template v-if="field.suffix" #right-icon>{{ field.suffix }}</template>
        </van-field>
        <FeeDetailG :price-form="priceForm" class="u-p-16" />
      </van-cell-group>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import FeeDetailG from './fee-detail-g.vue'

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

const getRate = async (today: string) => {
  const res = await fetch('https://v6.exchangerate-api.com/v6/4338afffc401a6ad0858f2d6/latest/HKD')
  if (res.ok) {
    const data = await res.json()
    priceForm.rate = data.conversion_rates.CNY

    const newData = {
      date: today,
      baseCurrency: data.base_code,
      exchangeRates: data.conversion_rates.CNY
    }
    localStorage.setItem('exchangeRatesData', JSON.stringify(newData))
  }
}

const loadExchangeRates = () => {
  const today = new Date().toISOString().split('T')[0]
  const storedData = localStorage.getItem('exchangeRatesData')

  if (storedData) {
    const parsedData = JSON.parse(storedData)
    if (parsedData.date === today) {
      priceForm.rate = parsedData.exchangeRates
      return
    }
  }

  getRate(today)
}

onMounted(() => {
  loadExchangeRates()
})
</script>

<style lang="scss" scoped></style>
