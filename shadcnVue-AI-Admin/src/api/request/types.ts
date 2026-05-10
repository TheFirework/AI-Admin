import type { AxiosRequestConfig, AxiosResponse, AxiosError, Method, ResponseType, AxiosHeaders, RawAxiosHeaders } from 'axios'

export type ToastType = 'success' | 'warning' | 'error' | 'info'

export type ToastComponentType = 'message'

export interface ToastConfig {
  type?: ToastType
  message?: string
  duration?: number
  showClose?: boolean
  component?: ToastComponentType
  title?: string
}

export interface LoadingConfig {
  enabled?: boolean
  delay?: number
  target?: string | HTMLElement
  fullscreen?: boolean
}

export interface RequestConfig extends Omit<AxiosRequestConfig, 'method'> {
  baseURL?: string
  timeout?: number
  headers?: AxiosHeaders | Partial<RawAxiosHeaders & {
    Accept?: string
    'Content-Length'?: string
    'User-Agent'?: string
    'Content-Encoding'?: string
    Authorization?: string
    Location?: string
  }>
  retry?: boolean
  retryCount?: number
  retryDelay?: number
  retryStatusCodes?: number[]
  toast?: boolean | ToastConfig
  loading?: boolean | LoadingConfig
}

export interface RequestOptions extends Partial<RequestConfig> {
  url: string
  method?: Method
  data?: any
  params?: Record<string, any>
  headers?: Record<string, string>
  cancelToken?: any
  preventRepeat?: boolean
  responseType?: ResponseType
  returnOriginal?: boolean
  retry?: boolean
  retryCount?: number
  retryDelay?: number
  retryStatusCodes?: number[]
}

export interface OnionContext {
  req: {
    config: RequestOptions
  }
  res: AxiosResponse | null
  error: AxiosError | null
}

export type OnionMiddleware = (
  ctx: OnionContext,
  next: () => Promise<void>
) => Promise<void>

export interface CancelTokenSource {
  token: any
  cancel: (message?: string) => void
}

export interface APIResponse<T = any> {
  code: number
  message: string
  data: T
}
