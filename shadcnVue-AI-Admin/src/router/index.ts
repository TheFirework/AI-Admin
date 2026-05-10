import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import storage from '@/utils/storage'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue')
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/Layout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue')
      },
      {
        path: '/account',
        name: 'Account',
        component: () => import('@/views/user/settings/Account.vue')
      },
      {
        path: '/system/menus',
        name: 'MenuManagement',
        component: () => import('@/views/system/menus/index.vue'),
        meta: { permission: 'system:menus' }
      },
      {
        path: '/components/tree',
        name: 'TreeDemo',
        component: () => import('@/views/components/TreeDemo.vue')
      },
      {
        path: '/components/tree-drag',
        name: 'TreeDragTest',
        component: () => import('@/views/components/TreeDragTest.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isLoggedIn = storage.isLoggedIn()

  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && isLoggedIn) {
    next('/')
  } else {
    next()
  }
})

export default router

export { routes }
