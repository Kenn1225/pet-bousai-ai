import { useCallback } from 'react'
import { getCSRFToken } from '@/lib/csrf'

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>
}

export function useSecureApi() {
  const fetchSecure = useCallback(async (url: string, options: RequestOptions = {}) => {
    const csrfToken = getCSRFToken()
    const headers = {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      ...options.headers,
    }

    return fetch(url, {
      ...options,
      headers,
    })
  }, [])

  return { fetchSecure }
}
