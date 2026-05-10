declare module 'mockjs' {
  interface Random {
    pick<T>(arr: T[]): T
    integer(min: number, max: number): number
    datetime(format?: string): string
  }

  interface MockStatic {
    mock<T>(template: object): T
    Random: Random
  }

  const Mock: MockStatic
  export default Mock
}
