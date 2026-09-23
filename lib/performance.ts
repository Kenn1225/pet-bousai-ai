export interface PerformanceMetrics {
  navigationStart: number
  domContentLoaded: number
  loadComplete: number
  firstPaint?: number
  firstContentfulPaint?: number
  largestContentfulPaint?: number
  cumulativeLayoutShift?: number
}

export class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {}

  constructor() {
    if (typeof window !== 'undefined') {
      this.collectMetrics()
    }
  }

  private collectMetrics(): void {
    if (!window.performance) return

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigation) {
      this.metrics.navigationStart = navigation.startTime
      this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.startTime
      this.metrics.loadComplete = navigation.loadEventEnd - navigation.startTime
    }

    // Core Web Vitals
    const paintEntries = performance.getEntriesByType('paint')
    paintEntries.forEach(entry => {
      if (entry.name === 'first-paint') {
        this.metrics.firstPaint = entry.startTime
      } else if (entry.name === 'first-contentful-paint') {
        this.metrics.firstContentfulPaint = entry.startTime
      }
    })

    // Observe LCP and CLS
    if ('PerformanceObserver' in window) {
      this.observeLCP()
      this.observeCLS()
    }
  }

  private observeLCP(): void {
    try {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.metrics.largestContentfulPaint = lastEntry.startTime
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (e) {
      // Ignore
    }
  }

  private observeCLS(): void {
    try {
      let clsValue = 0
      const observer = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          if ((entry as any).hadRecentInput) return
          clsValue += (entry as any).value
        })
        this.metrics.cumulativeLayoutShift = clsValue
      })
      observer.observe({ entryTypes: ['layout-shift'] })
    } catch (e) {
      // Ignore
    }
  }

  getMetrics(): PerformanceMetrics {
    return this.metrics as PerformanceMetrics
  }

  logMetrics(): void {
    const metrics = this.getMetrics()
    console.table({
      'DOM Content Loaded': `${metrics.domContentLoaded?.toFixed(2)}ms`,
      'Page Load Complete': `${metrics.loadComplete?.toFixed(2)}ms`,
      'First Paint': `${metrics.firstPaint?.toFixed(2)}ms`,
      'First Contentful Paint': `${metrics.firstContentfulPaint?.toFixed(2)}ms`,
      'Largest Contentful Paint': `${metrics.largestContentfulPaint?.toFixed(2)}ms`,
      'Cumulative Layout Shift': metrics.cumulativeLayoutShift?.toFixed(3),
    })
  }
}

export const performanceMonitor = new PerformanceMonitor()
