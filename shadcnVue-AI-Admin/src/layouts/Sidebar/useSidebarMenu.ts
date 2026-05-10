import { ref, computed, watch, provide } from 'vue'
import { useRoute } from 'vue-router'
import { routes } from '@/router'
import { generateMenuFromRoutes, type MenuItem } from '@/utils/menuGenerator'

export function useSidebarMenu() {
  const route = useRoute()

  const layoutRoute = computed(() => routes.find(r => r.name === 'Layout'))

  const menuItems = computed<MenuItem[]>(() => {
    if (!layoutRoute.value?.children) return []
    return generateMenuFromRoutes(layoutRoute.value.children)
  })

  const expandedMenus = ref<Set<string>>(new Set())

  function initExpandedState() {
    const newSet = new Set<string>()
    function findParentPaths(items: MenuItem[], targetPath: string, parents: string[]) {
      for (const item of items) {
        if (item.children?.length) {
          const isMatch = item.path === targetPath
            || item.children.some(child => child.path === targetPath || targetPath.startsWith(child.path + '/'))
          if (isMatch) {
            parents.forEach(p => newSet.add(p))
            newSet.add(item.path)
          }
          findParentPaths(item.children, targetPath, [...parents, item.path])
        }
      }
    }
    findParentPaths(menuItems.value, route.path, [])
    expandedMenus.value = newSet
  }

  watch(() => route.path, initExpandedState, { immediate: true })

  function toggleExpand(item: MenuItem) {
    if (!item.children?.length) return
    if (expandedMenus.value.has(item.path)) {
      expandedMenus.value.delete(item.path)
    } else {
      expandedMenus.value.add(item.path)
    }
  }

  function isExpanded(item: MenuItem): boolean {
    return expandedMenus.value.has(item.path)
  }

  function isMenuItemActive(item: MenuItem): boolean {
    const currentPath = route.path
    if (currentPath === item.path) return true
    if (item.path !== '/' && currentPath.startsWith(item.path + '/')) return true
    if (item.children?.some(child =>
      currentPath === child.path
      || (child.path !== '/' && currentPath.startsWith(child.path + '/'))
    )) return true
    return false
  }

  provide('sidebarExpandCtx', {
    expandedMenus,
    toggleExpand,
    isExpanded,
    isMenuItemActive,
  })

  return { menuItems }
}
