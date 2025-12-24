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
      <span>共 {{ totalPages }} 页</span>
      <el-input-number
        v-model="currentPage"
        :min="1"
        :max="totalPages"
        size="small"
        @change="onPageChange"
        :disabled="isSpeaking || loading"
      />
      <el-button size="small" @click="jumpToPage(currentPage)" :disabled="loading">跳转</el-button>
    </div>

    <!-- 控制按钮 -->
    <div class="controls">
      <el-button
        @click="togglePlay"
        :disabled="loading || (isSpeaking && !isPaused)"
        type="success"
        round
      >
        {{ isPaused ? '▶ 继续' : loading ? '加载中...' : '▶ 播放' }}
      </el-button>
      <el-button @click="pause" :disabled="!isSpeaking || isPaused" type="warning" round>
        ⏸ 暂停
      </el-button>
      <el-button @click="stop" :disabled="!isSpeaking && !isPaused" type="danger" round>
        ⏹ 停止
      </el-button>
    </div>

    <!-- 设置 -->
    <el-form label-position="left" label-width="80px" class="settings">
      <el-form-item label="语速：">
        <el-slider
          v-model="rate"
          :min="0.5"
          :max="2"
          :step="0.1"
          show-input
          input-size="small"
          style="width: 200px"
        />
        <span class="rate-value">{{ rate.toFixed(1) }}x</span>
      </el-form-item>

      <el-form-item label="发音人：">
        <el-select
          v-model="selectedVoiceName"
          placeholder="请选择发音人"
          @change="updateVoice"
          style="width: 240px"
        >
          <el-option value="" label="默认" />
          <el-option
            v-for="voice in voices"
            :key="voice.name + voice.lang"
            :label="`${voice.name} (${voice.lang})`"
            :value="voice.name"
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

// ===== 响应式状态 =====
const fullText = ref('') // 完整文本
const pages = ref([]) // 分页数组
const currentPage = ref(1)
const currentPageText = ref('')
const totalPages = ref(1)

const rate = ref(1.0)
const voices = ref([])
const selectedVoiceName = ref('')
let currentVoice = null

const isSpeaking = ref(false)
const isPaused = ref(false)
const status = ref('正在加载书籍...')
const alertType = ref('info')
const loading = ref(true)

const synth = window.speechSynthesis
let utterance = null

// 缓存键（可按书名扩展）
const CACHE_KEY = 'tts-book-page'

// ===== 工具函数：分页 =====
const paginateText = (text, charsPerPage = 238) => {
  const pages = []
  for (let i = 0; i < text.length; i += charsPerPage) {
    pages.push(text.slice(i, i + charsPerPage))
  }
  return pages
}

// ===== 加载语音 =====
const loadVoices = () => {
  const availableVoices = synth.getVoices()
  voices.value = availableVoices.filter(v => v.lang === 'zh-CN')
}

// ===== 加载书籍 =====
const loadBookFromPublic = async () => {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}books/novel.txt`)
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)

    const content = await response.text()
    fullText.value = content.trim()

    // 分页
    pages.value = paginateText(fullText.value, 238)
    totalPages.value = pages.value.length

    // 尝试从 localStorage 恢复上次页码
    const saved = localStorage.getItem(CACHE_KEY)
    if (saved) {
      const { page } = JSON.parse(saved)
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        status.value = `已恢复至第 ${page} 页`
        alertType.value = 'info'
      }
    }

    updateCurrentPageText()
    status.value = `成功加载书籍，共 ${fullText.value.length} 字，${totalPages.value} 页`
    alertType.value = 'success'
  } catch (err) {
    console.error('加载书籍失败:', err)
    fullText.value = ''
    status.value = `❌ 书籍加载失败：${err.message}`
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
  // 不自动播放，仅跳转
}

// 页码变化监听（输入框改变时）
const onPageChange = val => {
  if (val >= 1 && val <= totalPages.value) {
    currentPage.value = val
    updateCurrentPageText()
  }
}

// 保存当前页到缓存
const saveProgress = () => {
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      page: currentPage.value,
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
    status.value = `第 ${page} 页无内容`
    alertType.value = 'warning'
    return
  }

  stop() // 确保清除之前的朗读

  utterance = new SpeechSynthesisUtterance(textToSpeak)
  utterance.rate = rate.value
  utterance.voice = currentVoice

  utterance.onstart = () => {
    isSpeaking.value = true
    isPaused.value = false
    currentPage.value = page // 同步当前页
    updateCurrentPageText() // 确保文本同步
    status.value = `正在朗读第 ${page} 页...`
    alertType.value = 'info'
  }

  utterance.onend = () => {
    isSpeaking.value = false
    isPaused.value = false
    saveProgress()

    // 自动播放下一页（如果存在且未被用户中断）
    const nextPage = page + 1
    if (nextPage <= totalPages.value && !synth.paused && !synth.pending) {
      status.value = `第 ${page} 页朗读结束，即将播放第 ${nextPage} 页...`
      // 延迟一点避免浏览器限制（某些浏览器要求用户交互后才能 speak）
      setTimeout(() => {
        if (!isSpeaking.value && !isPaused.value) {
          speakPage(nextPage)
        }
      }, 0)
    } else {
      status.value = `第 ${page} 页朗读结束`
      alertType.value = 'success'
    }
  }

  utterance.onerror = event => {
    console.error('TTS 错误:', event)
    status.value = '朗读出错：' + (event.error || '未知错误')
    alertType.value = 'error'
    isSpeaking.value = false
    isPaused.value = false
  }

  synth.speak(utterance)
}

// 播放当前页（对外接口）
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
    status.value = '已暂停'
    alertType.value = 'warning'
    saveProgress()
  }
}

const stop = () => {
  if (synth.speaking || synth.paused) {
    synth.cancel()
    isSpeaking.value = false
    isPaused.value = false
    status.value = '已停止'
    alertType.value = 'info'
    saveProgress()
  }
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
