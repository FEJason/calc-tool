<template>
  <div>
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
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  priceForm: {
    type: Object,
    default() {
      return {}
    }
  }
})

const feeTotal = computed(() => {
  const { amount, commission, isExemptFive } = props.priceForm

  let fee = Number(amount) * (Number(commission) / 100)

  if (isExemptFive !== 'Yes') {
    fee = fee > 5 ? Number(fee.toFixed(2)) : 5
  }

  return Number(fee.toFixed(2))
})

const stampDuty = computed(() => {
  const stampDuty = Number(props.priceForm.amount) * 0.0005
  return Number(stampDuty.toFixed(2))
})

const transferFee = computed(() => {
  const res = Number(props.priceForm.amount) * 0.00001
  return Number(res.toFixed(2))
})

const totalTaxes = computed(() => {
  let res = feeTotal.value

  if (props.priceForm.type === 'Sell') {
    res += stampDuty.value
  }

  if (props.priceForm.partner === 'Sh') {
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
  color: var(--el-text-color-regular);
  cursor: pointer;
  user-select: none;
}
.subtitle {
  font-size: 10px;
  line-height: 1.5;
  color: var(--el-text-color-placeholder);
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
