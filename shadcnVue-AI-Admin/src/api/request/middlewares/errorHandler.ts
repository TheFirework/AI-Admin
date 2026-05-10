import type { OnionMiddleware, ToastConfig } from '../types'
import type { AxiosError } from 'axios'
import storage from '@/utils/storage'
import { showErrorToast, showInfoToast } from '../utils/toast'
import { appConfig } from '@/config/env'

const globalToastEnabled = true

export const errorHandlerMiddleware: OnionMiddleware = async (ctx, next) => {
  try {
    await next()
  } catch (error) {
    const axiosError = error as AxiosError

    const toastConfig = ctx.req.config.toast
    const shouldShowToast = getToastEnabled(toastConfig)

    if (axiosError.response) {
      const { status, data } = axiosError.response

      switch (status) {
        case 401:
          storage.removeToken()
          window.location.href = '/login'
          break
        case 500:
          console.error('服务器错误:', data)
          if (shouldShowToast) {
            const message = typeof data === 'object' && data !== null && 'message' in data
              ? (data as { message: string }).message
              : true

                ? (data as { message: string }).message
                : '服务器内部错误'
            showErrorToast(message, getToastDuration(toastConfig))
          }
          break
        default:
          if (data && typeof data === 'object' && 'message' in data) {
            console.error('业务异常:', data.message)
            if (shouldShowToast) {
              showErrorToast(data.message as string, getToastDuration(toastConfig))
            }
          }
      }
    } else if (axiosError.request) {
      console.error('网络异常:', axiosError.message)
      if (shouldShowToast) {
        showErrorToast('网络连接失败，请检查网络设置', getToastDuration(toastConfig))
      }
    } else {
      console.error('请求配置异常:', axiosError.message)
      if (shouldShowToast) {
        showInfoToast('请求配置异常', getToastDuration(toastConfig))
      }
    }

    throw error
  }
}

function getToastEnabled(config: boolean | ToastConfig | undefined): boolean {
  if (config === false) return false
  if (config === true) return true
  if (config && typeof config === 'object') return config.type !== undefined
  return globalToastEnabled && appConfig.app.env !== 'production'
}

function getToastDuration(config: boolean | ToastConfig | undefined): number | undefined {
  if (config && typeof config === 'object' && config.duration) {
    return config.duration
  }
  return undefined
}
