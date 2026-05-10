import type { RequestOptions, RequestConfig } from './types'
import { Core } from './core'
import {
  authMiddleware,
  repeatSubmitMiddleware,
  getParamsMiddleware,
  retryMiddleware,
  errorHandlerMiddleware,
  responseHandlerMiddleware,
  validateMiddleware,

} from './middlewares/index'
import { loggingMiddleware } from './extensions/logging'
import { appConfig } from '../../config/env'
import { getApiConfig } from '../../config/api'

const defaultRequestConfig: RequestConfig = {
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  },
  retry: false,
  retryCount: 3,
  retryDelay: 1000,
  retryStatusCodes: [502, 503, 504],
}

class Request {
  private core: Core

  constructor() {
    const globalApiConfig = getApiConfig()

    const mergedConfig = {
      ...defaultRequestConfig,
      ...globalApiConfig
    }

    // 使用类型断言解决 headers 类型不兼容问题
    this.core = new Core(mergedConfig as RequestConfig)
    this.initMiddlewares()
  }

  private initMiddlewares() {
    this.core.useGlobal(authMiddleware)
    this.core.use(validateMiddleware)
    this.core.use(loggingMiddleware)
    this.core.use(retryMiddleware)
    this.core.use(repeatSubmitMiddleware)
    this.core.use(getParamsMiddleware)
    this.core.use(errorHandlerMiddleware)
    this.core.use(responseHandlerMiddleware)
  }

  get axios() {
    return this.core.axios
  }

  setBaseURL(baseURL: string) {
    this.core.setBaseURL(baseURL)
  }

  getBaseURL(): string {
    return this.core.getBaseURL()
  }

  async request<T = any>(options: RequestOptions): Promise<T> {
    return this.core.request<T>(options)
  }

  async get<T = any>(url: string, options?: Omit<RequestOptions, 'url' | 'method'>): Promise<T> {
    return this.request<T>({ url, method: 'get', ...options })
  }

  async post<T = any>(url: string, data?: any, options?: Omit<RequestOptions, 'url' | 'method' | 'data'>): Promise<T> {
    return this.request<T>({ url, method: 'post', data, ...options })
  }

  async put<T = any>(url: string, data?: any, options?: Omit<RequestOptions, 'url' | 'method' | 'data'>): Promise<T> {
    return this.request<T>({ url, method: 'put', data, ...options })
  }

  async delete<T = any>(url: string, options?: Omit<RequestOptions, 'url' | 'method'>): Promise<T> {
    return this.request<T>({ url, method: 'delete', ...options })
  }

  async upload<T = any>(url: string, formData: FormData, options?: Omit<RequestOptions, 'url' | 'method' | 'data'>): Promise<T> {
    return this.request<T>({
      url,
      method: 'post',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
      ...options
    })
  }

  async download(url: string, options?: Omit<RequestOptions, 'url' | 'method'>): Promise<Blob> {
    return this.request<Blob>({
      url,
      method: 'get',
      responseType: 'blob',
      ...options
    })
  }

  use(middleware: Parameters<Core['use']>[0]) {
    this.core.use(middleware)
  }

  createTenantRequest(tenantId: string): Request {
    const tenantBaseURL = `${appConfig.api.baseURL}/tenants/${tenantId}`
    const tenantRequest = new Request()
    tenantRequest.setBaseURL(tenantBaseURL)
    return tenantRequest
  }
}

export const request = new Request()

export default request
