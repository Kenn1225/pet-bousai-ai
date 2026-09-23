export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  data?: unknown
  stack?: string
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs: number = 100
  private isDev: boolean = process.env.NODE_ENV === 'development'

  log(level: LogLevel, message: string, data?: unknown): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    }

    this.logs.push(entry)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    if (this.isDev) {
      const style = this.getLogStyle(level)
      console.log(`%c[${level.toUpperCase()}]`, style, message, data)
    }

    if (level === 'error') {
      this.storeInLocalStorage()
    }
  }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data)
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data)
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data)
  }

  error(message: string, error?: Error | unknown): void {
    const data = error instanceof Error ? { message: error.message, stack: error.stack } : error
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      data,
      stack: error instanceof Error ? error.stack : undefined,
    }
    this.logs.push(entry)
    this.storeInLocalStorage()
  }

  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  clearLogs(): void {
    this.logs = []
    try {
      localStorage.removeItem('_logs')
    } catch (e) {
      // Ignore
    }
  }

  private getLogStyle(level: LogLevel): string {
    const styles: Record<LogLevel, string> = {
      debug: 'color: #888; font-weight: bold;',
      info: 'color: #0066cc; font-weight: bold;',
      warn: 'color: #ff9900; font-weight: bold;',
      error: 'color: #cc0000; font-weight: bold;',
    }
    return styles[level]
  }

  private storeInLocalStorage(): void {
    if (typeof window === 'undefined') return
    try {
      const recentErrors = this.logs.filter(l => l.level === 'error').slice(-10)
      localStorage.setItem('_logs', JSON.stringify(recentErrors))
    } catch (e) {
      // Ignore quota exceeded
    }
  }
}

export const logger = new Logger()
