import type { RouteRecordRaw } from 'vue-router'

// ==================== 用户设置模块路由 ====================
const userRoutes: RouteRecordRaw[] = [
  {
    path: '/account',
    name: 'Account',
    component: () => import('@/views/user/settings/Account.vue'),
    meta: {
      title: '账户设置',
      icon: 'User',
      requiresAuth: true
    }
  }
]

export default userRoutes
