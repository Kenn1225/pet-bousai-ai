'use client'

import { useEffect, useState } from 'react'
import { subscribeToToasts, removeToast } from '@/lib/toast'
import type { Toast } from '@/lib/toast'

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const unsubscribe = subscribeToToasts(setToasts)
    return unsubscribe
  }, [])

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'info':
      default:
        return 'ℹ️'
    }
  }

  const getColors = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-sm z-50 pointer-events-none space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`${getColors(
            toast.type
          )} border rounded-lg shadow-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4 pointer-events-auto`}
          role="alert"
        >
          <span className="text-xl flex-shrink-0">{getIcon(toast.type)}</span>
          <div className="flex-1">
            <p className="text-sm font-medium">{toast.message}</p>
            {toast.action && (
              <button
                onClick={() => {
                  toast.action!.onClick()
                  removeToast(toast.id)
                }}
                className="text-xs font-semibold underline mt-1 hover:opacity-80"
              >
                {toast.action.label}
              </button>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-xl flex-shrink-0 opacity-50 hover:opacity-100"
            aria-label="通知を閉じる"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
