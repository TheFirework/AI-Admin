import type { RequestOptions } from '../../types'
import type { AxiosResponse, AxiosError } from 'axios'
import { getMonitorConfig } from './config'

interface RequestLog {
  timestamp: number
  method: string
  url: string
  params?: Record<string, any>
  data?: any
  statusCode?: number
  responseTime: number
  success: boolean
  error?: string
}

const logs: RequestLog[] = []

function shouldLog(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
  const { logging } = getMonitorConfig()
  if (!logging.enabled) return false

  const levels = ['debug', 'info', 'warn', 'error']
  const currentLevel = levels.indexOf(logging.logLevel)
  const targetLevel = levels.indexOf(level)
  return targetLevel >= currentLevel
}

export function logRequest(options: RequestOptions, startTime: number): void {
  const { logging } = getMonitorConfig()
  if (!logging.enabled || !shouldLog('info')) return

  const logData: Record<string, any> = {
    timestamp: Date.now(),
    method: options.method?.toUpperCase() || 'GET',
    url: options.url
  }

  if (logging.logRequestParams && options.params) {
    logData.params = options.params
  }

  if (logging.logRequestParams && options.data) {
    logData.data = options.data
  }

  console.info('[Request]', logData)
}

export function logResponse(options: RequestOptions, response: AxiosResponse, startTime: number): void {
  const { logging } = getMonitorConfig()
  if (!logging.enabled || !shouldLog('info')) return

  const responseTime = Date.now() - startTime

  const log: RequestLog = {
    timestamp: Date.now(),
    method: options.method?.toUpperCase() || 'GET',
    url: options.url,
    params: logging.logRequestParams ? options.params : undefined,
    data: logging.logRequestParams ? options.data : undefined,
    statusCode: response.status,
    responseTime,
    success: true
  }

  logs.unshift(log)
  if (logs.length > logging.maxLogs) {
    logs.pop()
  }

  const logData: Record<string, any> = {
    method: log.method,
    url: log.url,
    statusCode: log.statusCode,
    responseTime: `${responseTime}ms`
  }

  if (logging.logResponseData) {
    logData.data = response.data
  }

  console.info('[Response]', logData)
}

export function logError(options: RequestOptions, error: AxiosError, startTime: number): void {
  const { logging } = getMonitorConfig()
  if (!logging.enabled || !shouldLog('error')) return

  const responseTime = Date.now() - startTime

  const log: RequestLog = {
    timestamp: Date.now(),
    method: options.method?.toUpperCase() || 'GET',
    url: options.url,
    params: logging.logRequestParams ? options.params : undefined,
    data: logging.logRequestParams ? options.data : undefined,
    statusCode: error.response?.status,
    responseTime,
    success: false,
    error: error.message
  }

  logs.unshift(log)
  if (logs.length > logging.maxLogs) {
    logs.pop()
  }

  console.error('[Request Error]', {
    method: log.method,
    url: log.url,
    statusCode: log.statusCode,
    responseTime: `${responseTime}ms`,
    error: error.message,
    responseData: logging.logResponseData ? error.response?.data : undefined
  })
}

export function getLogs(): RequestLog[] {
  return logs
}

export function clearLogs(): void {
  logs.length = 0
}
