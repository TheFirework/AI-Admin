import type { OnionMiddleware } from '../../types'
import { logRequest, logResponse, logError } from './logging'
import { getMonitorConfig } from './config'

export const loggingMiddleware: OnionMiddleware = async (ctx, next) => {
  const { logging } = getMonitorConfig()
  if (!logging.enabled) {
    await next()
    return
  }

  const startTime = Date.now()
  const { config } = ctx.req

  logRequest(config, startTime)

  try {
    await next()
    
    if (ctx.res) {
      logResponse(config, ctx.res, startTime)
    }
  } catch (error) {
    logError(config, error as any, startTime)
    throw error
  }
}
