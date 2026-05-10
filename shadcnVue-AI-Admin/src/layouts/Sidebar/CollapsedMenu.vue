<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppIcon from '@/components/icons/AppIcon.vue'
import type { MenuItem } from '@/utils/menuGenerator'
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarSeparator,
} from '@/components/ui/menubar'
import RecursiveMenuItem from './RecursiveMenuItem.vue'

const props = defineProps<{
  items: MenuItem[]
  isCollapsed: boolean
}>()

const router = useRouter()
const route = useRoute()

// 当前激活的菜单路径
const activeMenu = computed(() => route.path)

// 判断菜单项是否处于激活状态（包括其子项）
function isActive(item: MenuItem): boolean {
  if (activeMenu.value === item.path) return true
  if (item.path !== '/' && activeMenu.value.startsWith(item.path + '/')) return true

  // 检查子项是否激活
  if (item.children?.some(child =>
    activeMenu.value === child.path ||
    (child.path !== '/' && activeMenu.value.startsWith(child.path + '/'))
  )) {
    return true
  }

  return false
}

// 处理导航事件（由子组件触发）
function navigateTo(path: string) {
  if (path && path !== route.path) {
    router.push(path)
  }
}
</script>

<template>
  <div v-if="isCollapsed" class="collapsed-menu-list">
    <!-- 使用 Menubar 作为根容器（完整组件体系）-->
    <Menubar class="menubar-container" :orientation="'vertical'">
      <template v-for="(item, index) in items" :key="`menu-${index}`">
        <!-- 有子菜单的项：使用 MenubarMenu（官方标准结构）-->
        <MenubarMenu v-if="item.children?.length">
          <!-- 触发器 - 图标按钮 -->
          <MenubarTrigger as-child>
            <div :class="[
              'menu-trigger',
              isActive(item) ? 'is-active' : ''
            ]">
              <AppIcon v-if="item.icon" type="lucide" :icon="item.icon" :size="20" />
            </div>
          </MenubarTrigger>

          <!-- 内容面板（DropdownMenu 风格）- 包含所有子菜单项 -->
          <MenubarContent side="right" :side-offset="12" align="start" class="menubar-content dropdown-menu-style">

            <!-- ✨ 使用递归组件渲染子菜单（支持无限嵌套）-->
            <template v-for="(child, childIndex) in item.children" :key="`child-${index}-${childIndex}`">

              <!-- 递归组件：自动处理所有层级的嵌套 -->
              <RecursiveMenuItem :item="child" :level="1" @navigate="navigateTo" />
            </template>
          </MenubarContent>
        </MenubarMenu>

        <!-- 无子菜单的叶子节点：直接导航链接 -->
        <router-link v-else :to="item.path" :class="[
          'menu-link',
          isActive(item) ? 'is-active' : ''
        ]">
          <AppIcon v-if="item.icon" type="lucide" :icon="item.icon" :size="20" />
        </router-link>
      </template>
    </Menubar>
  </div>
</template>

<style scoped>
/* ==================== 折叠菜单列表容器 ==================== */

.collapsed-menu-list {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

/* ==================== Menubar 容器 - 垂直布局 ==================== */

.menubar-container {
  background-color: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
  gap: 0.25rem;
  height: auto;
  flex-direction: column;
  /* 垂直方向 */
  border-radius: 0;
}

/* 覆盖 Menubar 默认样式 */
.menubar-container :deep([data-slot='menubar-trigger']) {
  padding: 0;
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ==================== 触发按钮样式（折叠状态图标）==================== */

.menu-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 48px;
  border-radius: 0.5rem;
  cursor: pointer;
  color: #9ca3af;
  transition: all 0.15s ease-out;
  background-color: transparent;
}

.menu-trigger:hover,
.menu-trigger[data-state='open'] {
  background-color: rgba(0, 0, 0, 0.04);
  color: #374151;
}

.menu-trigger.is-active {
  background-color: rgba(59, 130, 246, 0.08);
  color: #2563eb;
}

/* ==================== 主内容面板样式（DropdownMenu 风格）==================== */

.menubar-content.dropdown-menu-style {
  width: 200px !important;
  padding: 6px !important;
  margin: 4px !important;

  /* DropdownMenu 核心样式 */
  background-color: hsl(var(--popover)) !important;
  color: hsl(var(--popover-foreground)) !important;
  border-radius: var(--radius-md, 6px) !important;
  border: 1px solid hsl(var(--border)) !important;

  /* DropdownMenu 阴影 */
  box-shadow:
    0 10px 15px -3px rgb(0 0 0 / 0.1),
    0 4px 6px -4px rgb(0 0 0 / 0.1),
    0 0 0 1px rgb(0 0 0 / 0.05) !important;
}

/* ==================== 叶子节点链接样式（无子菜单的一级项）==================== */

.menu-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 48px;
  padding: 0 8px;
  border-radius: 0.5rem;
  cursor: pointer;
  color: #9ca3af;
  transition: all 0.15s ease-out;
  text-decoration: none;
  background-color: transparent;
}

.menu-link:hover {
  background-color: rgba(0, 0, 0, 0.04);
  color: #374151;
}

.menu-link.is-active {
  background-color: rgba(59, 130, 246, 0.08);
  color: #2563eb;
  font-weight: 500;
}
</style>
