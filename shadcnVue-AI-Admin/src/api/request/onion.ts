
// 将类型定义内联到当前文件中，避免依赖外部types模块

interface OnionContext {
  [key: string]: unknown
}

type OnionMiddleware = (
  ctx: OnionContext,
  next: () => Promise<void>
) => Promise<void>

export class Onion {
  private middlewares: OnionMiddleware[] = []
  private globalMiddlewares: OnionMiddleware[] = []
  private coreMiddlewares: OnionMiddleware[] = []

  use(middleware: OnionMiddleware): void {
    this.middlewares.push(middleware)
  }

  useGlobal(middleware: OnionMiddleware): void {
    this.globalMiddlewares.push(middleware)
  }

  useCoreMiddleware(middleware: OnionMiddleware): void {
    this.coreMiddlewares.push(middleware)
  }

  async execute(ctx: OnionContext, next: () => Promise<void>): Promise<void> {
    const allMiddlewares = [
      ...this.globalMiddlewares,
      ...this.middlewares,
      ...this.coreMiddlewares
    ]

    let index = -1

    const dispatch = async (i: number): Promise<void> => {
      if (i <= index) {
        throw new Error('next() called multiple times')
      }
      index = i

      const middleware = allMiddlewares[i]
      if (middleware) {
        await middleware(ctx, () => dispatch(i + 1))
      } else {
        await next()
      }
    }

    await dispatch(0)
  }
}
