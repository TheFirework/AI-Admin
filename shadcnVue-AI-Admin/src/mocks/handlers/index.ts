import { authHandlers } from './auth'
import { categoryHandlers } from './categories'
import { dishHandlers } from './dishes'
import { tableHandlers } from './tables'
import { orderHandlers } from './orders'
import { dashboardHandlers } from './dashboard'
import { menuHandlers } from './menus'

export const handlers = [
  ...authHandlers,
  ...categoryHandlers,
  ...dishHandlers,
  ...tableHandlers,
  ...orderHandlers,
  ...dashboardHandlers,
  ...menuHandlers
]

export { authHandlers } from './auth'
export { categoryHandlers } from './categories'
export { dishHandlers } from './dishes'
export { tableHandlers } from './tables'
export { orderHandlers } from './orders'
export { dashboardHandlers } from './dashboard'
export { menuHandlers } from './menus'
