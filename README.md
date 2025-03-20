# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

- Node.js 20+

## 构建

```sh
yarn

yarn dev

yarn build

```

## GitHub Pages

1. 在 vite.config.js 中设置正确的 base

如果你正要部署到 https://<USERNAME>.github.io/，或者通过 GitHub Pages 部署到一个自定义域名（例如 www.example.com），请将 base 设置为 '/'。或者，你也可以从配置中移除 base，因为它默认为 '/'。

如果你正在部署到 https://<USERNAME>.github.io/<REPO>/（例如你的仓库地址为 https://github.com/<USERNAME>/<REPO>），那么请将 base 设置为 '/<REPO>/'。

2. 在项目根目录创建一个 .github/workflows/deploy.yml 文件，并包含以下内容。它将使得每次你更改内容时都重新构建与部署站点：

```yml
# 将静态内容部署到 GitHub Pages 的简易工作流程
name: Deploy static content to Pages

on:
  # 仅在推送到默认分支时运行。
  push:
    branches: ['main']

  # 这个选项可以使你手动在 Action tab 页面触发工作流
  workflow_dispatch:

# 设置 GITHUB_TOKEN 的权限，以允许部署到 GitHub Pages。
permissions:
  contents: read
  pages: write
  id-token: write

# 允许一个并发的部署
concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  # 单次部署的工作描述
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - name: Install dependencies
        run: yarn install
      - name: Build
        run: yarn build
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          # 上传 dist 文件夹
          path: './dist'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

3. 进入仓库 settings 页面的 GitHub Pages 配置，选择部署来源为“GitHub Actions”，这将引导你创建一个构建和部署项目的工作流程
