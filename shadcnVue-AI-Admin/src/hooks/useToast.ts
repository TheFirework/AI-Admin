import { toast } from 'vue-sonner'

export function useToast() {
  const showToast = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info', duration: number = 3000): void => {
    switch (type) {
      case 'success':
        toast.success(message, { duration })
        break
      case 'warning':
        toast.warning(message, { duration })
        break
      case 'error':
        toast.error(message, { duration })
        break
      case 'info':
      default:
        toast(message, { duration })
        break
    }
  }

  const showErrorToast = (message: string, duration?: number): void => {
    toast.error(message, { duration: duration || 3000 })
  }

  const showSuccessToast = (message: string, duration?: number): void => {
    toast.success(message, { duration: duration || 3000 })
  }

  const showWarningToast = (message: string, duration?: number): void => {
    toast.warning(message, { duration: duration || 3000 })
  }

  const showInfoToast = (message: string, duration?: number): void => {
    toast(message, { duration: duration || 3000 })
  }

  return {
    showToast,
    showErrorToast,
    showSuccessToast,
    showWarningToast,
    showInfoToast
  }
}

export const toastActions = useToast()
