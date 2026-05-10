import { http, HttpResponse } from 'msw'
import type { Table } from '@/api'
import { mockTables } from '../data'

export const tableHandlers = [
  http.get('/api/tables', () => {
    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: mockTables
    })
  }),

  http.put('/api/tables/:id', async ({ params, request }) => {
    const id = parseInt(params.id as string)
    const body = await request.json()
    const updates = body as Partial<Table>

    const index = mockTables.findIndex(t => t.id === id)
    if (index !== -1) {
      mockTables[index] = { ...mockTables[index], ...updates }
      return HttpResponse.json({
        code: 200,
        message: '更新成功',
        data: mockTables[index]
      })
    }

    return HttpResponse.json({
      code: 404,
      message: '桌台不存在'
    }, { status: 404 })
  })
]
