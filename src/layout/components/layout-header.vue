<template>
  <header class="header-wrap">
    <div class="header-left">
      <!-- 移动端菜单按钮 -->
      <div class="mobile-menu" @click="showSidebar = true">
        <van-icon name="bars" size="24" />
      </div>
    </div>
    <div class="header-right">
      <div class="lang-switch">
        <el-dropdown @command="handleLanguageChange">
          <el-button link>
            {{ currentLangLabel }}
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="en-US">English</el-dropdown-item>
              <el-dropdown-item command="zh-CN">中文</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div class="is-dark">
        <el-switch
          v-model="isDark"
          :active-action-icon="Moon"
          :inactive-action-icon="Sunny"
          style="--el-switch-on-color: #2c2c2c; --el-switch-off-color: #dcdfe6"
          @change="toggleDark"
        />
      </div>
    </div>

    <!-- 移动端侧边栏菜单 (Popup 弹出层) -->
    <van-popup
      v-model:show="showSidebar"
      position="left"
      round
      :style="{ width: '80%', maxWidth: '300px', height: '100%' }"
    >
      <div class="sidebar-menu">
        <div class="sidebar-header">
          <span class="sidebar-title">Menu</span>
          <van-icon name="cross" size="20" @click="showSidebar = false" />
        </div>
        <van-cell-group inset>
          <van-cell
            v-for="(item, index) in menuItems"
            :key="index"
            :title="item.title"
            is-link
            clickable
            @click="navigateTo(item.path)"
          />
        </van-cell-group>
      </div>
    </van-popup>
  </header>
</template>

<script setup>
import { isDark, toggleDark } from '@/composables'
import { Moon, Sunny, ArrowDown } from '@element-plus/icons-vue'
import { switchLocale, getCurrentLocale } from '@/locales'

const router = useRouter()
const { t } = useI18n()

const currentLocale = computed(() => getCurrentLocale())

const currentLangLabel = computed(() => {
  return currentLocale.value === 'zh-CN' ? '中文' : 'English'
})

const handleLanguageChange = locale => {
  switchLocale(locale)
}

// 移动端菜单控制
const showSidebar = ref(false)
const activeIndex = ref(0)

// 菜单项配置
const menuItems = computed(() => [
  { title: 'Calc', path: '/home' },
  { title: 'Permanent Portfolio', path: '/permanent-portfolio' },
  { title: 'Text Player', path: '/text-player' }
])

// 导航跳转
const navigateTo = path => {
  router.push(path)
  showSidebar.value = false
}
</script>

<style lang="scss" scoped>
:deep(.el-switch.is-checked .el-switch__action) {
  color: #cfd3dc;
  background-color: #141414;
  border: 1px solid #4b4c4e;
}
.header-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 32px;
  // border-bottom: 1px solid var(--el-border-color);
}
.header-left {
  display: flex;
  align-items: center;
}
.header-right {
  display: flex;
  align-items: center;
}
.lang-switch {
  margin-right: 20px;
}
.mobile-menu {
  display: none;
  margin-right: 16px;
  cursor: pointer;
  padding: 4px;
  &:hover {
    opacity: 0.7;
  }
}

// 侧边栏菜单样式
.sidebar-menu {
  height: 100%;
  display: flex;
  flex-direction: column;

  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--van-border-color);

    .sidebar-title {
      font-size: 18px;
      font-weight: bold;
      color: var(--van-text-color);
    }

    .van-icon-cross {
      cursor: pointer;
      padding: 4px;
      &:hover {
        opacity: 0.7;
      }
    }
  }

  :deep(.van-cell-group--inset) {
    margin: 16px;
  }

  :deep(.van-cell) {
    padding: 16px;
    font-size: 16px;
    border-radius: 8px;
    margin-bottom: 8px;

    &:active {
      background-color: var(--van-active-color);
    }
  }
}

@media screen and (max-width: 828px) {
  .header-wrap {
    padding: 0 20px;
  }
  .lang-switch {
    margin-right: 10px;
  }
  .mobile-menu {
    display: block;
  }
}
</style>
