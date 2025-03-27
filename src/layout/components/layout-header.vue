<template>
  <header class="header-wrap">
    <div class="is-dark">
      <el-switch
        v-model="isDark"
        :active-action-icon="Moon"
        :inactive-action-icon="Sunny"
        style="--el-switch-on-color: #2c2c2c; --el-switch-off-color: #dcdfe6"
        @change="toggleDark"
      />
    </div>
  </header>
</template>

<script setup>
import { isDark, toggleDark } from '@/composables'
import { Moon, Sunny } from '@element-plus/icons-vue'
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
</style>
