import type { RouteRecordRaw } from 'vue-router'

// ==================== 认证模块路由 ====================
const authRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: {
      title: '登录',
      requiresAuth: false
    }
  }
]

export default authRoutes
