<script setup lang="ts">
import { ref, inject, type Ref } from 'vue'
import AppIcon from '@/components/icons/AppIcon.vue'
import CollapsedMenu from './CollapsedMenu.vue'
import InlineMenuItem from './InlineMenuItem.vue'
import { useSidebarMenu } from './useSidebarMenu'

const isCollapsed = inject<Ref<boolean>>('sidebarCollapsed', ref(false))
const { menuItems } = useSidebarMenu()
</script>

<template>
  <aside :class="[
    'fixed left-0 top-0 h-screen bg-gray-900 text-white flex flex-col z-50 transition-all duration-300 ease-in-out',
    isCollapsed ? 'w-16' : ''
  ]" :style="{ width: isCollapsed ? '64px' : '258px' }">
    <div class="p-6 border-b border-gray-700 flex items-center gap-3 overflow-hidden">
      <AppIcon type="inline" :size="32" class="flex-shrink-0">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </AppIcon>
      <transition enter-active-class="transition-opacity duration-200"
        leave-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100"
        leave-from-class="opacity-100" leave-to-class="opacity-0">
        <span v-show="!isCollapsed" class="text-lg font-semibold whitespace-nowrap">Shadcn AI</span>
      </transition>
    </div>

    <nav :class="['flex-1', isCollapsed ? 'overflow-visible px-2' : 'overflow-y-auto p-4']">
      <CollapsedMenu v-if="isCollapsed" :items="menuItems" :is-collapsed="isCollapsed" />

      <div v-else class="expanded-nav">
        <InlineMenuItem v-for="(item, index) in menuItems" :key="`menu-${index}`" :item="item" :depth="0" />
      </div>

      <div v-if="menuItems.length === 0" class="text-center py-8 text-gray-500">
        <p class="text-sm">暂无可用的菜单</p>
        <p class="text-xs mt-1">请在路由配置中添加 meta.title</p>
      </div>
    </nav>
  </aside>
</template>

<style scoped>
.expanded-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
}
</style>
