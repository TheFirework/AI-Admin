<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppIcon from '@/components/icons/AppIcon.vue'

const router = useRouter()
const route = useRoute()

const activeMenu = computed(() => route.path)

const menuItems = [
  { path: '/', label: '数据概览', icon: 'layout-dashboard' },
  { path: '/dishes', label: '菜品管理', icon: 'utensils' },
  { path: '/categories', label: '分类管理', icon: 'folder-open' },
  { path: '/orders', label: '订单管理', icon: 'shopping-cart' },
  { path: '/tables', label: '桌台管理', icon: 'table' },
  {
    path: '/system/menus',
    label: '菜单管理',
    icon: 'menu',
    permission: 'system:menus'
  },
  { path: '/components/tree', label: 'Tree组件', icon: 'tree-pine' },
]
</script>

<template>
  <aside class="fixed left-0 top-0 h-screen w-56 bg-gray-900 text-white flex flex-col z-50">
    <div class="p-6 border-b border-gray-700 flex items-center gap-3">
      <AppIcon type="inline" :size="32">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </AppIcon>
      <span class="text-lg font-semibold">Shadcn AI</span>
    </div>

    <nav class="flex-1 p-4">
      <ul class="space-y-2">
        <li v-for="item in menuItems" :key="item.path">
          <router-link v-perm="item.permission || ''" :to="item.path" :class="[
            'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
            activeMenu === item.path
              ? 'bg-primary-500/20 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          ]">
            <AppIcon type="lucide" :icon="item.icon" :size="20" />
            <span>{{ item.label }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>
