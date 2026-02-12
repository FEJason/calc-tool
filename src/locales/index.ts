import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN.json'
import enUS from './en-US.json'

// 定义支持的语言类型
export type LocaleType = 'zh-CN' | 'en-US'

// 默认语言改为英文
const defaultLocale: LocaleType = 'en-US'

// 创建 i18n 实例
export const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: defaultLocale,
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  }
})

// 获取当前语言
export const getCurrentLocale = (): LocaleType => {
  return i18n.global.locale.value as LocaleType
}

// 切换语言
export const switchLocale = (locale: LocaleType) => {
  i18n.global.locale.value = locale
  // 保存到 localStorage
  localStorage.setItem('locale', locale)
}

// 初始化语言设置
export const initLocale = () => {
  const savedLocale = localStorage.getItem('locale') as LocaleType | null
  if (savedLocale && ['zh-CN', 'en-US'].includes(savedLocale)) {
    i18n.global.locale.value = savedLocale
  }
}

export default i18n
