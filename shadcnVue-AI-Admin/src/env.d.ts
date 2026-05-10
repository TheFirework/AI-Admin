/// <reference types="vite/client" />

/**
 * Vite 环境变量类型声明
 *
 * 所有以 VITE_APP_ 开头的环境变量都会被自动加载
 * 在代码中通过 import.meta.env 访问
 *
 * @example
 * const apiUrl = import.meta.env.VITE_APP_API_BASE_URL
 * const appName = import.meta.env.VITE_APP_NAME
 */
interface ImportMetaEnv {
  /** API 基础地址 */
  readonly VITE_APP_API_BASE_URL: string

  /** 应用名称 */
  readonly VITE_APP_NAME: string

  /** 当前环境 */
  readonly VITE_APP_ENV: 'development' | 'production' | 'test'

  /** 是否启用 Mock 数据 */
  readonly VITE_APP_ENABLE_MOCK?: string

  /** 是否开启调试模式 */
  readonly VITE_APP_DEBUG?: string
}

interface ImportMeta {
  /**
   * 环境变量对象
   *
   * 通过类型声明，TypeScript 可以提供代码提示和类型检查
   * 避免拼写错误和类型错误
   */
  readonly env: ImportMetaEnv
}
