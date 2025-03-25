<template>
  <el-form :model="priceForm" label-width="auto" label-position="left">
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
    <div class="subtitle details" :class="{ 'show-details': isShowDetails }">
      <p>Fee: {{ priceForm.commission }}% ({{ feeTotal }})</p>
      <p v-if="priceForm.type === 'Sell'">Stamp Duty: 0.05% ({{ stampDuty }})</p>
      <p v-if="priceForm.partner === 'Sh'">Transfer Fee(shang hai): 0.001% ({{ transferFee }})</p>
    </div>
    <div class="more-btn" @click="toggleShowDetails">
      <template v-if="isShowDetails">
        <span>Hidden fee details</span>
        <el-icon><ArrowUpBold /></el-icon>
      </template>
      <template v-else>
        <span>Show fee details</span>
        <el-icon><ArrowDownBold /></el-icon>
      </template>
    </div>
    <p class="subtitle u-p-t-10">Total Taxes ≈ {{ totalTaxes }}</p>
  </el-form>
</template>

<script setup lang="ts">
interface FormField {
  selectList?: string[]
  type?: string
  key: keyof PriceForm
  label: string
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
  { key: 'type', label: 'Type', type: 'radio', selectList: ['Buy', 'Sell'] },
  {
    key: 'partner',
    label: 'Partner',
    type: 'radio',
    selectList: ['Sh', 'Sz']
  },
  { key: 'isExemptFive', label: 'Exempt Five', type: 'radio', selectList: ['Yes', 'No'] },
  { key: 'amount', label: 'Amount', type: 'input', maxlength: 10 },
  { key: 'commission', label: 'Commission', type: 'input', maxlength: 10, suffix: '%' }
]

const feeTotal = computed(() => {
  let fee = Number(priceForm.amount) * (Number(priceForm.commission) / 100)

  if (priceForm.isExemptFive !== 'Yes') {
    fee = fee > 5 ? Number(fee.toFixed(2)) : 5
  }

  return Number(fee.toFixed(2))
})

const stampDuty = computed(() => {
  const stampDuty = Number(priceForm.amount) * 0.0005
  return Number(stampDuty.toFixed(2))
})

const transferFee = computed(() => {
  const res = Number(priceForm.amount) * 0.00001
  return Number(res.toFixed(2))
})

const totalTaxes = computed(() => {
  let res = feeTotal.value

  if (priceForm.type === 'Sell') {
    res += stampDuty.value
  }

  if (priceForm.partner === 'Sh') {
    res += transferFee.value
  }

  return res.toFixed(2)
})

const isShowDetails = ref(false)
const toggleShowDetails = () => {
  isShowDetails.value = !isShowDetails.value
}
</script>

<style lang="scss" scoped>
.more-btn {
  display: flex;
  gap: 2px;
  align-items: center;
  font-size: 12px;
  color: #606266;
  cursor: pointer;
  user-select: none;
}
.subtitle {
  font-size: 10px;
  line-height: 1.5;
  color: #9e9e9e;
}
.details {
  height: 0;
  overflow: hidden;
}
.show-details {
  height: initial;
  overflow: initial;
  margin-bottom: 10px;
}
</style>
