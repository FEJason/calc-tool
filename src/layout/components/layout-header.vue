<template>
  <header class="header-wrap">
    <div class="header-left">
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
    </div>
    <div class="header-right">
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
  </header>
</template>

<script setup>
import { isDark, toggleDark } from '@/composables'
import { Moon, Sunny, ArrowDown } from '@element-plus/icons-vue'
import { switchLocale, getCurrentLocale } from '@/locales'

const { t } = useI18n()

const currentLocale = computed(() => getCurrentLocale())

const currentLangLabel = computed(() => {
  return currentLocale.value === 'zh-CN' ? '中文' : 'English'
})

const handleLanguageChange = locale => {
  switchLocale(locale)
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
  justify-content: flex-end;
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
@media screen and (max-width: 828px) {
  .header-wrap {
    padding: 0 20px;
  }
  .lang-switch {
    margin-right: 10px;
  }
}
</style>
