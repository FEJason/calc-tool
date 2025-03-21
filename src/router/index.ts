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
    name: 'home',
    path: '/home',
    component: () => import('@/views/home/index.vue'),
    meta: { title: 'Home' }
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
