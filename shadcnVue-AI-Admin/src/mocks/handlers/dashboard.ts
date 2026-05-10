import { http, HttpResponse } from 'msw'
import { mockOrders, mockDishes, mockTables } from '../data'

export const dashboardHandlers = [
  http.get('/api/dashboard', () => {
    const totalOrders = mockOrders.length
    const pendingOrders = mockOrders.filter(o => o.status === 'pending').length
    const confirmedOrders = mockOrders.filter(o => o.status === 'confirmed').length
    const cookingOrders = mockOrders.filter(o => o.status === 'cooking').length
    const completedOrders = mockOrders.filter(o => o.status === 'completed').length
    
    const totalRevenue = mockOrders.reduce((sum, o) => sum + o.totalAmount, 0)
    const totalDishes = mockDishes.length
    const onSaleDishes = mockDishes.filter(d => d.isOnSale).length
    const usedTables = mockTables.filter(t => t.isUsed).length
    const totalTables = mockTables.length
    
    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        cookingOrders,
        completedOrders,
        totalRevenue,
        totalDishes,
        onSaleDishes,
        usedTables,
        totalTables
      }
    })
  })
]
