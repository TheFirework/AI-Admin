import type { OnionMiddleware, RequestOptions } from '../types'

const pendingRequests = new Map<string, AbortController>()

function generateKey(options: RequestOptions): string {
  const { method = 'get', url, params, data } = options
  const paramsStr = params ? JSON.stringify(params) : ''
  const dataStr = data ? JSON.stringify(data) : ''
  return `${method}:${url}:${paramsStr}:${dataStr}`
}

export const repeatSubmitMiddleware: OnionMiddleware = async (ctx, next) => {
  const { preventRepeat = true } = ctx.req.config
  
  if (preventRepeat) {
    const key = generateKey(ctx.req.config)
    
    if (pendingRequests.has(key)) {
      pendingRequests.get(key)?.abort('重复请求被取消')
    }
    
    const controller = new AbortController()
    ctx.req.config.signal = controller.signal
    pendingRequests.set(key, controller)
    
    try {
      await next()
    } finally {
      pendingRequests.delete(key)
    }
  } else {
    await next()
  }
}
