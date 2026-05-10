export interface MenuItem {
  id: string
  name: string
  parentId: string | null
  visible: boolean
  icon: string
  type: 'menu' | 'button' | 'page'
  routePath: string
  keepAlive: boolean
  filePath: string
  permission: string
  updateTime: string
  sort: number
  children?: MenuItem[]
}

export interface MenuCreateRequest {
  name: string
  parentId: string | null
  visible: boolean
  icon: string
  type: 'menu' | 'button' | 'page'
  routePath: string
  keepAlive: boolean
  filePath: string
  permission: string
  sort: number
}

export interface MenuUpdateRequest extends MenuCreateRequest {
  id: string
}
