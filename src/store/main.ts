export const useMainStore = defineStore('counter', () => {
  const totalTaxesG = ref('')
  const setTotalTaxesG = (val: string) => {
    totalTaxesG.value = val
  }

  return {
    totalTaxesG,
    setTotalTaxesG
  }
})
