import { reactive, computed, toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

export interface WordData {
  word: string
  phonetic: string
  audioUrl: string
  chineseBrief: string
  definition: string
  example: string
}

// Free Dictionary API 词性缩写映射
const POS_MAP: Record<string, string> = {
  noun: 'n.',
  verb: 'v.',
  adjective: 'adj.',
  adverb: 'adv.',
  preposition: 'prep.',
  conjunction: 'conj.',
  pronoun: 'pron.',
  interjection: 'interj.',
  numeral: 'num.',
  article: 'art.',
  determiner: 'det.'
}

// 模块级缓存，避免重复请求
const cache = reactive(new Map<string, WordData>())
const loadingSet = reactive(new Set<string>())

/**
 * 获取单词的发音、中文释义和英文定义
 * 外部依赖：Free Dictionary API（获取音标/音频/定义/例句）+ MyMemory API（翻译释义为中文）
 */
export function useDictionary(word: MaybeRefOrGetter<string>) {
  const w = computed(() => toValue(word))
  const data = computed(() => cache.get(w.value) ?? null)
  const isLoading = computed(() => loadingSet.has(w.value))

  // 串行请求两个 API：先查词典获取各词性释义，再逐条翻译为中文
  async function fetchWord() {
    const key = w.value
    if (!key || cache.has(key) || loadingSet.has(key)) return

    loadingSet.add(key)

    try {
      const dictRes = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(key)}`
      )
      if (!dictRes.ok) throw new Error(`"${key}" not found`)

      const dictData = await dictRes.json()
      const entry = dictData[0]
      const phonetic = entry.phonetic || entry.phonetics?.find((p: any) => p.text)?.text || ''
      const audioUrl = entry.phonetics?.find((p: any) => p.audio)?.audio || ''

      // 按词性分组，每个词性取前 2 条定义
      const meanings: { pos: string; defs: string[] }[] = entry.meanings?.map((m: any) => ({
        pos: POS_MAP[m.partOfSpeech] || m.partOfSpeech,
        defs: m.definitions.slice(0, 2).map((d: any) => d.definition)
      })) || []

      const firstExample = entry.meanings?.[0]?.definitions?.[0]?.example || ''

      let chineseBrief = ''
      let definition = ''

      // 最多取 3 个词性组，逐条调用 MyMemory 翻译
      for (const m of meanings.slice(0, 3)) {
        const transRes = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(m.defs[0])}&langpair=en|zh-CN`
        )
        let cn = ''
        if (transRes.ok) {
          const transData = await transRes.json()
          cn = transData.responseData?.translatedText || ''
        }
        chineseBrief += `${m.pos} ${cn}\n`
        definition += `${m.pos} ${m.defs[0]}\n`
      }

      chineseBrief = chineseBrief.trim()
      definition = definition.trim()

      cache.set(key, { word: key, phonetic, audioUrl, chineseBrief, definition, example: firstExample })
    } catch {
      const fallback = cache.get(key)
      if (!fallback) {
        cache.set(key, { word: key, phonetic: '', audioUrl: '', chineseBrief: '', definition: '', example: '' })
      }
    } finally {
      loadingSet.delete(key)
    }
  }

  // 单词变化时触发请求
  watch(w, (val) => {
    if (val) fetchWord()
  }, { immediate: true })

  return { data, isLoading }
}

/**
 * 朗读单词：优先播放远程音频，回退到浏览器 SpeechSynthesis
 */
export function speakWord(word: string, audioUrl: string) {
  if (audioUrl) {
    const audio = new Audio(audioUrl)
    audio.play().catch(() => {
      const u = new SpeechSynthesisUtterance(word)
      u.lang = 'en-US'
      speechSynthesis.speak(u)
    })
  } else {
    const u = new SpeechSynthesisUtterance(word)
    u.lang = 'en-US'
    speechSynthesis.speak(u)
  }
}
