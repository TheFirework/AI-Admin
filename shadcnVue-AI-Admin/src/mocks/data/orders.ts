import type { Order, OrderItem } from '@/api'
import Mock from 'mockjs'
import { mockDishes } from './dishes'

const tableNames = ['1号桌', '2号桌', '3号桌', '4号桌', '5号桌', '6号桌', '7号桌', '8号桌']
const statuses: Order['status'][] = ['pending', 'confirmed', 'cooking', 'completed']

function generateOrderItems(): OrderItem[] {
  const numItems = Mock.Random.integer(1, 5)
  const items: OrderItem[] = []
  const usedDishIds = new Set<number>()

  const availableDishes = mockDishes.filter(d => d.isOnSale)

  for (let i = 0; i < numItems && i < availableDishes.length; i++) {
    let dish
    do {
      dish = Mock.Random.pick(availableDishes)
    } while (usedDishIds.has(dish.id))

    usedDishIds.add(dish.id)
    items.push({
      dish,
      quantity: Mock.Random.integer(1, 3)
    })
  }

  return items
}

function calculateTotalAmount(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0)
}

const numOrders = Mock.Random.integer(10, 20)
export const mockOrders: Order[] = Array.from({ length: numOrders }, (_, index) => {
  const items = generateOrderItems()
  return {
    id: index + 1,
    tableName: Mock.Random.pick(tableNames),
    items,
    totalAmount: calculateTotalAmount(items),
    status: Mock.Random.pick(statuses),
    createdAt: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
  }
})

export let orderIdCounter = mockOrders.length + 1

export function getNextOrderId(): number {
  return orderIdCounter++
}
