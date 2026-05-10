declare module 'trae' {
  interface Config {
    url: string
    method?: string
    headers?: Record<string, string>
    params?: Record<string, any>
    data?: any
  }

  interface Response<T = any> {
    data: T
    status: number
    statusText: string
    headers: Record<string, string>
    config: Config
  }

  type ResponseError = {
    response?: Response
    message?: string
  }

  interface TraeInstance {
    get<T = any>(url: string, config?: Partial<Config>): Promise<any>
    post<T = any>(url: string, data?: any, config?: Partial<Config>): Promise<any>
    put<T = any>(url: string, data?: any, config?: Partial<Config>): Promise<any>
    ['delete']<T = any>(url: string, config?: Partial<Config>): Promise<any>
    before(callback: (config: Config) => void): void
    after(callback: (response: Response) => void): void
    error(callback: (err: ResponseError) => void): void
  }

  const trae: TraeInstance
  export default trae
}