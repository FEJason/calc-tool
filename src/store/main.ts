export const useMainStore = defineStore('counter', () => {
  const totalTaxesG = ref('')
  const setTotalTaxesG = (val: string) => {
    totalTaxesG.value = val
  }

  const rates = ref('0.92')
  const setRates = (val: string) => {
    rates.value = val
  }

  return {
    totalTaxesG,
    setTotalTaxesG,
    rates,
    setRates
  }
})
