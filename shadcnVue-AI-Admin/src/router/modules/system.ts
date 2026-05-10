import type { RouteRecordRaw } from 'vue-router'

// ==================== 系统管理模块路由 ====================
const systemRoutes: RouteRecordRaw[] = [
  {
    path: '/system/menus',
    name: 'MenuManagement',
    component: () => import('@/views/system/menus/index.vue'),
    meta: {
      title: '菜单管理',
      icon: 'Menu',
      permission: 'system:menus',
      requiresAuth: true
    }
  }
]

export default systemRoutes
