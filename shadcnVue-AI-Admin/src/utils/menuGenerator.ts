import type { RouteRecordRaw } from 'vue-router'

// ==================== 菜单接口定义 ====================
export interface MenuItem {
  path: string
  name: string
  title: string
  icon?: string
  permission?: string
  description?: string
  hidden?: boolean // 是否在菜单中隐藏
  children?: MenuItem[]
}

// ==================== 从路由配置生成菜单 ====================

/**
 * 将 Vue Router 的路由配置转换为侧边栏菜单结构
 *
 * @param routes - 路由配置数组（通常是 Layout 的 children）
 * @returns 过滤后的菜单项数组（排除 hidden 路由）
 *
 * @example
 * ```typescript
 * import { routes } from '@/router'
 * const layoutRoute = routes.find(r => r.name === 'Layout')
 * const menuItems = generateMenuFromRoutes(layoutRoute?.children || [])
 * ```
 */
export function generateMenuFromRoutes(routes: RouteRecordRaw[]): MenuItem[] {
  return routes
    .filter(route => shouldShowInMenu(route))
    .map(route => transformRouteToMenuItem(route))
    .filter(Boolean) as MenuItem[]
}

// ==================== 判断是否在菜单中显示 ====================

/**
 * 检查路由是否应该在侧边栏菜单中显示
 *
 * 规则：
 * 1. meta.hidden === true → 隐藏
 * 2. 没有 meta.title → 隐藏（没有标题无法显示）
 * 3. path 为空字符串且不是根路径 → 隐藏
 */
function shouldShowInMenu(route: RouteRecordRaw): boolean {
  const meta = route.meta as Record<string, any> | undefined

  // 显式隐藏的路由
  if (meta?.hidden === true) return false

  // 没有标题的路由不显示在菜单中
  if (!meta?.title) return false

  // 空路径但不是根路径的不显示（如重定向等）
  if (route.path === '' && route.name !== 'Dashboard') return false

  return true
}

// ==================== 路由转换为菜单项 ====================

/**
 * 将单个路由记录转换为菜单项
 */
function transformRouteToMenuItem(route: RouteRecordRaw): MenuItem | null {
  const meta = route.meta as Record<string, any> | undefined
  const path = route.path || '/'

  // 基本菜单项信息
  const menuItem: MenuItem = {
    path,
    name: (route.name as string) || '',
    title: meta?.title || (route.name as string) || '',
    icon: meta?.icon,
    permission: meta?.permission,
    description: meta?.description,
    hidden: meta?.hidden,
  }

  // 处理子路由（嵌套路由）
  if (route.children && route.children.length > 0) {
    const visibleChildren = route.children
      .filter(child => shouldShowInMenu(child))
      .map(child => transformRouteToMenuItem(child))
      .filter(Boolean) as MenuItem[]

    if (visibleChildren.length > 0) {
      menuItem.children = visibleChildren
    }
  }

  return menuItem
}

// ==================== 辅助功能：按模块分组 ====================

/**
 * 将菜单项按照路径前缀分组（用于分组显示）
 *
 * @param menuItems - 菜单项数组
 * @param groupBy - 分组依据（默认按第一级路径分段）
 * @returns 分组后的菜单结构
 *
 * @example
 * ```typescript
 * const grouped = groupMenuByModule(menuItems)
 * // 结果：{ system: [...], user: [...], components: [...] }
 * ```
 */
export function groupMenuByModule(
  menuItems: MenuItem[],
  groupBy?: (item: MenuItem) => string
): Record<string, MenuItem[]> {
  const groupingFn = groupBy || ((item: MenuItem) => {
    // 默认按第一级路径分组
    const segments = item.path.split('/').filter(Boolean)
    return segments[0] || 'other'
  })

  return menuItems.reduce((groups, item) => {
    const key = groupingFn(item)
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(item)
    return groups
  }, {} as Record<string, MenuItem[]>)
}

// ==================== 辅助功能：查找激活的菜单项 ====================

/**
 * 根据当前路径查找匹配的菜单项
 *
 * @param menuItems - 完整的菜单树
 * @param currentPath - 当前路由路径
 * @returns 匹配的菜单项或 null
 */
export function findActiveMenuItem(
  menuItems: MenuItem[],
  currentPath: string
): MenuItem | null {
  for (const item of menuItems) {
    // 精确匹配
    if (item.path === currentPath) {
      return item
    }

    // 子路径匹配（处理 /components/tree/basic 这类路径）
    if (currentPath.startsWith(item.path + '/') && item.path !== '/') {
      return item
    }

    // 递归查找子菜单
    if (item.children && item.children.length > 0) {
      const found = findActiveMenuItem(item.children, currentPath)
      if (found) return found
    }
  }

  return null
}

/**
 * 获取所有父级菜单路径（用于展开状态）
 *
 * @param menuItems - 完整的菜单树
 * @param currentPath - 当前路由路径
 * @returns 所有父级路径数组
 */
export function getParentMenuPaths(
  menuItems: MenuItem[],
  currentPath: string
): string[] {
  const parentPaths: string[] = []

  function search(items: MenuItem[], targetPath: string, parents: string[]): boolean {
    for (const item of items) {
      if (item.path === targetPath || targetPath.startsWith(item.path + '/')) {
        parentPaths.push(...parents)
        return true
      }

      if (item.children && item.children.length > 0) {
        if (search(item.children, targetPath, [...parents, item.path])) {
          return true
        }
      }
    }
    return false
  }

  search(menuItems, currentPath, [])
  return parentPaths
}
