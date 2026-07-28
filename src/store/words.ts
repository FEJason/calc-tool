/**
 * 单词页面共享日期状态——三个标签页统一响应日期/范围切换
 */
export const useWordsStore = defineStore('words', () => {
  const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`

  const selectedDate = ref(today)
  /** 'single'=单日, 'week'=近7日 */
  const dateMode = ref<'single' | 'week'>('single')

  function setSingleDate(date: string) {
    selectedDate.value = date
    dateMode.value = 'single'
  }

  function setToday() {
    selectedDate.value = today
    dateMode.value = 'single'
  }

  function setWeek() {
    selectedDate.value = today
    dateMode.value = 'week'
  }

  return { selectedDate, dateMode, setSingleDate, setToday, setWeek }
})
