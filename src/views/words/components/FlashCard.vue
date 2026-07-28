<template>
  <div class="flash-card">
    <template v-if="wordItems.length > 0">
      <div v-if="isLoading" class="loading">加载中...</div>
      <template v-else-if="data">
        <div class="card" @click="speakWord(data.word, data.audioUrl)">
          <div class="word-main">{{ data.word }}</div>
          <div class="word-phonetic" v-if="data.phonetic">{{ data.phonetic }}</div>
          <div class="word-chinese" v-if="data.chineseBrief">{{ data.chineseBrief }}</div>
          <div class="word-definition" v-if="data.definition">{{ data.definition }}</div>
          <div class="word-example" v-if="data.example">📖 {{ data.example }}</div>
          <div class="word-example custom" v-if="customExample">✏️ {{ customExample }}</div>
        </div>
      </template>
      <div v-else class="empty">暂无数据</div>

      <div class="nav-buttons">
        <van-button @click="prevWord" :disabled="currentIndex === 0" plain size="small">上一个</van-button>
        <span class="counter">{{ currentIndex + 1 }} / {{ wordItems.length }}</span>
        <van-button @click="nextWord" :disabled="currentIndex === wordItems.length - 1" plain size="small">下一个</van-button>
      </div>
    </template>
    <div v-else class="empty">暂无单词数据</div>
  </div>
</template>

<script setup lang="ts">
/**
 * 背单词组件——卡片式浏览所有单词，支持前后翻页，点击卡片朗读
 * 数据源：mock-2026.ts 全部单词，通过 useDictionary 获取词典数据
 */
import { useDictionary, speakWord } from '@/composables/useDictionary'
import { useWordsStore } from '@/store/words'
import { mockData } from '../mock-2026'

const wordsStore = useWordsStore()
const currentIndex = ref(0)
const wordItems = computed(() => {
  if (wordsStore.dateMode === 'week') {
    const seen = new Set<string>()
    const items: { word: string; example?: string }[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      const dayWords = mockData.find(m => m.date === ds)?.words ?? []
      for (const w of dayWords) {
        if (!seen.has(w.word)) {
          seen.add(w.word)
          items.push(w)
        }
      }
    }
    return items
  }
  return mockData.find(d => d.date === wordsStore.selectedDate)?.words ?? []
})
const currentItem = computed(() => wordItems.value[currentIndex.value])
const currentWord = computed(() => currentItem.value?.word ?? '')
const customExample = computed(() => currentItem.value?.example ?? '')

const { data, isLoading } = useDictionary(currentWord)

// 日期切换时重置翻页索引
watch(wordItems, () => { currentIndex.value = 0 })

function nextWord() {
  if (currentIndex.value < wordItems.value.length - 1) currentIndex.value++
}

function prevWord() {
  if (currentIndex.value > 0) currentIndex.value--
}
</script>

<style lang="scss" scoped>
.flash-card { padding: 20px 0; }
.card {
  text-align: center; background: var(--van-background-2); border-radius: 12px;
  padding: 32px 20px; cursor: pointer; user-select: none;
  &:active { opacity: 0.8; }
}
.word-main { font-size: 32px; font-weight: 700; margin-bottom: 8px; }
.word-phonetic { font-size: 16px; color: var(--van-text-color-3); margin-bottom: 16px; }
.word-chinese { font-size: 20px; color: var(--van-text-color-2); margin-bottom: 12px; }
.word-definition { font-size: 15px; color: var(--van-text-color); margin-bottom: 8px; line-height: 1.5; }
.word-example { font-size: 14px; color: var(--van-text-color-3); font-style: italic; line-height: 1.6; }
.word-example.custom { color: var(--van-orange); }
.nav-buttons { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 24px; }
.counter { font-size: 14px; color: var(--van-text-color-3); }
.loading, .empty { text-align: center; padding: 40px 0; color: var(--van-text-color-3); font-size: 14px; }
</style>
