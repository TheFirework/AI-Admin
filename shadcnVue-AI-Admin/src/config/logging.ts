export interface LoggingConfig {
  enabled?: boolean
  logLevel?: 'debug' | 'info' | 'warn' | 'error'
  maxLogs?: number
  logRequestParams?: boolean
  logResponseData?: boolean
}

export interface LoggingGlobalConfig {
  logging?: LoggingConfig
}

export const loggingConfig: LoggingGlobalConfig = {
  logging: {
    enabled: process.env.NODE_ENV !== 'production',
    logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
    maxLogs: 100,
    logRequestParams: true,
    logResponseData: false
  }
}

export function getLoggingConfig(): LoggingConfig | undefined {
  return loggingConfig.logging
}

export function setLoggingConfig(config: LoggingConfig): void {
  if (loggingConfig.logging) {
    loggingConfig.logging = { ...loggingConfig.logging, ...config }
  } else {
    loggingConfig.logging = config
  }
}

export function mergeLoggingConfig(config: Partial<LoggingConfig>): void {
  if (!loggingConfig.logging) {
    loggingConfig.logging = {}
  }
  loggingConfig.logging = { ...loggingConfig.logging, ...config }
}
