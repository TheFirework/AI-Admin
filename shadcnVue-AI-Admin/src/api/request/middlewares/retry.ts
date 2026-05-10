import type { OnionMiddleware } from '../types'
import type { AxiosError } from 'axios'

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const retryMiddleware: OnionMiddleware = async (ctx, next) => {
  const { 
    retry = false, 
    retryCount = 3, 
    retryDelay = 1000, 
    retryStatusCodes = [502, 503, 504] 
  } = ctx.req.config

  if (!retry) {
    await next()
    return
  }

  let attempt = 0
  let lastError: Error | null = null

  while (attempt < retryCount) {
    try {
      await next()
      return
    } catch (error) {
      lastError = error as Error
      const axiosError = error as AxiosError
      const status = axiosError.response?.status

      if (status && retryStatusCodes.includes(status)) {
        attempt++
        if (attempt < retryCount) {
          await delay(retryDelay * Math.pow(2, attempt - 1))
          continue
        }
      }
      throw error
    }
  }

  throw lastError || new Error('请求失败')
}
