import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver, VantResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig(() => {
  return {
    base: '/calc-tool/',
    build: {
      assetsDir: 'assets',
      outDir: 'dist'
    },
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
        '@': path.resolve(__dirname, 'src')
      }
    },
    plugins: [
      vue(),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        dirs: ['src/store/', 'src/composables/', 'src/utils/'],
        resolvers: [ElementPlusResolver(), VantResolver()]
      }),
      Components({
        resolvers: [ElementPlusResolver({ importStyle: 'sass' }), VantResolver()]
      })
    ]
  }
})
