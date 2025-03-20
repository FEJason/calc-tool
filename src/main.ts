import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 自动按需加载，使用 ElMessage, 需要手动导入对应css，否则没有样式
import 'element-plus/theme-chalk/src/message.scss'
import 'element-plus/theme-chalk/src/message-box.scss'
import 'element-plus/theme-chalk/src/notification.scss'

import '@/assets/css/base.scss'
import '@/assets/css/u-view.scss'

const app = createApp(App)

app.use(router)
app.mount('#app')