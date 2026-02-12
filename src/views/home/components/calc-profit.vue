<template>
  <div>
    <el-form :model="priceForm" label-width="auto" label-position="left" class="hidden-xs">
      <el-form-item v-for="field in formFields" :key="field.key" :label="t(field.labelKey)">
        <el-input v-if="field.key === 'profit'" v-model="calcProfit" readonly></el-input>
        <el-input
          :readonly="field.readonly"
          v-model="priceForm[field.key]"
          @input="handleInput(field.key, $event)"
          v-else
        >
          <template v-if="field.suffix" #suffix>{{ field.suffix }}</template>
        </el-input>
      </el-form-item>
      <div class="subtitle">
        <span>{{ t('taxesG', { taxes: mainStore.totalTaxesG, total: totalTaxesG }) }}</span>
        <span>
          ≈
          <span class="net-profit">{{ netProfit }}</span>
        </span>
      </div>
    </el-form>

    <van-form class="form-wrap hidden-lg">
      <van-cell-group inset>
        <template v-for="field in formFields" :key="field.key">
          <van-field
            v-model="calcProfit"
            :label="t(field.labelKey)"
            readonly
            v-if="field.key === 'profit'"
          ></van-field>
          <van-field
            v-model="priceForm[field.key]"
            :label="t(field.labelKey)"
            :placeholder="t(field.labelKey)"
            @update:model-value="handleInput(field.key, $event)"
            v-else
          >
            <template v-if="field.suffix" #right-icon>{{ field.suffix }}</template>
          </van-field>
        </template>
      </van-cell-group>
      <div class="subtitle subtitle-xs">
        <span>{{ t('taxesG', { taxes: mainStore.totalTaxesG, total: totalTaxesG }) }}</span>
        <span>
          ≈
          <span class="net-profit">{{ netProfit }}</span>
        </span>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { limitDecimalInput } from '@/assets/js/common'
import { useMainStore } from '@/store/main'

const { t } = useI18n()
const mainStore = useMainStore()

const props = defineProps({
  change: {
    type: String,
    default: ''
  }
})

interface PriceForm {
  amount: string
  change: string
  profit: string
}

interface FormField {
  key: keyof PriceForm
  labelKey: string
  maxlength?: number
  readonly?: boolean
  suffix?: string
}

const formFields: FormField[] = [
  { key: 'amount', labelKey: 'amount', maxlength: 10 },
  { key: 'change', labelKey: 'change', maxlength: 10, suffix: '%' },
  { key: 'profit', labelKey: 'profit', readonly: true }
]

const priceForm = reactive<PriceForm>({
  amount: '',
  change: '',
  profit: ''
})

const emit = defineEmits(['inputAmount'])
const handleInput = (field: keyof PriceForm, value: string) => {
  priceForm[field] = limitDecimalInput(value, 4, field === 'change')

  if (field === 'amount') {
    emit('inputAmount', priceForm[field])
  }
}

watch(
  () => props.change,
  newQuestion => {
    priceForm.change = newQuestion
  }
)

const calcProfit = computed(() => {
  const { amount, change } = priceForm
  const amountNum = Number(amount)
  const changeNum = Number(change)

  if (amountNum === 0 || changeNum === 0) {
    priceForm.profit = ''
    return
  }

  const res = (amountNum * changeNum) / 100
  return res.toFixed(2)
})

const totalTaxesG = computed(() => {
  return Number(mainStore.totalTaxesG) * 2
})

const netProfit = computed(() => {
  if (calcProfit.value) {
    return (Math.abs(Number(calcProfit.value)) - totalTaxesG.value).toFixed(2)
  } else {
    return
  }
})
</script>

<style lang="scss" scoped>
.form-wrap {
  width: 100%;
}
.subtitle {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  font-size: 10px;
  line-height: 1.5;
  color: var(--el-text-color-placeholder);
  .net-profit {
    font-size: 14px;
    color: #fff;
  }
}
.subtitle-xs {
  margin: 0 32px;
}
</style>