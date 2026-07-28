<template>
  <div class="date-words">
    <!-- 快捷选择 -->
    <div class="quick-btns">
      <van-button
        size="small"
        :type="wordsStore.dateMode === 'single' && wordsStore.selectedDate === todayStr ? 'primary' : 'default'"
        @click="wordsStore.setToday()"
      >今日</van-button>
      <van-button
        size="small"
        :type="wordsStore.dateMode === 'week' ? 'primary' : 'default'"
        @click="wordsStore.setWeek()"
      >近7日</van-button>
    </div>

    <van-field
      :model-value="wordsStore.selectedDate"
      is-link
      readonly
      @click="showPicker = true"
    />
    <van-popup v-model:show="showPicker" position="bottom">
      <van-date-picker
        title="选择日期"
        :min-date="minDate"
        @confirm="onDateConfirm"
        @cancel="showPicker = false"
      />
    </van-popup>

    <template v-if="words.length > 0">
      <div class="word-list">
        <van-cell-group>
          <van-cell v-for="word in words" :key="word">
            <template #title>
              <span class="word-text" @click="speakWord(word, wordMap[word]?.audioUrl ?? '')">{{
                word
              }}</span>
              <span v-if="wordMap[word]?.phonetic" class="phon-text" @click="speakWord(word, wordMap[word]?.audioUrl ?? '')">{{
                wordMap[word]!.phonetic
              }}</span>
            </template>
            <template #right-icon>
              <van-button size="small" plain @click="toggleShow(word)">
                {{ expandedSet.has(word) ? '收起' : '详情' }}
              </van-button>
            </template>
            <template v-if="expandedSet.has(word)" #label>
              <div class="expanded">
                <p v-if="wordMap[word]?.chineseBrief" class="brief-mean">{{ wordMap[word]!.chineseBrief }}</p>
                <p v-if="wordMap[word]?.definition" class="definition">
                  {{ wordMap[word]!.definition }}
                </p>
                <p v-if="wordMap[word]?.example" class="example">📖 {{ wordMap[word]!.example }}</p>
                <p v-if="customExample(word)" class="example custom">✏️ {{ customExample(word) }}</p>
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </div>
    </template>
    <div v-else-if="wordsStore.selectedDate" class="empty">该日期暂无单词数据</div>
  </div>
</template>

<script setup lang="ts">
/**
 * 指定日期单词组件——支持单日选择与近7日快捷切换，van-date-picker 选具体日期
 * 默认只显示单词+音标，点击详情展开释义和例句
 */
import { useDictionary, speakWord } from '@/composables/useDictionary'
import { useWordsStore } from '@/store/words'
import { mockData } from '../mock-2026'

const wordsStore = useWordsStore()
const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
const minDate = new Date(2026, 0, 1)
const showPicker = ref(false)
const expandedSet = reactive(new Set<string>())

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

function toggleShow(word: string) {
  if (expandedSet.has(word)) expandedSet.delete(word)
  else expandedSet.add(word)
}

function onDateConfirm({ selectedValues }: { selectedValues: string[] }) {
  const [year, month, day] = selectedValues
  wordsStore.setSingleDate(`${year}-${month}-${day}`)
  showPicker.value = false
}

interface WordData {
  word: string
  phonetic: string
  audioUrl: string
  chineseBrief: string
  definition: string
  example: string
}
const wordMap = reactive<Record<string, WordData>>({})

watch(
  words,
  ws => {
    for (const w of ws) {
      if (wordMap[w]) continue
      const { data } = useDictionary(w)
      watch(
        data,
        d => {
          if (d) wordMap[w] = d
        },
        { immediate: true }
      )
    }
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.date-words { padding: 12px 0; }
.quick-btns { display: flex; gap: 8px; margin-bottom: 12px; }
.word-list { margin-top: 16px; }
.word-text { font-weight: 600; margin-right: 8px; }
.phon-text { font-size: 15px; color: var(--van-text-color-2); }
.brief-mean { font-size: 14px; color: var(--van-text-color-2); display: block; margin-top: 2px; white-space: pre-line; }
.definition { font-size: 14px; color: var(--van-text-color-2); margin-bottom: 4px; }
.example { font-size: 14px; color: var(--van-text-color-2); font-style: italic; }
.example.custom { color: var(--van-orange); }
.empty { text-align: center; padding: 40px 0; color: var(--van-text-color-3); font-size: 14px; }
</style>
