export interface AnalyticsEvent {
  name: string
  category: string
  value?: number
  label?: string
  timestamp: number
}

export class Analytics {
  private events: AnalyticsEvent[] = []
  private sessionId: string
  private userId?: string

  constructor() {
    this.sessionId = this.generateId()
    this.loadUserId()
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private loadUserId(): void {
    if (typeof window === 'undefined') return
    try {
      this.userId = localStorage.getItem('analytics_user_id') || undefined
      if (!this.userId) {
        this.userId = this.generateId()
        localStorage.setItem('analytics_user_id', this.userId)
      }
    } catch (e) {
      // Ignore
    }
  }

  track(name: string, category: string, value?: number, label?: string): void {
    const event: AnalyticsEvent = {
      name,
      category,
      value,
      label,
      timestamp: Date.now(),
    }

    this.events.push(event)

    if (this.events.length > 100) {
      this.events.shift()
    }

    this.sendEvent(event)
  }

  trackPageView(path: string, title?: string): void {
    this.track('page_view', 'navigation', undefined, `${path}:${title || ''}`)
  }

  trackDiagnosis(type: string, duration: number): void {
    this.track('diagnosis_completed', 'engagement', duration, type)
  }

  trackError(errorMessage: string, errorType?: string): void {
    this.track('error', 'error', undefined, `${errorType || 'unknown'}:${errorMessage}`)
  }

  private sendEvent(event: AnalyticsEvent): void {
    if (typeof window === 'undefined') return
    if (!navigator.onLine) return

    const payload = {
      ...event,
      sessionId: this.sessionId,
      userId: this.userId,
      userAgent: navigator.userAgent,
      url: window.location.href,
    }

    try {
      navigator.sendBeacon('/api/analytics', JSON.stringify(payload))
    } catch (e) {
      console.warn('Failed to send analytics:', e)
    }
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events]
  }

  getSessionId(): string {
    return this.sessionId
  }
}

export const analytics = new Analytics()
