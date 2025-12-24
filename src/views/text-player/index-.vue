<template>
  <el-card class="tts-player" shadow="hover">
    <!-- 文本区域（只读） -->
    <el-input
      v-model="text"
      type="textarea"
      :autosize="{ minRows: 2, maxRows: 4 }"
      placeholder="加载中..."
      readonly
      class="text-input"
    />

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
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 响应式状态
const text = ref('')
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

// 加载系统语音
const loadVoices = () => {
  const availableVoices = synth.getVoices()
  voices.value = availableVoices.filter(v => v.lang === 'zh-CN')
}

// 从 public/books/novel.txt 加载文本
const loadBookFromPublic = async () => {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}books/novel.txt`)
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)

    const content = await response.text()
    text.value = content
    status.value = `成功加载预置书籍，共 ${content.length} 字`
    alertType.value = 'success'
  } catch (err) {
    console.error('加载书籍失败:', err)
    text.value = ''
    status.value = `❌ 书籍加载失败：${err.message}`
    alertType.value = 'error'
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(() => {
  if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = loadVoices
  }
  // 确保语音列表加载完成
  setTimeout(loadVoices, 500)
  loadBookFromPublic()
})

// 更新发音人
const updateVoice = () => {
  const voice = voices.value.find(v => v.name === selectedVoiceName.value)
  currentVoice = voice || null
}

// 从头开始朗读
const speakFromStart = () => {
  if (!text.value.trim()) {
    status.value = '书籍内容为空'
    alertType.value = 'warning'
    return
  }

  stop() // 先停止任何正在进行的朗读

  utterance = new SpeechSynthesisUtterance(text.value)
  utterance.rate = rate.value
  utterance.voice = currentVoice

  utterance.onstart = () => {
    isSpeaking.value = true
    isPaused.value = false
    status.value = '正在朗读...'
    alertType.value = 'info'
  }

  utterance.onend = () => {
    isSpeaking.value = false
    isPaused.value = false
    status.value = '朗读结束'
    alertType.value = 'success'
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

// 切换播放/继续
const togglePlay = () => {
  if (isPaused.value) {
    // 恢复暂停
    synth.resume()
    isPaused.value = false
    isSpeaking.value = true
    status.value = '继续朗读...'
    alertType.value = 'info'
  } else {
    // 从头开始
    speakFromStart()
  }
}

// 暂停
const pause = () => {
  if (synth.speaking && !synth.paused) {
    synth.pause()
    isPaused.value = true
    status.value = '已暂停'
    alertType.value = 'warning'
  }
}

// 停止
const stop = () => {
  if (synth.speaking || synth.paused) {
    synth.cancel()
    isSpeaking.value = false
    isPaused.value = false
    status.value = '已停止'
    alertType.value = 'info'
  }
}
</script>

<style scoped>
.tts-player {
  max-width: 700px;
  margin: 2rem auto;
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
