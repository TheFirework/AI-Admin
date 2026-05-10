<script setup lang="ts">
import { computed, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppIcon from '@/components/icons/AppIcon.vue'
import type { MenuItem } from '@/utils/menuGenerator'
import { ChevronDown } from 'lucide-vue-next'

const props = defineProps<{
  item: MenuItem
  depth: number
}>()

const router = useRouter()
const route = useRoute()

// 注入侧边栏展开状态上下文
const sidebarCtx = inject<{
  expandedMenus: Set<string>
  toggleExpand: (item: MenuItem) => void
  isExpanded: (item: MenuItem) => boolean
  isMenuItemActive: (item: MenuItem) => boolean
}>('sidebarExpandCtx')

const expanded = computed(() => sidebarCtx?.isExpanded(props.item) ?? false)
const active = computed(() => sidebarCtx?.isMenuItemActive(props.item) ?? false)
const hasChildren = computed(() => Boolean(props.item.children?.length))

// 根据层级计算缩进和尺寸
const indentLeft = computed(() => `${16 + props.depth * 12}px`)
const paddingY = computed(() => props.depth === 0 ? '12px' : '10px')
const itemFontSize = computed(() => `${Math.max(14 - props.depth * 0.5, 11)}px`)
const iconSize = computed(() => Math.max(20 - props.depth * 2, 14))
const chevronSize = computed(() => Math.max(16 - props.depth * 2, 12))
const borderRadius = computed(() => props.depth === 0 ? '8px' : '6px')

function handleExpand() {
  sidebarCtx?.toggleExpand(props.item)
}

function handleNavigate(path: string) {
  if (path && path !== route.path) {
    router.push(path)
  }
}
</script>

<template>
  <div class="inline-menu-group">
    <!-- 有子菜单：展开/折叠触发器 -->
    <template v-if="hasChildren">
      <button :class="['inline-trigger', `depth-${depth}`, active && 'is-active']" :style="{
        paddingLeft: indentLeft,
        paddingTop: paddingY,
        paddingBottom: paddingY,
        fontSize: itemFontSize,
        borderRadius,
      }" @click.stop="handleExpand">
        <AppIcon v-if="item.icon" type="lucide" :icon="item.icon" :size="iconSize" />
        <span class="inline-title">{{ item.title }}</span>
        <ChevronDown :class="['inline-chevron', expanded && 'rotate-180']"
          :style="{ width: `${chevronSize}px`, height: `${chevronSize}px` }" style="margin-left: auto" />
      </button>

      <!-- 子菜单内容区域（递归渲染）-->
      <div v-show="expanded" class="inline-children">
        <InlineMenuItem v-for="(child, index) in item.children" :key="`child-${index}`" :item="child"
          :depth="depth + 1" />
      </div>
    </template>

    <!-- 无子菜单：叶子节点导航链接 -->
    <router-link v-else v-perm="item.permission || ''" :to="item.path"
      :class="['inline-leaf', `depth-${depth}`, active && 'is-active']" :style="{
        paddingLeft: indentLeft,
        paddingTop: paddingY,
        paddingBottom: paddingY,
        fontSize: itemFontSize,
        borderRadius,
      }" :title="item.description || item.title" @click="handleNavigate(item.path)">
      <AppIcon v-if="item.icon" type="lucide" :icon="item.icon" :size="iconSize" />
      <span>{{ item.title }}</span>
    </router-link>
  </div>
</template>

<style scoped>
/* ==================== 菜单组容器 ==================== */

.inline-menu-group {
  margin-bottom: 2px;
}

/* ==================== 触发器按钮样式 ==================== */

.inline-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding-right: 12px;
  cursor: pointer;
  transition: all 0.2s ease-out;
  text-align: left;
  background-color: transparent;
  border: none;
  color: #9ca3af;
  position: relative;
}

.inline-trigger:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: #d1d5db;
}

.inline-trigger.is-active {
  background-color: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  font-weight: 600;
}

/* 激活指示条（仅 depth=0）*/
.inline-trigger.depth-0.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 60%;
  border-radius: 0 3px 3px 0;
  background-color: #3b82f6;
}

.inline-trigger.depth-0 {
  font-weight: 500;
}

/* ==================== 标题文字 ==================== */

.inline-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ==================== Chevron 箭头图标 ==================== */

.inline-chevron {
  transition: transform 0.2s ease-out;
  flex-shrink: 0;
  color: currentColor;
  opacity: 0.6;
}



/* ==================== 子菜单容器 ==================== */

.inline-children {
  margin-top: 2px;
  border-left: 1px solid rgba(75, 85, 99, 0.2);
}

/* ==================== 叶子节点链接样式 ==================== */

.inline-leaf {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding-right: 12px;
  cursor: pointer;
  transition: all 0.2s ease-out;
  text-decoration: none;
  color: #9ca3af;
  position: relative;
}

.inline-leaf:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: #d1d5db;
  text-decoration: none;
}

.inline-leaf.is-active {
  background-color: rgba(59, 130, 246, 0.1);
  color: #93c5fd;
  font-weight: 500;
}

/* 激活指示点 */
.inline-leaf.is-active::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: #3b82f6;
}

.inline-leaf.depth-0 {
  font-weight: 500;
}
</style>
