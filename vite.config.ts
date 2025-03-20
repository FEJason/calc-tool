import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig(() => {
  return {
    server: {
      host: true,
      port: 2505,
      proxy: {
        '/api': {
          target: 'http://192.168.0.210:8080',
          changeOrigin: true,
          rewrite: path => path.replace(new RegExp(`^/api`), '')
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      }
    },
    plugins: [
      vue(),
      AutoImport({
        imports: ['vue', 'vue-router'],
        resolvers: [ElementPlusResolver()]
      }),
      Components({
        resolvers: [
          ElementPlusResolver({ importStyle: 'sass' })
        ],
      }),
    ],
  }
})
