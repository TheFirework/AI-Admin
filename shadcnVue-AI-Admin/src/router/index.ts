import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import storage from '@/utils/storage'

// ==================== 导入所有路由模块 ====================
import authRoutes from './modules/auth'
import dashboardRoutes from './modules/dashboard'
import systemRoutes from './modules/system'
import userRoutes from './modules/user'
import componentsRoutes from './modules/components'

// ==================== 路由配置 ====================
const routes: RouteRecordRaw[] = [
  // 公开路由（无需认证）
  ...authRoutes,

  // 主布局路由（需要认证）
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/Layout.vue'),
    meta: { requiresAuth: true },
    children: [
      // 仪表盘
      ...dashboardRoutes,

      // 用户设置
      ...userRoutes,

      // 系统管理
      ...systemRoutes,

      // 组件演示
      ...componentsRoutes
    ]
  },

  // 404 重定向
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

// ==================== 路由实例 ====================
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// ==================== 全局前置守卫 ====================
router.beforeEach((to, from, next) => {
  const isLoggedIn = storage.isLoggedIn()

  if (to.meta.requiresAuth && !isLoggedIn) {
    // 需要认证但未登录，跳转到登录页
    next('/login')
  } else if (to.path === '/login' && isLoggedIn) {
    // 已登录用户访问登录页，重定向到首页
    next('/')
  } else {
    next()
  }
})

export default router

export { routes }
