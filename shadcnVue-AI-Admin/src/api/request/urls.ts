export function buildUrl(url: string, params: Record<string, string | number> = {}): string {
  return url.replace(/:(\w+)/g, (_, key) => {
    const value = params[key]
    if (value === undefined || value === null) {
      throw new Error(`Missing parameter: ${key}`)
    }
    return String(value)
  })
}
