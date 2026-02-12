<template>
  <div class="tts-player">
    <!-- 显示当前页内容 -->
    <el-input
      v-model="currentPageText"
      type="textarea"
      :autosize="{ minRows: 6, maxRows: 20 }"
      placeholder="加载中..."
      readonly
      class="text-input"
    />

    <!-- 页码选择 -->
    <div class="page-control" style="margin: 16px 0; display: flex; align-items: center; gap: 12px">
      <span>{{ t('pageInfo', { totalPages }) }}</span>
      <el-input-number
        v-model="currentPage"
        :min="1"
        :max="totalPages"
        size="small"
        @change="onPageChange"
        :disabled="isSpeaking || loading"
      />
      <el-button size="small" @click="jumpToPage(currentPage)" :disabled="loading">{{
        t('jumpTo')
      }}</el-button>
    </div>

    <!-- 控制按钮 -->
    <div class="controls">
      <el-button
        @click="togglePlay"
        :disabled="loading || (isSpeaking && !isPaused)"
        type="success"
        round
      >
        {{ isPaused ? t('continue') : loading ? t('loading') : t('play') }}
      </el-button>
      <el-button @click="pause" :disabled="!isSpeaking || isPaused" type="warning" round>
        {{ t('pause') }}
      </el-button>
      <el-button @click="stop" :disabled="!isSpeaking && !isPaused" type="danger" round>
        {{ t('stop') }}
      </el-button>
    </div>

    <!-- 设置 -->
    <el-form label-position="left" label-width="80px" class="settings">
      <el-form-item :label="t('speed')">
        <el-slider
          v-model="rate"
          :min="0.5"
          :max="10"
          :step="0.5"
          show-input
          input-size="small"
          style="width: 200px"
        />
        <span class="rate-value">{{ rate.toFixed(1) }}x</span>
      </el-form-item>

      <el-form-item :label="t('voice')">
        <el-select
          v-model="selectedVoiceName"
          placeholder="请选择发音人"
          @change="updateVoice"
          style="width: 240px"
        >
          <el-option value="" :label="t('default')" />
          <el-option
            v-for="voice in voices"
            :key="voice.name + voice.lang"
            :label="`${voice.name} (${voice.lang})`"
            :value="voice.name"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="t('book')">
        <el-select
          v-model="currentBookName"
          placeholder="请选择书籍"
          @change="onBookChange"
          style="width: 240px"
        >
          <el-option
            v-for="book in books"
            :key="book.value"
            :label="book.name"
            :value="book.value"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <el-alert
      v-if="status"
      :title="status"
      :type="alertType"
      show-icon
      :closable="false"
      style="margin-top: 16px"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const { t } = useI18n()

const books = ref([
  { name: 'dengxiaopingshidai', value: 'dengxiaoping.txt' },
  { name: 'caiwuziyouzilu', value: 'caiwuziyou.txt' }
])
const currentBookName = ref(books.value[0].value)
const fullText = ref('')
const pages = ref([])
const currentPage = ref(1)
const currentPageText = ref('')
const totalPages = ref(1)

const rate = ref(1.0)
const voices = ref([])
const selectedVoiceName = ref('')
let currentVoice = null

const isSpeaking = ref(false)
const isPaused = ref(false)
const status = ref(t('restoring'))
const alertType = ref('info')
const loading = ref(true)

const synth = window.speechSynthesis
let utterance = null

// 获取当前书籍的缓存键
const getCacheKey = () => `tts-book-page-${currentBookName.value}`

// ===== 加载语音 =====
const loadVoices = () => {
  const availableVoices = synth.getVoices()
  voices.value = availableVoices.filter(v => v.lang === 'zh-CN')
}

// ===== 加载当前书籍 =====
const loadBookFromPublic = async () => {
  loading.value = true
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}books/${currentBookName.value}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)

    const content = await response.text()
    fullText.value = content.trim()

    // 分页
    pages.value = paginateText(fullText.value, 238)
    totalPages.value = pages.value.length

    // 从 localStorage 恢复该书的进度
    const cacheKey = getCacheKey()
    const saved = localStorage.getItem(cacheKey)
    let restoredPage = 1
    if (saved) {
      const { page, rate: rateValue } = JSON.parse(saved)
      if (page >= 1 && page <= totalPages.value) {
        restoredPage = page
        status.value = t('restored', { page })
        alertType.value = 'info'
        rate.value = rateValue
      }
    }

    currentPage.value = restoredPage
    updateCurrentPageText()
    status.value = t('loaded', { chars: fullText.value.length, pages: totalPages.value })
    alertType.value = 'success'
  } catch (err) {
    console.error('加载书籍失败:', err)
    fullText.value = ''
    pages.value = []
    totalPages.value = 1
    currentPage.value = 1
    currentPageText.value = ''
    status.value = t('loadFailed', { error: err.message })
    alertType.value = 'error'
  } finally {
    loading.value = false
  }
}

// 更新当前页显示文本
const updateCurrentPageText = () => {
  if (pages.value.length === 0) {
    currentPageText.value = ''
    return
  }
  const idx = currentPage.value - 1
  currentPageText.value = pages.value[idx] || ''
}

// 跳转到指定页
const jumpToPage = page => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  updateCurrentPageText()
}

// 页码变化监听
const onPageChange = val => {
  if (val >= 1 && val <= totalPages.value) {
    currentPage.value = val
    updateCurrentPageText()
  }
}

// 保存当前书籍的阅读进度
const saveProgress = () => {
  const cacheKey = getCacheKey()
  localStorage.setItem(
    cacheKey,
    JSON.stringify({
      page: currentPage.value,
      rate: rate.value,
      timestamp: Date.now()
    })
  )
}

// ===== TTS 控制 =====
const updateVoice = () => {
  const voice = voices.value.find(v => v.name === selectedVoiceName.value)
  currentVoice = voice || null
}

// 播放指定页（支持自动连续播放）
const speakPage = page => {
  if (page < 1 || page > totalPages.value) return

  const textToSpeak = pages.value[page - 1]?.trim()
  if (!textToSpeak) {
    status.value = t('noContent', { page })
    alertType.value = 'warning'
    return
  }

  stop()

  utterance = new SpeechSynthesisUtterance(textToSpeak)
  utterance.rate = rate.value
  utterance.voice = currentVoice

  utterance.onstart = () => {
    isSpeaking.value = true
    isPaused.value = false
    currentPage.value = page
    updateCurrentPageText()
    status.value = t('speaking', { page })
    alertType.value = 'info'
  }

  utterance.onend = () => {
    isSpeaking.value = false
    isPaused.value = false
    saveProgress()

    const nextPage = page + 1
    if (nextPage <= totalPages.value && !synth.paused && !synth.pending) {
      // status.value = `第 ${page} 页朗读结束，即将播放第 ${nextPage} 页...`
      // setTimeout(() => {
      // }, 0)
      if (!isSpeaking.value && !isPaused.value) {
        speakPage(nextPage)
      }
    } else {
      status.value = t('ended', { page })
      alertType.value = 'success'
    }
  }

  utterance.onerror = event => {
    console.error('TTS 错误:', event)
    status.value = t('error', { error: event.error || '未知错误' })
    alertType.value = 'error'
    isSpeaking.value = false
    isPaused.value = false
  }

  synth.speak(utterance)
}

const speakCurrentPage = () => {
  speakPage(currentPage.value)
}

const togglePlay = () => {
  if (isPaused.value) {
    synth.resume()
    isPaused.value = false
    isSpeaking.value = true
    status.value = `继续朗读第 ${currentPage.value} 页...`
    alertType.value = 'info'
  } else {
    speakCurrentPage()
  }
}

const pause = () => {
  if (synth.speaking && !synth.paused) {
    synth.pause()
    isPaused.value = true
    status.value = t('paused')
    alertType.value = 'warning'
    saveProgress()
  }
}

const stop = () => {
  if (synth.speaking || synth.paused) {
    synth.cancel()
    isSpeaking.value = false
    isPaused.value = false
    status.value = t('stopped')
    alertType.value = 'info'
    saveProgress()
  }
}

// 切换书籍
const onBookChange = () => {
  // 停止当前朗读（避免跨书干扰）
  stop()
  // 重置状态
  currentPage.value = 1
  totalPages.value = 1
  pages.value = []
  currentPageText.value = ''
  // 加载新书
  loadBookFromPublic()
}

// ===== 初始化 =====
onMounted(() => {
  if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = loadVoices
  }
  setTimeout(loadVoices, 500)
  loadBookFromPublic()
})

// 监听 currentPage 变化（确保文本同步）
watch(currentPage, updateCurrentPageText)
</script>

<style scoped>
.tts-player {
  margin: 12px;
}

.text-input {
  width: 100%;
  margin: 16px 0;
}

.controls {
  display: flex;
  gap: 12px;
  margin: 20px 0;
  justify-content: center;
}

.settings {
  margin-top: 20px;
}

.rate-value {
  margin-left: 12px;
  font-weight: bold;
  color: #606266;
}
</style>
