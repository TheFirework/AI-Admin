import { http, HttpResponse } from 'msw'
import { menuData } from '../data/menus'
import type { MenuItem, MenuCreateRequest, MenuUpdateRequest } from '@/api/modules/menu'

let menus: MenuItem[] = JSON.parse(JSON.stringify(menuData))

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function findParent(menus: MenuItem[], parentId: string | null): MenuItem | null {
  if (!parentId) return null
  for (const menu of menus) {
    if (menu.id === parentId) return menu
    if (menu.children) {
      const found = findParent(menu.children, parentId)
      if (found) return found
    }
  }
  return null
}

function addMenu(menus: MenuItem[], parentId: string | null, menu: MenuItem): boolean {
  if (!parentId) {
    menus.push(menu)
    return true
  }
  for (const m of menus) {
    if (m.id === parentId) {
      if (!m.children) m.children = []
      m.children.push(menu)
      return true
    }
    if (m.children && addMenu(m.children, parentId, menu)) {
      return true
    }
  }
  return false
}

function updateMenu(menus: MenuItem[], menu: MenuUpdateRequest): boolean {
  for (let i = 0; i < menus.length; i++) {
    if (menus[i].id === menu.id) {
      menus[i] = { ...menus[i], ...menu, children: menus[i].children }
      return true
    }
    if (menus[i].children && updateMenu(menus[i].children, menu)) {
      return true
    }
  }
  return false
}

function deleteMenu(menus: MenuItem[], id: string): boolean {
  for (let i = 0; i < menus.length; i++) {
    if (menus[i].id === id) {
      menus.splice(i, 1)
      return true
    }
    if (menus[i].children && deleteMenu(menus[i].children, id)) {
      return true
    }
  }
  return false
}

function findMenu(menus: MenuItem[], id: string): MenuItem | null {
  for (const menu of menus) {
    if (menu.id === id) return menu
    if (menu.children) {
      const found = findMenu(menu.children, id)
      if (found) return found
    }
  }
  return null
}

export const menuHandlers = [
  http.get('/api/menus', () => {
    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: menus
    })
  }),

  http.get('/api/menus/:id', ({ params }) => {
    const { id } = params
    const menu = findMenu(menus, id as string)
    if (!menu) {
      return HttpResponse.json({
        code: 404,
        message: '菜单不存在'
      })
    }
    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: menu
    })
  }),

  http.post('/api/menus', async ({ request }) => {
    const body = await request.json() as MenuCreateRequest
    const menu: MenuItem = {
      ...body,
      id: generateId(),
      updateTime: new Date().toLocaleString('zh-CN')
    }
    addMenu(menus, body.parentId, menu)
    return HttpResponse.json({
      code: 200,
      message: '创建成功',
      data: menu
    })
  }),

  http.put('/api/menus/:id', async ({ params, request }) => {
    const { id } = params
    const body = await request.json() as MenuUpdateRequest
    const success = updateMenu(menus, { ...body, id: id as string })
    if (!success) {
      return HttpResponse.json({
        code: 404,
        message: '菜单不存在'
      })
    }
    return HttpResponse.json({
      code: 200,
      message: '更新成功',
      data: findMenu(menus, id as string)
    })
  }),

  http.delete('/api/menus/:id', ({ params }) => {
    const { id } = params
    const success = deleteMenu(menus, id as string)
    if (!success) {
      return HttpResponse.json({
        code: 404,
        message: '菜单不存在'
      })
    }
    return HttpResponse.json({
      code: 200,
      message: '删除成功'
    })
  })
]
