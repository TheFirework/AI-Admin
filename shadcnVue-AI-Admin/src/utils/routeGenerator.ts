import type { RouteRecordRaw } from 'vue-router'
import type { MenuItem } from '@/api/modules/menu'

export function generateRoutes(menuTree: MenuItem[]): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = []
  
  const processMenu = (items: MenuItem[], parentRoute?: RouteRecordRaw): void => {
    for (const item of items) {
      // 按钮类型不生成路由
      if (item.type === 'button') continue
      
      const route: RouteRecordRaw = {
        path: item.routePath,
        name: item.name,
        component: item.filePath ? () => import(/* @vite-ignore */ item.filePath) : undefined,
        meta: {
          title: item.name,
          icon: item.icon,
          permission: item.permission,
          keepAlive: item.keepAlive
        }
      }
      
      if (item.children && item.children.length > 0) {
        route.children = []
        processMenu(item.children, route)
      }
      
      if (parentRoute) {
        if (!parentRoute.children) parentRoute.children = []
        parentRoute.children.push(route)
      } else {
        routes.push(route)
      }
    }
  }
  
  processMenu(menuTree)
  return routes
}

export function generateFlatMenuList(menuTree: MenuItem[]): MenuItem[] {
  const flatList: MenuItem[] = []
  
  const flatten = (items: MenuItem[]) => {
    for (const item of items) {
      flatList.push(item)
      if (item.children) {
        flatten(item.children)
      }
    }
  }
  
  flatten(menuTree)
  return flatList
}

export function filterMenuByPermission(menuTree: MenuItem[], permissions: string[]): MenuItem[] {
  const hasPermission = (perm: string): boolean => {
    if (!perm) return true
    return permissions.some(p => p === perm || p === '*' || p.endsWith(':*'))
  }
  
  const filter = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter(item => hasPermission(item.permission))
      .map(item => ({
        ...item,
        children: item.children ? filter(item.children) : undefined
      }))
      .filter(item => {
        // 如果是菜单类型且没有子节点，过滤掉
        if (item.type === 'menu' && (!item.children || item.children.length === 0)) {
          return false
        }
        return true
      })
  }
  
  return filter(menuTree)
}
