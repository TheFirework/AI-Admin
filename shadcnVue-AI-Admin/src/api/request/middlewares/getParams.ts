import type { OnionMiddleware } from '../types'

export const getParamsMiddleware: OnionMiddleware = async (ctx, next) => {
  const { method = 'get', params } = ctx.req.config
  
  if (method.toLowerCase() === 'get' && params) {
    const filteredParams = Object.keys(params).reduce((acc, key) => {
      const value = params[key]
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value
      }
      return acc
    }, {} as Record<string, any>)
    ctx.req.config.params = filteredParams
  }
  
  await next()
}
