<template>
  <div>
    <el-form :model="priceForm" label-width="auto" label-position="left" class="hidden-xs">
      <el-form-item v-for="field in formFields" :key="field.key" :label="t(field.labelKey)">
        <el-radio-group v-model="priceForm[field.key]" v-if="field.type === 'radio'">
          <el-radio :value="select" v-for="select in field.selectList" :key="select">
            {{ t(select.toLowerCase()) }}
          </el-radio>
        </el-radio-group>
        <el-input v-model="priceForm[field.key]" v-if="field.type === 'input'">
          <template v-if="field.suffix" #suffix>{{ field.suffix }}</template>
        </el-input>
      </el-form-item>
      <FeeDetailA :price-form="priceForm" />
    </el-form>

    <van-form class="form-wrap hidden-lg">
      <van-cell-group inset>
        <template v-for="field in formFields" :key="field.key">
          <van-radio-group
            direction="horizontal"
            v-model="priceForm[field.key]"
            v-if="field.type === 'radio'"
          >
            <van-radio
              :name="select"
              v-for="select in field.selectList"
              :key="select"
              class="xs-radio-item"
            >
              {{ t(select.toLowerCase()) }}
            </van-radio>
          </van-radio-group>
          <van-field
            v-model="priceForm[field.key]"
            :label="t(field.labelKey)"
            :placeholder="t(field.labelKey)"
            v-if="field.type === 'input'"
          >
            <template v-if="field.suffix" #right-icon>{{ field.suffix }}</template>
          </van-field>
        </template>
        <FeeDetailA :price-form="priceForm" class="u-p-16" />
      </van-cell-group>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import FeeDetailA from './fee-detail-a.vue'

const { t } = useI18n()

interface FormField {
  selectList?: string[]
  type?: string
  key: keyof PriceForm
  labelKey: string
  maxlength?: number
  suffix?: string
  readonly?: boolean
}

interface PriceForm {
  type: string
  partner: string
  isExemptFive: string
  amount: string
  commission: string
}

const priceForm = reactive<PriceForm>({
  type: 'Buy',
  partner: 'Sh',
  isExemptFive: 'Yes',
  amount: '',
  commission: '0.0085'
})

const formFields: FormField[] = [
  { key: 'type', labelKey: 'type', type: 'radio', selectList: ['Buy', 'Sell'] },
  {
    key: 'partner',
    labelKey: 'partner',
    type: 'radio',
    selectList: ['Sh', 'Sz']
  },
  { key: 'isExemptFive', labelKey: 'exemptFive', type: 'radio', selectList: ['Yes', 'No'] },
  { key: 'amount', labelKey: 'amount', type: 'input', maxlength: 10 },
  { key: 'commission', labelKey: 'commission', type: 'input', maxlength: 10, suffix: '%' }
]
</script>

<style lang="scss" scoped>
.xs-radio-item {
  width: 100px;
  padding: var(--van-cell-vertical-padding) var(--van-cell-horizontal-padding);
}
</style>