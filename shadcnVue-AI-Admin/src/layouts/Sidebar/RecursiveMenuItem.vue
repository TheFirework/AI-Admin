<script setup lang="ts">
import { ref, computed } from 'vue'
import AppIcon from '@/components/icons/AppIcon.vue'
import type { MenuItem } from '@/utils/menuGenerator'
import {
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  MenubarItem,
  MenubarSeparator,
} from '@/components/ui/menubar'

// 组件 Props 定义
const props = defineProps<{
  item: MenuItem
  level?: number // 当前嵌套层级（从1开始）
}>()

// 组件 Events 定义
const emit = defineEmits<{
  (e: 'navigate', path: string): void
}>()

// 计算当前层级（默认为1）
const currentLevel = computed(() => props.level ?? 1)

// 判断是否有子菜单
const hasChildren = computed(() => {
  return props.item.children && props.item.children.length > 0
})

const iconSize = 16

const contentWidth = ref(180)

// 处理导航事件
function handleNavigate(path: string) {
  emit('navigate', path)
}
</script>

<template>
  <!-- 有子菜单：使用 MenubarSub 嵌套（支持无限递归）-->
  <MenubarSub v-if="hasChildren">
    <!-- 子菜单触发器（自带箭头图标）-->
    <MenubarSubTrigger class="submenu-trigger-item" :style="{ width: `${contentWidth}px !important` }">
      <AppIcon v-if="item.icon" type="lucide" :icon="item.icon" :size="iconSize" />
      <span class="item-title">{{ item.title }}</span>
    </MenubarSubTrigger>

    <!-- 子菜单内容面板（递归渲染子项）-->
    <MenubarSubContent side="right" :side-offset="Math.max(8 - (currentLevel - 1), 4)" align="start"
      :class="['submenu-content', 'dropdown-menu-style', { 'deep-level': currentLevel > 2 }]"
      :style="{ width: `${contentWidth}px !important` }">
      <!-- 递归渲染子菜单项（核心：无限嵌套的关键）-->
      <template v-for="(child, index) in item.children" :key="`sub-${index}`">
        <!-- 递归调用自身（实现无限层级支持 ✅）-->
        <RecursiveMenuItem :item="child" :level="currentLevel + 1" @navigate="handleNavigate" />

        <!-- 分隔线（每3项之间添加，避免视觉拥挤）-->
        <MenubarSeparator v-if="index < (item.children?.length || 0) - 1 && index % 3 === 2"
          class="my-1 border-gray-700" />
      </template>
    </MenubarSubContent>
  </MenubarSub>

  <!-- 无子菜单：叶子节点 -->
  <MenubarItem v-else class="menu-item-leaf" @click="handleNavigate(item.path)">
    <AppIcon v-if="item.icon" type="lucide" :icon="item.icon" :size="iconSize" />
    <span>{{ item.title }}</span>
  </MenubarItem>
</template>

<style scoped>
/* ==================== 子菜单触发器样式 ==================== */

.submenu-trigger-item {
  gap: 10px;
  width: 100%;
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--foreground));
}

.submenu-trigger-item .item-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ==================== 叶子节点样式 ==================== */

.menu-item-leaf :deep(> span:last-of-type) {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}

/* ==================== 子菜单内容面板样式 ==================== */

.submenu-content.dropdown-menu-style {
  padding: 4px !important;
  margin: 3px !important;

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

/* 深层子菜单特殊样式（减小内边距和间距）*/
.submenu-content.dropdown-menu-style.deep-level {
  padding: 3px !important;
  margin: 2px !important;
}
</style>
