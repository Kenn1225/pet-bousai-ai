export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

const toastQueue: Toast[] = []
const listeners = new Set<(toasts: Toast[]) => void>()

export function showToast(
  message: string,
  type: ToastType = 'info',
  duration: number = 3000,
  action?: { label: string; onClick: () => void }
): string {
  const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const toast: Toast = { id, message, type, duration, action }
  toastQueue.push(toast)
  notifyListeners()

  if (duration > 0) {
    setTimeout(() => removeToast(id), duration)
  }

  return id
}

export function removeToast(id: string): void {
  const index = toastQueue.findIndex(t => t.id === id)
  if (index !== -1) {
    toastQueue.splice(index, 1)
    notifyListeners()
  }
}

export function subscribeToToasts(callback: (toasts: Toast[]) => void): () => void {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

function notifyListeners(): void {
  listeners.forEach(callback => callback([...toastQueue]))
}

export const toast = {
  success: (message: string, duration?: number) =>
    showToast(message, 'success', duration),
  error: (message: string, duration?: number) =>
    showToast(message, 'error', duration),
  info: (message: string, duration?: number) =>
    showToast(message, 'info', duration),
  warning: (message: string, duration?: number) =>
    showToast(message, 'warning', duration),
}
