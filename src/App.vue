<template>
  <el-config-provider :locale="locale" :message="message">
    <van-config-provider :theme="isDark ? 'dark' : ''">
      <RouterView></RouterView>
    </van-config-provider>
  </el-config-provider>
</template>

<script setup lang="ts">
import { isDark } from '@/composables'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'

const message = reactive({
  max: 1,
  showClose: true
})

const language = ref('zh-cn')
const locale = computed(() => (language.value === 'zh-cn' ? zhCn : en))
</script>

<style scoped></style>
