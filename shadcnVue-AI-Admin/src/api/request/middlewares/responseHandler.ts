import type { OnionMiddleware, ToastConfig } from '../types'
import { showErrorToast } from '../utils/toast'
import { appConfig } from '@/config/env'

const globalToastEnabled = true

export const responseHandlerMiddleware: OnionMiddleware = async (ctx, next) => {
  await next()

  if (ctx.res) {
    const { data } = ctx.res

    if (data && typeof data === 'object') {
      if (data.code !== undefined && data.code !== 200) {
        const toastConfig = ctx.req.config.toast
        const shouldShowToast = getToastEnabled(toastConfig)

        if (shouldShowToast) {
          const message = getToastMessage(toastConfig, data.message || '请求失败')
          showErrorToast(message)
        }

        throw new Error(data.message || '请求失败')
      }

      // 如果响应数据包含 code 字段，说明是标准响应格式，提取 data 字段作为实际返回值
      if (data.code !== undefined && data.data !== undefined) {
        ctx.res.data = data.data
      }
    }
  }
}

function getToastEnabled(config: boolean | ToastConfig | undefined): boolean {
  if (config === false) return false
  if (config === true) return true
  if (config && typeof config === 'object') return config.type !== undefined
  return globalToastEnabled && appConfig.app.env !== 'production'
}

function getToastMessage(config: boolean | ToastConfig | undefined, defaultMessage: string): string {
  if (config && typeof config === 'object' && config.message) {
    return config.message
  }
  return defaultMessage
}
