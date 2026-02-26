<template>
  <div class="portfolio-container">
    <div class="flex" style="margin-bottom: 16px">
      <div style="margin-right: 16px">
        <el-button type="primary" @click="allocateEqually"
          >⚖️ Allocate Equally (Use Real-Time Prices)</el-button
        >
        <el-button @click="fetchAllPrices">🔄 Refresh Market Data</el-button>
        <el-button type="success" @click="addStockSubItem">+ Add Stock Sub-item</el-button>
      </div>
      <div>
        <el-input-number
          v-model="totalAmount"
          :min="1000"
          :step="1000"
          style="width: 220px"
          label="Total Investment Amount"
        />
      </div>
    </div>

    <el-table :data="tableData" border style="width: 100%" :show-summary="false" size="small">
      <!-- Asset Class -->
      <el-table-column prop="category" label="Asset Class" width="180">
        <template #default="{ row, $index }">
          <span v-if="row.isStockParent">
            <button class="toggle-btn" @click="toggleStockExpanded">
              {{ stockExpanded ? '▼' : '▶' }}
            </button>
            Stocks (Total)
          </span>
          <strong v-else-if="row.isTotal">Total</strong>
          <span v-else>
            {{ row.name }}
            <el-button
              v-if="row.isStockChild"
              size="small"
              style="margin-left: 8px; padding: 2px 6px"
              @click="removeStockSubItem($index)"
              >×</el-button
            >
          </span>
        </template>
      </el-table-column>

      <!-- Target Ratio -->
      <el-table-column prop="targetRatio" label="Target Ratio" width="90" />

      <!-- Code -->
      <el-table-column prop="code" label="Code" width="108">
        <template #default="{ row }">
          <el-input
            v-if="row.isEditableCode"
            v-model="row.code"
            size="small"
            placeholder="6-digit code"
            @blur="onCodeBlur(row)"
            style="width: 90px"
          />
          <span v-else>{{ row.code || '—' }}</span>
        </template>
      </el-table-column>

      <!-- Current Shares -->
      <el-table-column label="Current Shares (Editable)" width="118">
        <template #default="{ row }">
          <el-input-number
            v-if="!row.isStockParent && !row.isTotal"
            v-model="row.shares"
            :min="0"
            :step="1"
            size="small"
            controls-position="right"
            style="width: 100px"
            @change="calculate"
          />
          <span v-else>—</span>
        </template>
      </el-table-column>

      <!-- Current Price -->
      <el-table-column prop="price" label="Current Price" width="100">
        <template #default="{ row }">
          {{
            row.price === null
              ? 'Fetch Failed'
              : row.price !== undefined && row.price !== '—'
              ? row.price.toFixed(3)
              : '—'
          }}
        </template>
      </el-table-column>

      <!-- Current Value -->
      <el-table-column prop="currentValue" label="Current Value" width="100">
        <template #default="{ row }">
          {{ row.currentValue !== undefined ? row.currentValue.toFixed(2) : '—' }}
        </template>
      </el-table-column>

      <!-- Weight % -->
      <el-table-column prop="weightPercent" label="Weight %" width="90">
        <template #default="{ row }">
          {{ row.weightPercent !== undefined ? row.weightPercent.toFixed(2) + '%' : '—' }}
        </template>
      </el-table-column>

      <!-- Rebalance Needed -->
      <el-table-column label="Rebalance Needed?(<15% or >35%)">
        <template #default="{ row }">
          <span :class="row.rebalanceClass">
            {{ row.rebalanceText || '—' }}
          </span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const defaultStocks = [
  { code: '513390', name: 'Nasdaq-100 ETF' },
  { code: '513180', name: 'Hang Seng Tech ETF' },
  { code: '159338', name: 'CSI A500 ETF' }
]

const totalAmount = ref(100000)
const stockExpanded = ref(true)

const stockChildren = ref(
  defaultStocks.map(item => ({
    ...item,
    shares: 0,
    price: undefined,
    currentValue: 0,
    weightPercent: 0,
    rebalanceText: '',
    rebalanceClass: '',
    isStockChild: true,
    isEditableCode: true
  }))
)

const otherAssets = ref([
  {
    name: 'Long-Term Bonds',
    code: '511090',
    targetRatio: '25%',
    type: 'bond',
    shares: 0,
    price: undefined,
    currentValue: 0,
    weightPercent: 0,
    rebalanceText: '',
    rebalanceClass: '',
    isEditableCode: true
  },
  {
    name: 'Cash / Short-Term Debt',
    code: '511360',
    targetRatio: '25%',
    type: 'cash',
    shares: 0,
    price: undefined,
    currentValue: 0,
    weightPercent: 0,
    rebalanceText: '',
    rebalanceClass: '',
    isEditableCode: true
  },
  {
    name: 'Gold',
    code: '518880',
    targetRatio: '25%',
    type: 'gold',
    shares: 0,
    price: undefined,
    currentValue: 0,
    weightPercent: 0,
    rebalanceText: '',
    rebalanceClass: '',
    isEditableCode: true
  }
])

const getSecId = code => {
  if (!code || !/^\d+$/.test(code)) return null
  if (code.length === 5 && code.startsWith('0')) {
    return `116.${code}`
  }
  if (code.length === 6) {
    if (['6', '5', '9'].some(prefix => code.startsWith(prefix))) {
      return `1.${code}`
    } else {
      return `0.${code}`
    }
  }
  return null
}

const getAllRows = () => [...stockChildren.value, ...otherAssets.value]

const fetchAllPrices = async () => {
  const rows = getAllRows().filter(row => {
    const code = (row.code || '').trim()
    return code && (/^\d{6}$/.test(code) || (code.length === 5 && code.startsWith('0')))
  })

  const secidList = rows.map(row => getSecId(row.code.trim())).filter(Boolean)

  if (secidList.length === 0) {
    calculate()
    return
  }

  const url = `https://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&fields=f2,f12,f13&secids=${secidList.join(
    ','
  )}`

  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error('Network response was not ok')
    const data = await res.json()

    const codeToRow = new Map()
    rows.forEach(row => {
      const clean = row.code.trim()
      codeToRow.set(clean, row)
    })

    if (data?.data?.diff) {
      for (const item of data.data.diff) {
        const rawCode = String(item.f12)
        let matchedCode = null

        if (codeToRow.has(rawCode)) {
          matchedCode = rawCode
        } else if (rawCode.length === 4 || rawCode.length === 5) {
          const padded = rawCode.padStart(5, '0')
          if (codeToRow.has(padded)) {
            matchedCode = padded
          }
        }

        if (matchedCode && typeof item.f2 === 'number' && item.f2 > 0) {
          const row = codeToRow.get(matchedCode)
          row.price = item.f2
        }
      }
    }

    rows.forEach(row => {
      if (row.price === undefined) {
        row.price = null
      }
    })

    calculate()
  } catch (e) {
    console.error('Failed to fetch batch prices:', e)
    ElMessage.error('Failed to fetch market data')
    rows.forEach(row => {
      if (row.price === undefined) row.price = null
    })
    calculate()
  }
}

const totalAssets = computed(() => {
  const stockTotal = stockChildren.value.reduce((sum, r) => sum + (r.currentValue || 0), 0)
  const otherTotal = otherAssets.value.reduce((sum, r) => sum + (r.currentValue || 0), 0)
  return stockTotal + otherTotal
})

const stockParent = computed(() => {
  const total = stockChildren.value.reduce((sum, r) => sum + (r.currentValue || 0), 0)
  return {
    isStockParent: true,
    category: 'Stocks (Total)',
    targetRatio: '25%',
    code: null,
    shares: null,
    price: '—',
    currentValue: total,
    weightPercent: totalAssets.value > 0 ? (total / totalAssets.value) * 100 : 0,
    rebalanceText: '',
    rebalanceClass: ''
  }
})

const totalRow = computed(() => ({
  isTotal: true,
  currentValue: totalAssets.value
}))

const tableData = computed(() => {
  const data = []
  data.push(stockParent.value)
  if (stockExpanded.value) {
    data.push(...stockChildren.value)
  }
  data.push(...otherAssets.value)
  data.push(totalRow.value)
  return data
})

const calculate = () => {
  const total = totalAssets.value
  const stockTotal = stockParent.value.currentValue
  const stockRebalance = total > 0 && (stockTotal / total < 0.15 || stockTotal / total > 0.35)

  stockChildren.value.forEach(row => {
    row.currentValue = (row.shares || 0) * (row.price || 0)
    row.weightPercent = total > 0 ? (row.currentValue / total) * 100 : 0
    row.rebalanceText = stockRebalance ? 'Yes' : 'No'
    row.rebalanceClass = stockRebalance ? 'rebalance-yes' : 'rebalance-no'
  })

  otherAssets.value.forEach(row => {
    row.currentValue = (row.shares || 0) * (row.price || 0)
    const weight = total > 0 ? row.currentValue / total : 0
    row.weightPercent = weight * 100
    const rebalance = weight < 0.15 || weight > 0.35
    row.rebalanceText = rebalance ? 'Yes' : 'No'
    row.rebalanceClass = rebalance ? 'rebalance-yes' : 'rebalance-no'
  })
}

const allocateEqually = async () => {
  await fetchAllPrices()

  const total = totalAmount.value
  const stockTarget = total * 0.25
  const otherTarget = total * 0.25

  const n = stockChildren.value.length
  const perStock = stockTarget / n
  stockChildren.value.forEach(row => {
    const price = row.price || 1
    row.shares = Math.floor(perStock / price)
  })

  otherAssets.value.forEach(row => {
    const price = row.price || 1
    row.shares = Math.floor(otherTarget / price)
  })

  calculate()
}

const addStockSubItem = () => {
  stockChildren.value.push({
    name: '',
    code: '',
    shares: 0,
    price: undefined,
    currentValue: 0,
    weightPercent: 0,
    rebalanceText: '',
    rebalanceClass: '',
    isStockChild: true,
    isEditableCode: true
  })
}

const removeStockSubItem = index => {
  const realIndex = index - 1
  if (stockChildren.value.length <= 1) {
    ElMessage.warning('At least one stock sub-item must remain')
    return
  }
  stockChildren.value.splice(realIndex, 1)
  calculate()
}

const onCodeBlur = row => {
  const code = (row.code || '').trim()
  if (/^\d{6}$/.test(code) || (code.length === 5 && code.startsWith('0'))) {
    fetchAllPrices()
  } else {
    ElMessage.error('Please enter a valid 6-digit code (or 5-digit HK code like 01810)')
    row.code = ''
  }
}

const toggleStockExpanded = () => {
  stockExpanded.value = !stockExpanded.value
  calculate()
}

onMounted(() => {
  fetchAllPrices()
})
</script>

<style scoped>
.portfolio-container {
  font-family: 'Segoe UI', sans-serif;
  padding: 20px;
  background: #f9f9f9;
}

.flex {
  display: flex;
}

:deep(.el-table .stock-parent) {
  background-color: #e6f7ff !important;
}

:deep(.el-table .stock-sub-item) {
  background-color: #f9f9ff;
}

.rebalance-yes {
  color: red;
  font-weight: bold;
}

.rebalance-no {
  color: green;
}

:deep(.el-table .total-row) {
  font-weight: bold;
  background-color: #f0f0f0 !important;
}

.toggle-btn {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: #333;
  margin-right: 8px;
}
</style>
