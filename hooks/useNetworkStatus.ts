import { useEffect, useState } from 'react'

export interface NetworkStatus {
  online: boolean
  downlink?: number
  rtt?: number
  saveData?: boolean
  effectiveType?: '4g' | '3g' | '2g' | 'slow-2g'
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(() => {
    if (typeof window === 'undefined') return { online: true }

    return {
      online: navigator.onLine,
      downlink: (navigator as any).connection?.downlink,
      rtt: (navigator as any).connection?.rtt,
      saveData: (navigator as any).connection?.saveData,
      effectiveType: (navigator as any).connection?.effectiveType,
    }
  })

  useEffect(() => {
    const handleOnline = () => setStatus(prev => ({ ...prev, online: true }))
    const handleOffline = () => setStatus(prev => ({ ...prev, online: false }))
    const handleChange = () => {
      const conn = (navigator as any).connection
      if (conn) {
        setStatus({
          online: navigator.onLine,
          downlink: conn.downlink,
          rtt: conn.rtt,
          saveData: conn.saveData,
          effectiveType: conn.effectiveType,
        })
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    ;(navigator as any).connection?.addEventListener('change', handleChange)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      ;(navigator as any).connection?.removeEventListener('change', handleChange)
    }
  }, [])

  return status
}
