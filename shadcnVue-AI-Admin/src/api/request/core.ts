import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError, type Method } from 'axios'
import type { OnionMiddleware, RequestOptions, RequestConfig } from './types.ts'
import { Onion } from './onion'

export class Core {
  private axiosInstance: AxiosInstance
  private onion: Onion
  private defaultConfig: RequestConfig

  constructor(config: RequestConfig = {}) {
    this.defaultConfig = {
      ...config
    }

    this.axiosInstance = axios.create(this.defaultConfig)
    this.onion = new Onion()

    this.initDefaultMiddlewares()
  }

  private initDefaultMiddlewares() {
    this.onion.useCoreMiddleware(async (ctx, next) => {
      const defaultConfigWithMethod = { ...this.defaultConfig, method: 'get' as Method }
        ; (ctx.req as any).config = { ...defaultConfigWithMethod, ...(ctx.req as any).config }
      await next()
    })

    this.onion.useCoreMiddleware(async (ctx, next) => {
      try {
        await next()
      } catch (error) {
        ctx.error = error as AxiosError
        throw error
      }
    })
  }

  use(middleware: OnionMiddleware): void {
    this.onion.use(middleware as any)
  }

  useGlobal(middleware: OnionMiddleware): void {
    this.onion.useGlobal(middleware as any)
  }

  useCore(middleware: OnionMiddleware): void {
    this.onion.useCoreMiddleware(middleware as any)
  }

  setBaseURL(baseURL: string): void {
    this.defaultConfig.baseURL = baseURL
    if (this.axiosInstance) {
      this.axiosInstance.defaults.baseURL = baseURL
    }
  }

  getBaseURL(): string {
    return this.defaultConfig.baseURL || ''
  }

  async request<T = any>(options: RequestOptions): Promise<T> {
    const ctx = {
      req: { config: { ...options } },
      res: null as AxiosResponse | null,
      error: null as AxiosError | null
    }

    await this.onion.execute(ctx, async () => {
      const { url, method = 'get' as Method, data, params, headers, returnOriginal, ...config } = ctx.req.config

      const axiosConfig: AxiosRequestConfig = {
        url,
        method,
        data,
        params,
        headers: { ...this.defaultConfig.headers, ...headers },
        ...config
      }

      ctx.res = await this.axiosInstance.request(axiosConfig)
    })

    const { returnOriginal = false } = options

    return returnOriginal ? ctx.res as T : ctx.res?.data as T
  }

  get axios(): AxiosInstance {
    return this.axiosInstance
  }
}
