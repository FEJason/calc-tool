# calc-tool

Vue 3 + TypeScript + Vite 财务计算工具（港股/A股税费计算、永久投资组合、文字转语音播放器）。

## 快速命令

```sh
yarn dev          # 开发服务器 localhost:2505
yarn build        # 类型检查(vue-tsc -b) + 构建 -> dist/
yarn preview      # 预览构建产物
```

构建失败通常是 TypeScript 类型错误（`noUnusedLocals`/`noUnusedParameters` 严格模式）。

## 项目结构

| 目录 | 说明 |
|---|---|
| `src/views/home/components/` | 核心计算器组件（涨跌幅、费用G/A、国债） |
| `src/composables/` | `useDark` 封装（`isDark`, `toggleDark`） |
| `src/locales/` | 中英文 JSON（vue-i18n），默认 `en-US`，选择持久化到 `localStorage` |
| `src/store/` | Pinia store |
| `src/utils/text-player.js` | 文本分页工具函数 |
| `src/assets/css/` | 全局 SCSS 样式 |
| `src/layout/` | 响应式布局（桌面 Element Plus / 移动端 Vant） |

## 架构要点

- **Hash 路由**（`createWebHashHistory`），`base: '/calc-tool/'`
- **同组件双 UI**：桌面用 Element Plus，移动端用 Vant，响应式断点 `828px`（`.hidden-xs` / `.hidden-lg`）
- **自动导入**：`vue`, `vue-router`, `pinia`, `vue-i18n`, `src/store/`, `src/composables/`, `src/utils/` — 无需手动 import 这些模块
- **Element Plus 图标**：全局注册（`main.ts` 中遍历注册所有图标）
- **暗色模式**：`@vueuse/core` 的 `useDark()`，使用 `element-plus/theme-chalk/dark/css-vars.css`
- **汇率**：`calc-fee-g.vue` 通过 exchangerate-api.com 获取 HKD/CNY 汇率，缓存到 `localStorage`
- **Dev proxy**：`/api` -> `http://192.168.0.210:8080`
- **Element Plus 样式**：手动 import `message.scss`/`message-box.scss`/`notification.scss`（按需加载需手动引入）
- **Stale file**: `src/views/text-player/index-.vue` 可能可清理

## 代码规范

- Prettier（无分号、单引号、tabWidth 2、trailingComma none、printWidth 100）
- 文件名：kebab-case（组件大驼峰但文件名 kebab-case）
- `@/` alias 指向 `src/`
- 手动 import Element Plus 组件样式（非全局引入）
- SCSS 使用 `scoped` 样式和 `:deep()` 穿透

## 注意

- **无测试框架**，没有 lint 脚本
- TypeScript strict 模式，`noUnusedLocals`/`noUnusedParameters` 导致构建失败
- `auto-imports.d.ts` 和 `components.d.ts` 是自动生成文件，不应手动编辑
