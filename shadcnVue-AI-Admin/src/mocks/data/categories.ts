import type { Category } from '@/api'

export const mockCategories: Category[] = [
  { id: 1, name: '热菜', sort: 1 },
  { id: 2, name: '凉菜', sort: 2 },
  { id: 3, name: '酒水', sort: 3 },
  { id: 4, name: '主食', sort: 4 }
]

export let categoryIdCounter = 5

export function getNextCategoryId(): number {
  return categoryIdCounter++
}
