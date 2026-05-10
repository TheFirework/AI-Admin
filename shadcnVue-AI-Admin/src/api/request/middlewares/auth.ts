import type { OnionMiddleware } from '../types'
import storage from '../../../utils/storage'

export const authMiddleware: OnionMiddleware = async (ctx, next) => {
  const token = storage.getToken()
  if (token) {
    ctx.req.config.headers = ctx.req.config.headers || {}
    ctx.req.config.headers['Authorization'] = `Bearer ${token}`
  }
  await next()
}
