import { request } from '../request'
import type { MenuItem, MenuCreateRequest, MenuUpdateRequest } from './menu'

export const menuApi = {
  getAll(): Promise<{ code: number; message: string; data: MenuItem[] }> {
    return request.get('/api/menus')
  },

  getById(id: string): Promise<{ code: number; message: string; data: MenuItem }> {
    return request.get(`/api/menus/${id}`)
  },

  create(data: MenuCreateRequest): Promise<{ code: number; message: string; data: MenuItem }> {
    return request.post('/api/menus', data)
  },

  update(id: string, data: MenuUpdateRequest): Promise<{ code: number; message: string; data: MenuItem }> {
    return request.put(`/api/menus/${id}`, data)
  },

  delete(id: string): Promise<{ code: number; message: string }> {
    return request.delete(`/api/menus/${id}`)
  }
}
