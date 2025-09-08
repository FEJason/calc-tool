<template>
  <div>
    <el-form :model="priceForm" label-width="auto" label-position="left" class="hidden-xs">
      <el-form-item v-for="field in formFields" :key="field.key" :label="field.label">
        <el-radio-group v-model="priceForm[field.key]" v-if="field.type === 'radio'">
          <el-radio :value="select" v-for="select in field.selectList" :key="select">
            {{ select }}
          </el-radio>
        </el-radio-group>
        <el-input v-model="priceForm[field.key]" v-if="field.type === 'input'">
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

const props = defineProps({
  amount: {
    type: String,
    default: ''
  }
})

interface FormField {
  key: keyof PriceForm
  label: string
  type?: string
  selectList?: string[]
  maxlength?: number
  suffix?: string
  readonly?: boolean
}

interface PriceForm {
  isExemptFive: string
  amount: string
  rates: string
  ratesDate: string
  commission: string
}

const priceForm = reactive<PriceForm>({
  isExemptFive: 'Yes',
  amount: '',
  rates: '0.92',
  ratesDate: '',
  commission: '0.01'
})

const formFields: FormField[] = [
  { key: 'isExemptFive', label: 'Exempt Five', type: 'radio', selectList: ['Yes', 'No'] },
  { key: 'amount', type: 'input', label: 'Amount', maxlength: 10 },
  { key: 'rates', type: 'input', label: 'Rate', maxlength: 10 },
  { key: 'commission', type: 'input', label: 'Commission', maxlength: 10, suffix: '%' }
]

const getRate = async (today: string) => {
  const res = await fetch('https://v6.exchangerate-api.com/v6/4338afffc401a6ad0858f2d6/latest/HKD')
  if (res.ok) {
    const data = await res.json()
    priceForm.rates = data.conversion_rates.CNY

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
      priceForm.rates = parsedData.exchangeRates
      priceForm.ratesDate = parsedData.date
      return
    }
  }

  getRate(today)
}

watch(
  () => props.amount,
  newQuestion => {
    priceForm.amount = newQuestion
  }
)

onMounted(() => {
  loadExchangeRates()
})
</script>

<style lang="scss" scoped></style>
