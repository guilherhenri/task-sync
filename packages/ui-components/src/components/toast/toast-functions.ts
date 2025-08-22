import type { ToastData } from '.'

let toastFunction: ((toast: Omit<ToastData, 'id'>) => void) | null = null

export const setToastFunction = (
  fn: (toast: Omit<ToastData, 'id'>) => void,
) => {
  toastFunction = fn
}

export const toast = {
  success: (message: string, duration?: number) => {
    if (toastFunction) {
      toastFunction({ message, type: 'success', duration })
    }
  },
  error: (message: string, duration?: number) => {
    if (toastFunction) {
      toastFunction({ message, type: 'error', duration })
    }
  },
  warning: (message: string, duration?: number) => {
    if (toastFunction) {
      toastFunction({ message, type: 'warning', duration })
    }
  },
  show: (message: string, type?: ToastData['type'], duration?: number) => {
    if (toastFunction) {
      toastFunction({ message, type, duration })
    }
  },
}
