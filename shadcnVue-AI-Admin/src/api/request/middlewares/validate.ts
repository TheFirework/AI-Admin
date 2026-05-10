import type { OnionMiddleware } from '../types'

interface ValidationError extends Error {
  code: string
  field: string
}

function createValidationError(field: string, message: string): ValidationError {
  const error = new Error(message) as ValidationError
  error.code = 'VALIDATION_ERROR'
  error.field = field
  return error
}

export const validateMiddleware: OnionMiddleware = async (ctx, next) => {
  const { config } = ctx.req

  if (!config.url) {
    throw createValidationError('url', '请求 URL 不能为空')
  }

  if (typeof config.url !== 'string') {
    throw createValidationError('url', '请求 URL 必须是字符串类型')
  }

  if (config.url.trim() === '') {
    throw createValidationError('url', '请求 URL 不能为空字符串')
  }

  if (config.method && !['get', 'post', 'put', 'delete', 'patch', 'head', 'options', 'trace'].includes(config.method.toLowerCase())) {
    throw createValidationError('method', `不支持的 HTTP 方法: ${config.method}`)
  }

  if (config.timeout !== undefined && typeof config.timeout !== 'number') {
    throw createValidationError('timeout', 'timeout 必须是数字类型')
  }

  if (config.timeout !== undefined && config.timeout <= 0) {
    throw createValidationError('timeout', 'timeout 必须大于 0')
  }

  if (config.params && typeof config.params !== 'object') {
    throw createValidationError('params', 'params 必须是对象类型')
  }

  if (config.data !== undefined && config.data !== null && typeof config.data !== 'object') {
    throw createValidationError('data', 'data 必须是对象类型')
  }

  if (config.headers !== undefined && typeof config.headers !== 'object') {
    throw createValidationError('headers', 'headers 必须是对象类型')
  }

  await next()
}
