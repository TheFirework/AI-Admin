import { http, HttpResponse } from 'msw'
import type { Dish } from '@/api'
import { mockDishes, getNextDishId } from '../data'

export const dishHandlers = [
  http.get('/api/dishes', ({ request }) => {
    const url = new URL(request.url)
    const categoryId = url.searchParams.get('categoryId')
    const keyword = url.searchParams.get('keyword')

    let result = [...mockDishes]

    if (categoryId) {
      result = result.filter(d => d.categoryId === parseInt(categoryId))
    }

    if (keyword) {
      result = result.filter(d => d.name.includes(keyword))
    }

    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: result
    })
  }),

  http.get('/api/dishes/:id', ({ params }) => {
    const id = parseInt(params.id as string)
    const dish = mockDishes.find(d => d.id === id)

    if (dish) {
      return HttpResponse.json({
        code: 200,
        message: 'success',
        data: dish
      })
    }

    return HttpResponse.json({
      code: 404,
      message: '菜品不存在'
    }, { status: 404 })
  }),

  http.post('/api/dishes', async ({ request }) => {
    const body = await request.json()
    const dish = body as Omit<Dish, 'id'>

    const newDish: Dish = {
      id: getNextDishId(),
      ...dish
    }

    mockDishes.push(newDish)

    return HttpResponse.json({
      code: 200,
      message: '创建成功',
      data: newDish
    })
  }),

  http.put('/api/dishes/:id', async ({ params, request }) => {
    const id = parseInt(params.id as string)
    const body = await request.json()
    const updates = body as Partial<Dish>

    const index = mockDishes.findIndex(d => d.id === id)
    if (index !== -1) {
      mockDishes[index] = { ...mockDishes[index], ...updates }
      return HttpResponse.json({
        code: 200,
        message: '更新成功',
        data: mockDishes[index]
      })
    }

    return HttpResponse.json({
      code: 404,
      message: '菜品不存在'
    }, { status: 404 })
  }),

  http.delete('/api/dishes/:id', ({ params }) => {
    const id = parseInt(params.id as string)
    const index = mockDishes.findIndex(d => d.id === id)

    if (index !== -1) {
      mockDishes.splice(index, 1)
      return HttpResponse.json({
        code: 200,
        message: '删除成功'
      })
    }

    return HttpResponse.json({
      code: 404,
      message: '菜品不存在'
    }, { status: 404 })
  }),

  http.put('/api/dishes/batch/status', async ({ request }) => {
    const body = await request.json()
    const { ids, isOnSale } = body as { ids: number[]; isOnSale: boolean }

    mockDishes.forEach(dish => {
      if (ids.includes(dish.id)) {
        dish.isOnSale = isOnSale
      }
    })

    return HttpResponse.json({
      code: 200,
      message: '批量更新成功',
      data: mockDishes.filter(d => ids.includes(d.id))
    })
  })
]
