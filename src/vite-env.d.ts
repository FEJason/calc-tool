/// <reference types="vite/client" />

// 解决路由懒加载报错：找不到模块“@/views/home/index.vue”或其相应的类型声明。
// 这段代码告诉 TypeScript，所以以 .vue 结尾的文件都是 Vue 组件，可以通过 import 语句进行导入。
declare module '*.vue' {
  import { Component } from 'vue'
  const component: Component
  export default component
}