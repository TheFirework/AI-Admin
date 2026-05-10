import type { RouteRecordRaw } from 'vue-router'

// ==================== 仪表盘模块路由 ====================
const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: '',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/Dashboard.vue'),
    meta: {
      title: '仪表盘',
      icon: 'Dashboard',
      requiresAuth: true
    }
  }
]

export default dashboardRoutes
