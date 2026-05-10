import { request } from '../request/request'
import type { DashboardStats } from './types'

const urls = {
  summary: '/dashboard'
}

export const dashboardApi = {
  summary: () => request.get<DashboardStats>(urls.summary)
}
