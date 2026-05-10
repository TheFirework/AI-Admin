import { http, HttpResponse } from 'msw'
import type { Category } from '@/api'
import { mockCategories, getNextCategoryId } from '../data'

export const categoryHandlers = [
  http.get('/api/categories', () => {
    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: mockCategories
    })
  }),

  http.post('/api/categories', async ({ request }) => {
    const body = await request.json()
    const category = body as Omit<Category, 'id'>

    const newCategory: Category = {
      id: getNextCategoryId(),
      ...category
    }

    mockCategories.push(newCategory)

    return HttpResponse.json({
      code: 200,
      message: '创建成功',
      data: newCategory
    })
  }),

  http.put('/api/categories/:id', async ({ params, request }) => {
    const id = parseInt(params.id as string)
    const body = await request.json()
    const updates = body as Partial<Category>

    const index = mockCategories.findIndex(c => c.id === id)
    if (index !== -1) {
      mockCategories[index] = { ...mockCategories[index], ...updates }
      return HttpResponse.json({
        code: 200,
        message: '更新成功',
        data: mockCategories[index]
      })
    }

    return HttpResponse.json({
      code: 404,
      message: '分类不存在'
    }, { status: 404 })
  }),

  http.delete('/api/categories/:id', ({ params }) => {
    const id = parseInt(params.id as string)
    const index = mockCategories.findIndex(c => c.id === id)

    if (index !== -1) {
      mockCategories.splice(index, 1)
      return HttpResponse.json({
        code: 200,
        message: '删除成功'
      })
    }

    return HttpResponse.json({
      code: 404,
      message: '分类不存在'
    }, { status: 404 })
  })
]
