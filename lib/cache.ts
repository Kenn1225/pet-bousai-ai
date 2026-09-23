const CACHE_PREFIX = 'pet_bousai_'
const DEFAULT_TTL = 5 * 60 * 1000 // 5分

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

export function setCache<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
  if (typeof window === 'undefined') return

  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    ttl,
  }

  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry))
  } catch (e) {
    console.warn('Cache write failed:', e)
  }
}

export function getCache<T>(key: string): T | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(CACHE_PREFIX + key)
    if (!stored) return null

    const entry: CacheEntry<T> = JSON.parse(stored)
    const isExpired = Date.now() - entry.timestamp > entry.ttl

    if (isExpired) {
      localStorage.removeItem(CACHE_PREFIX + key)
      return null
    }

    return entry.data
  } catch (e) {
    console.warn('Cache read failed:', e)
    return null
  }
}

export function clearCache(key?: string): void {
  if (typeof window === 'undefined') return

  if (key) {
    localStorage.removeItem(CACHE_PREFIX + key)
  } else {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(k)
      }
    })
  }
}

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): () => Promise<T> {
  return async () => {
    const cached = getCache<T>(key)
    if (cached) return cached

    const data = await fetcher()
    setCache(key, data, ttl)
    return data
  }
}
