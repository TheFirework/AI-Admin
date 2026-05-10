import {
  authHandlers,
  categoryHandlers,
  dishHandlers,
  tableHandlers,
  orderHandlers,
  dashboardHandlers,
  menuHandlers
} from './handlers/index'

export const handlers = [
  ...authHandlers,
  ...categoryHandlers,
  ...dishHandlers,
  ...tableHandlers,
  ...orderHandlers,
  ...dashboardHandlers,
  ...menuHandlers
]
