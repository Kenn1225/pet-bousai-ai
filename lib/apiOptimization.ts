export class RateLimiter {
  private calls: number[] = []
  private maxCalls: number
  private timeWindowMs: number

  constructor(maxCalls: number = 10, timeWindowMs: number = 60000) {
    this.maxCalls = maxCalls
    this.timeWindowMs = timeWindowMs
  }

  isAllowed(): boolean {
    const now = Date.now()
    this.calls = this.calls.filter(time => now - time < this.timeWindowMs)

    if (this.calls.length < this.maxCalls) {
      this.calls.push(now)
      return true
    }

    return false
  }

  getRetryAfter(): number {
    if (this.calls.length === 0) return 0
    const oldestCall = Math.min(...this.calls)
    return Math.max(0, this.timeWindowMs - (Date.now() - oldestCall))
  }

  reset(): void {
    this.calls = []
  }
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  backoffMs: number = 1000
): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options)

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After')
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : backoffMs * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }

      if (!response.ok && attempt < maxRetries) {
        const delay = backoffMs * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }

      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      if (attempt < maxRetries) {
        const delay = backoffMs * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error('Max retries exceeded')
}

export function requestDebounce<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delayMs: number = 300
): T {
  let timeoutId: NodeJS.Timeout | null = null

  return ((...args: any[]) => {
    return new Promise((resolve, reject) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(async () => {
        try {
          const result = await fn(...args)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }, delayMs)
    })
  }) as T
}
