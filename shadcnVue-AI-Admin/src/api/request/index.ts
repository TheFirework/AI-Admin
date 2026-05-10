export { request } from './request'

export { Core } from './core'
export { Onion } from './onion'

export { buildUrl } from './urls'

export type {
  RequestOptions,
  RequestConfig,
  APIResponse,
} from './types'

export {
  authMiddleware,
  repeatSubmitMiddleware,
  getParamsMiddleware,
  retryMiddleware,
  errorHandlerMiddleware,
  responseHandlerMiddleware,
  validateMiddleware,
} from './middlewares/index'



export { showToast, showSuccessToast, showWarningToast, showErrorToast, showInfoToast } from './utils/toast'
export { showLoading, hideLoading } from './utils/loading'

export {
  loggingMiddleware,
  logRequest,
  logResponse,
  logError,
  getLogs,
  clearLogs
} from './extensions/logging'

export type { LoggingConfig, MonitorConfig } from './extensions/logging'
export { getMonitorConfig, setMonitorConfig, mergeMonitorConfig, reloadConfig } from './extensions/logging'
