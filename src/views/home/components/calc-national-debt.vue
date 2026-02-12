<template>
  <div class="national-debt">
    <el-form :model="priceForm" label-width="auto" label-position="left" class="hidden-xs">
      <el-form-item v-for="field in formFields" :key="field.key" :label="t(field.labelKey)">
        <el-input v-model="priceForm[field.key]" v-if="field.type === 'input'">
          <template v-if="field.suffix" #suffix>{{ field.suffix }}</template>
        </el-input>
      </el-form-item>
      <p class="subtitle">{{ t('fee') }}: {{ fee.toFixed(2) }}</p>
      <p class="subtitle">{{ t('income') }}: {{ income }}</p>
    </el-form>

    <van-form class="hidden-lg">
      <van-cell-group inset>
        <van-field
          v-model="priceForm[field.key]"
          v-for="field in formFields"
          :key="field.key"
          :label="t(field.labelKey)"
          :placeholder="t(field.labelKey)"
        >
          <template v-if="field.suffix" #right-icon>{{ field.suffix }}</template>
        </van-field>
        <div class="u-p-16">
          <p class="subtitle">{{ t('fee') }}: {{ fee.toFixed(2) }}</p>
          <p class="subtitle">{{ t('income') }}: {{ income }}</p>
        </div>
      </van-cell-group>
    </van-form>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

interface PriceForm {
  principal: string
  interestRate: string
  days: string
  feeRate: string
}

interface FormField {
  key: keyof PriceForm
  labelKey: string
  type?: string
  suffix?: string
}
const priceForm = reactive<PriceForm>({
  principal: '',
  interestRate: '',
  days: '',
  feeRate: '0.0001'
})

const formFields: FormField[] = [
  { key: 'principal', labelKey: 'principal', type: 'input' },
  { key: 'interestRate', labelKey: 'interestRate', type: 'input', suffix: '%' },
  { key: 'days', labelKey: 'days', type: 'input' },
  { key: 'feeRate', labelKey: 'rates', type: 'input', suffix: '%' }
]

const fee = computed(() => {
  const { principal, feeRate } = priceForm
  return Number(principal) * (Number(feeRate) / 100)
})

const income = computed(() => {
  const { principal, interestRate, days } = priceForm
  const res = (Number(principal) * (Number(interestRate) / 100) * Number(days)) / 365 - fee.value
  return res.toFixed(2)
})
</script>

<style lang="scss" scoped>
.subtitle {
  font-size: 10px;
  line-height: 1.5;
  color: var(--el-text-color-placeholder);
}
</style>
