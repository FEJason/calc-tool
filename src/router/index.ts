import { createWebHashHistory, createRouter } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home'
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    children: [
      {
        name: 'home',
        path: 'home',
        component: () => import('@/views/home/index.vue'),
        meta: { title: 'Home' }
      }
    ]
  },
  // 文字转音频
  {
    path: '/text-player',
    name: 'text-player',
    component: () => import('@/views/text-player/index.vue'),
    meta: { title: 'TextPlayer' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
