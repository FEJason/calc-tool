<template>
  <div class="layout-wrap">
    <LayoutHeader />
    <main class="main-wrap">
      <RouterView />
    </main>
  </div>
</template>
<script setup lang="ts">
import LayoutHeader from './components/layout-header.vue'
</script>
<style lang="scss" scoped>
.layout-wrap {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.main-wrap {
  flex: 1;
}
</style>
