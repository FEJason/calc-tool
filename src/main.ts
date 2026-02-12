import { createApp } from 'vue'
import pinia from '@/store'
import App from './App.vue'
import router from './router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { i18n, initLocale } from '@/locales'

// 自动按需加载，使用 ElMessage, 需要手动导入对应css，否则没有样式
import 'element-plus/theme-chalk/src/message.scss'
import 'element-plus/theme-chalk/src/message-box.scss'
import 'element-plus/theme-chalk/src/notification.scss'

import 'element-plus/theme-chalk/dark/css-vars.css'

import '@/assets/css/base.scss'
import '@/assets/css/u-view.scss'
import '@/assets/css/media.scss'

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 初始化语言设置
initLocale()

app.use(router)
app.use(pinia)
app.use(i18n)
app.mount('#app')