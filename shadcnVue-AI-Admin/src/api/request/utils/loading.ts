import { loadingActions } from '@/hooks/useLoading'
import type { LoadingConfig } from '../types'

const { show, hide } = loadingActions

const defaultLoadingConfig: LoadingConfig = {
  enabled: true,
  delay: 0,
  fullscreen: true
}

let loadingCount = 0
let loadingTimeout: ReturnType<typeof setTimeout> | null = null

export function showLoading(config: LoadingConfig = {}): void {
  const mergedConfig = { ...defaultLoadingConfig, ...config }
  const { delay = 0 } = mergedConfig

  loadingCount++

  if (loadingTimeout) {
    clearTimeout(loadingTimeout)
  }

  loadingTimeout = setTimeout(() => {
    if (loadingCount > 0) {
      show()
    }
  }, delay)
}

export function hideLoading(): void {
  loadingCount--

  if (loadingCount <= 0) {
    loadingCount = 0

    if (loadingTimeout) {
      clearTimeout(loadingTimeout)
      loadingTimeout = null
    }

    hide()
  }
}

export function resetLoading(): void {
  loadingCount = 0

  if (loadingTimeout) {
    clearTimeout(loadingTimeout)
    loadingTimeout = null
  }

  hide()
}
