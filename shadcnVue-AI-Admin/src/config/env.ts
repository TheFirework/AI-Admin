interface AppConfig {
  api: {
    baseURL: string
    timeout: number
    headers: Record<string, string>
  }
  app: {
    name: string
    env: 'development' | 'production' | 'test'
  }
}

const env = import.meta.env

export const appConfig: AppConfig = {
  api: {
    baseURL: env.VITE_APP_API_BASE_URL || '/api',
    timeout: Number(env.VITE_APP_API_TIMEOUT) || 10000,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  },
  app: {
    name: env.VITE_APP_NAME || 'foodcloud-admin',
    env: (env.VITE_APP_ENV as AppConfig['app']['env']) || 'development'
  }
}

export function getApiBaseURL(): string {
  return appConfig.api.baseURL
}

export function isDevelopment(): boolean {
  return appConfig.app.env === 'development'
}

export function isProduction(): boolean {
  return appConfig.app.env === 'production'
}

export function isTest(): boolean {
  return appConfig.app.env === 'test'
}
