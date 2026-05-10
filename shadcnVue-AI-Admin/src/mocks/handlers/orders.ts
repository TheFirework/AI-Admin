import { http, HttpResponse } from 'msw'
import type { Order, OrderItem } from '@/api'
import { mockOrders, getNextOrderId, mockDishes } from '../data'

export const orderHandlers = [
  http.get('/api/orders', ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')

    let result = [...mockOrders]

    if (status) {
      result = result.filter(o => o.status === status)
    }

    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: result
    })
  }),

  http.get('/api/orders/:id', ({ params }) => {
    const id = parseInt(params.id as string)
    const order = mockOrders.find(o => o.id === id)

    if (order) {
      return HttpResponse.json({
        code: 200,
        message: 'success',
        data: order
      })
    }

    return HttpResponse.json({
      code: 404,
      message: '订单不存在'
    }, { status: 404 })
  }),

  http.post('/api/orders', async ({ request }) => {
    const body = await request.json()
    const { tableName, items } = body as { tableName: string; items: { dishId: number; quantity: number }[] }

    const orderItems: OrderItem[] = items.map(item => ({
      dish: mockDishes.find(d => d.id === item.dishId)!,
      quantity: item.quantity
    }))

    const totalAmount = orderItems.reduce((sum, item) => sum + item.dish.price * item.quantity, 0)

    const newOrder: Order = {
      id: getNextOrderId(),
      tableName,
      items: orderItems,
      totalAmount,
      status: 'pending',
      createdAt: new Date().toLocaleString('zh-CN')
    }

    mockOrders.unshift(newOrder)

    return HttpResponse.json({
      code: 200,
      message: '下单成功',
      data: newOrder
    })
  }),

  http.put('/api/orders/:id/status', async ({ params, request }) => {
    const id = parseInt(params.id as string)
    const body = await request.json()
    const { status } = body as { status: Order['status'] }

    const index = mockOrders.findIndex(o => o.id === id)
    if (index !== -1) {
      mockOrders[index].status = status
      return HttpResponse.json({
        code: 200,
        message: '状态更新成功',
        data: mockOrders[index]
      })
    }

    return HttpResponse.json({
      code: 404,
      message: '订单不存在'
    }, { status: 404 })
  })
]
