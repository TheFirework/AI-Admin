import type { AxiosRequestConfig } from 'axios'

export interface ApiConfig {
  baseURL?: string
  timeout?: number
  headers?: AxiosRequestConfig['headers']
  retry?: boolean
  retryCount?: number
  retryDelay?: number
  retryStatusCodes?: number[]
}

export interface ApiGlobalConfig {
  api?: ApiConfig
}

export const apiConfig: ApiGlobalConfig = {
  api: {
    retry: false,
    retryCount: 3,
    retryDelay: 1000,
    retryStatusCodes: [502, 503, 504]
  }
}

export function getApiConfig(): ApiConfig | undefined {
  return apiConfig.api
}

export function setApiConfig(config: ApiConfig): void {
  if (apiConfig.api) {
    apiConfig.api = { ...apiConfig.api, ...config }
  } else {
    apiConfig.api = config
  }
}

export function mergeApiConfig(config: Partial<ApiConfig>): void {
  if (!apiConfig.api) {
    apiConfig.api = {}
  }
  apiConfig.api = { ...apiConfig.api, ...config }
}
