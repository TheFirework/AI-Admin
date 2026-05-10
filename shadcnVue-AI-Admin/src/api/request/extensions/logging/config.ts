import { getLoggingConfig as getGlobalLoggingConfig } from '../../../../config/logging'

export interface LoggingConfig {
  enabled: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  maxLogs: number
  logRequestParams: boolean
  logResponseData: boolean
}

export interface MonitorConfig {
  logging: LoggingConfig
}

const defaultLoggingConfig: LoggingConfig = {
  enabled: true,
  logLevel: 'info',
  maxLogs: 100,
  logRequestParams: true,
  logResponseData: true
}

function getMergedConfig(): MonitorConfig {
  const globalConfig = getGlobalLoggingConfig()
  
  return {
    logging: {
      ...defaultLoggingConfig,
      ...globalConfig
    }
  }
}

export const defaultMonitorConfig: MonitorConfig = getMergedConfig()

let currentConfig = { ...defaultMonitorConfig }

export function getMonitorConfig(): MonitorConfig {
  return currentConfig
}

export function setMonitorConfig(config: Partial<MonitorConfig>): void {
  currentConfig = {
    ...currentConfig,
    logging: { ...currentConfig.logging, ...config.logging }
  }
}

export function mergeMonitorConfig(config: Partial<MonitorConfig>): void {
  setMonitorConfig(config)
}

export function reloadConfig(): void {
  currentConfig = getMergedConfig()
}
