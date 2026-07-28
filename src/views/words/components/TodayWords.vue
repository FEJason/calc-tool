<template>
  <div class="today-words">
    <template v-if="words.length > 0">
      <van-cell-group>
        <van-cell v-for="word in words" :key="word">
          <template #title>
            <span class="word-text" @click="speakWord(word, wordMap[word]?.audioUrl ?? '')">{{ word }}</span>
            <span v-if="wordMap[word]?.phonetic" class="phon-text" @click="speakWord(word, wordMap[word]?.audioUrl ?? '')">{{ wordMap[word]!.phonetic }}</span>
          </template>
          <template #right-icon>
            <van-button size="small" plain @click="toggleShow(word)">
              {{ expandedSet.has(word) ? '收起' : '详情' }}
            </van-button>
          </template>
          <template v-if="expandedSet.has(word)" #label>
            <div class="expanded">
              <p v-if="wordMap[word]?.chineseBrief" class="brief-mean">{{ wordMap[word]!.chineseBrief }}</p>
              <p v-if="wordMap[word]?.definition" class="definition">{{ wordMap[word]!.definition }}</p>
              <p v-if="wordMap[word]?.example" class="example">📖 {{ wordMap[word]!.example }}</p>
              <p v-if="customExample(word)" class="example custom">✏️ {{ customExample(word) }}</p>
            </div>
          </template>
        </van-cell>
      </van-cell-group>
    </template>
    <div v-else class="empty">暂无单词数据</div>
  </div>
</template>

<script setup lang="ts">
/**
 * 今日单词组件——展示当日单词列表，每行显示单词+音标+简明中文释义
 * 右侧详情按钮展开/收起英文定义和例句
 * Expose: (none)
 */
import { useDictionary, speakWord } from '@/composables/useDictionary'
import { useWordsStore } from '@/store/words'
import { mockData } from '../mock-2026'

const wordsStore = useWordsStore()
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
const words = computed(() => wordItems.value.map(w => w.word))

function customExample(word: string) {
  return wordItems.value.find(w => w.word === word)?.example ?? ''
}

// 记录当前展开详情的单词集合
const expandedSet = reactive(new Set<string>())

function toggleShow(word: string) {
  if (expandedSet.has(word)) expandedSet.delete(word)
  else expandedSet.add(word)
}

interface WordData { word: string; phonetic: string; audioUrl: string; chineseBrief: string; definition: string; example: string }
const wordMap = reactive<Record<string, WordData>>({})

for (const w of words.value) {
  const { data } = useDictionary(w)
  watch(data, (d) => { if (d) wordMap[w] = d }, { immediate: true })
}
</script>

<style lang="scss" scoped>
.today-words { padding: 12px 0; }
.word-text { font-weight: 600; margin-right: 8px; }
.phon-text { font-size: 13px; color: var(--van-text-color-2); }
.brief-mean { font-size: 12px; color: var(--van-text-color-2); display: block; margin-top: 2px; white-space: pre-line; }
.definition { font-size: 14px; color: var(--van-text-color-2); margin-bottom: 4px; }
.example { font-size: 14px; color: var(--van-text-color-2); font-style: italic; }
.example.custom { color: var(--van-orange); }
.empty { text-align: center; padding: 40px 0; color: var(--van-text-color-3); font-size: 14px; }
</style>
