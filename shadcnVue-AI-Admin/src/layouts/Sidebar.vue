<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppIcon from '@/components/icons/AppIcon.vue'
import { routes } from '@/router'
import { generateMenuFromRoutes, type MenuItem } from '@/utils/menuGenerator'

const router = useRouter()
const route = useRoute()

// ==================== 从路由配置动态生成菜单 ====================

// 获取 Layout 的子路由
const layoutRoute = computed(() => routes.find(r => r.name === 'Layout'))

// 生成菜单项（自动过滤 hidden 和无 title 的路由）
const menuItems = computed<MenuItem[]>(() => {
  if (!layoutRoute.value?.children) return []
  return generateMenuFromRoutes(layoutRoute.value.children)
})

// 当前激活的菜单路径
const activeMenu = computed(() => route.path)

// ==================== 菜单展开/折叠状态 ====================

// 存储所有已展开的菜单路径集合
const expandedMenus = ref<Set<string>>(new Set())

// 初始化时根据当前路径自动展开所有父级菜单
function initExpandedState() {
  const newSet = new Set<string>()

  // 递归查找当前路径的所有父级路径
  function findParentPaths(items: MenuItem[], targetPath: string, parents: string[]) {
    for (const item of items) {
      if (item.children && item.children.length > 0) {
        // 检查当前项或其子项是否匹配目标路径
        const isMatch = item.path === targetPath ||
          item.children.some(child => child.path === targetPath || targetPath.startsWith(child.path + '/'))

        if (isMatch) {
          // 将所有父级路径加入展开集合
          parents.forEach(p => newSet.add(p))
          newSet.add(item.path)
        }

        // 递归查找子项
        findParentPaths(item.children, targetPath, [...parents, item.path])
      }
    }
  }

  findParentPaths(menuItems.value, route.path, [])
  expandedMenus.value = newSet
}

// 监听路由变化，自动更新展开状态
watch(() => route.path, () => {
  initExpandedState()
}, { immediate: true })

// 切换菜单展开/折叠状态
function toggleExpand(item: MenuItem) {
  if (!item.children || item.children.length === 0) return

  if (expandedMenus.value.has(item.path)) {
    expandedMenus.value.delete(item.path)
  } else {
    expandedMenus.value.add(item.path)
  }
}

// 判断菜单是否展开
function isExpanded(item: MenuItem): boolean {
  return expandedMenus.value.has(item.path)
}

// 判断菜单项是否激活
function isMenuItemActive(item: MenuItem): boolean {
  if (activeMenu.value === item.path) return true
  if (item.path !== '/' && activeMenu.value.startsWith(item.path + '/')) return true

  if (item.children?.some(child =>
    activeMenu.value === child.path ||
    (child.path !== '/' && activeMenu.value.startsWith(child.path + '/'))
  )) {
    return true
  }

  return false
}

// 导航处理
function navigateTo(path: string) {
  if (path && path !== route.path) {
    router.push(path)
  }
}
</script>

<template>
  <aside class="fixed left-0 top-0 h-screen w-56 bg-gray-900 text-white flex flex-col z-50">
    <!-- Logo 区域 -->
    <div class="p-6 border-b border-gray-700 flex items-center gap-3">
      <AppIcon type="inline" :size="32">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </AppIcon>
      <span class="text-lg font-semibold">Shadcn AI</span>
    </div>

    <!-- 动态生成的菜单 -->
    <nav class="flex-1 p-4 overflow-y-auto">
      <!-- 第一级菜单列表 -->
      <ul class="space-y-1">
        <li v-for="item in menuItems" :key="item.path">
          <!-- 有子菜单的父级节点 -->
          <div v-if="item.children && item.children.length > 0" class="mb-1">
            <!-- 可点击的父级标题（切换展开/折叠） -->
            <button @click="toggleExpand(item)" :class="[
              'flex items-center justify-between w-full px-4 py-2.5 rounded-lg transition-all duration-200 cursor-pointer',
              isMenuItemActive(item)
                ? 'bg-primary-500/20 text-white font-medium'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            ]">
              <div class="flex items-center gap-3">
                <!-- 展开/折叠箭头图标 -->
                <svg :class="[
                  'w-4 h-4 transition-transform duration-200',
                  isExpanded(item) && 'rotate-90'
                ]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>

                <!-- 图标 -->
                <AppIcon v-if="item.icon" type="lucide" :icon="item.icon" :size="20" />

                <!-- 标题 -->
                <span class="text-sm">{{ item.title }}</span>
              </div>

              <!-- 子菜单数量徽章 -->
              <span v-if="isExpanded(item)" class="text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
                {{ item.children.length }}
              </span>
            </button>

            <!-- 子菜单区域（带动画效果） -->
            <transition enter-active-class="transition-all duration-200 ease-out"
              leave-active-class="transition-all duration-200 ease-in" enter-from-class="opacity-0 max-h-0"
              enter-to-class="opacity-100 max-h-96" leave-from-class="opacity-100 max-h-96"
              leave-to-class="opacity-0 max-h-0">
              <div v-show="isExpanded(item)" class="overflow-hidden">
                <!-- 第二级子菜单 -->
                <ul class="ml-4 mt-1 space-y-1 border-l border-gray-700 pl-3">
                  <li v-for="child in item.children" :key="child.path">
                    <!-- 第二级的子菜单（第三层） -->
                    <div v-if="child.children && child.children.length > 0" class="mb-1">
                      <button @click="toggleExpand(child)" :class="[
                        'flex items-center justify-between w-full px-4 py-2 rounded-md transition-all duration-200 cursor-pointer',
                        isMenuItemActive(child)
                          ? 'bg-primary-500/20 text-white font-medium'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      ]">
                        <div class="flex items-center gap-3">
                          <!-- 展开/折叠箭头 -->
                          <svg :class="[
                            'w-3.5 h-3.5 transition-transform duration-200',
                            isExpanded(child) && 'rotate-90'
                          ]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                          </svg>

                          <!-- 图标 -->
                          <AppIcon v-if="child.icon" type="lucide" :icon="child.icon" :size="18" />

                          <!-- 标题 -->
                          <span class="text-sm">{{ child.title }}</span>
                        </div>

                        <!-- 数量徽章 -->
                        <span v-if="isExpanded(child)" class="text-xs text-gray-500 bg-gray-800 px-1 py-0.5 rounded">
                          {{ child.children.length }}
                        </span>
                      </button>

                      <!-- 第三层子菜单 -->
                      <transition enter-active-class="transition-all duration-200 ease-out"
                        leave-active-class="transition-all duration-200 ease-in" enter-from-class="opacity-0 max-h-0"
                        enter-to-class="opacity-100 max-h-96" leave-from-class="opacity-100 max-h-96"
                        leave-to-class="opacity-0 max-h-0">
                        <div v-show="isExpanded(child)" class="overflow-hidden">
                          <ul class="ml-4 mt-1 space-y-1 border-l border-gray-700 pl-3">
                            <li v-for="grandChild in child.children" :key="grandChild.path">
                              <router-link v-perm="grandChild.permission || ''" :to="grandChild.path" :class="[
                                'flex items-center gap-3 px-4 py-2 rounded transition-all duration-200 text-sm',
                                activeMenu === grandChild.path
                                  ? 'bg-primary-500/30 text-white font-medium'
                                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                              ]" :title="grandChild.description || grandChild.title"
                                @click="navigateTo(grandChild.path)">
                                <!-- 占位符对齐 -->
                                <span class="w-3.5" />

                                <!-- 图标 -->
                                <AppIcon v-if="grandChild.icon" type="lucide" :icon="grandChild.icon" :size="16" />

                                <!-- 标题 -->
                                <span>{{ grandChild.title }}</span>
                              </router-link>
                            </li>
                          </ul>
                        </div>
                      </transition>
                    </div>

                    <!-- 无子菜单的第二级叶子节点 -->
                    <router-link v-else v-perm="child.permission || ''" :to="child.path" :class="[
                      'flex items-center gap-3 px-4 py-2 rounded-md transition-all duration-200 text-sm',
                      activeMenu === child.path
                        ? 'bg-primary-500/30 text-white font-medium'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    ]" :title="child.description || child.title" @click="navigateTo(child.path)">
                      <!-- 占位符对齐 -->
                      <span class="w-4" />

                      <!-- 图标 -->
                      <AppIcon v-if="child.icon" type="lucide" :icon="child.icon" :size="18" />

                      <!-- 标题 -->
                      <span>{{ child.title }}</span>
                    </router-link>
                  </li>
                </ul>
              </div>
            </transition>
          </div>

          <!-- 无子菜单的第一级叶子节点 -->
          <router-link v-else v-perm="item.permission || ''" :to="item.path" :class="[
            'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200',
            activeMenu === item.path
              ? 'bg-primary-500/30 text-white font-medium'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          ]" :title="item.description || item.title" @click="navigateTo(item.path)">
            <!-- 图标 -->
            <AppIcon v-if="item.icon" type="lucide" :icon="item.icon" :size="20" />

            <!-- 标题 -->
            <span>{{ item.title }}</span>
          </router-link>
        </li>
      </ul>

      <!-- 无菜单项提示 -->
      <div v-if="menuItems.length === 0" class="text-center py-8 text-gray-500">
        <p class="text-sm">暂无可用的菜单</p>
        <p class="text-xs mt-1">请在路由配置中添加 meta.title</p>
      </div>
    </nav>
  </aside>
</template>
