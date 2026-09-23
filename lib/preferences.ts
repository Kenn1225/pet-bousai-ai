export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: 'ja' | 'en'
  fontSize: 'sm' | 'md' | 'lg'
  soundEnabled: boolean
  notificationsEnabled: boolean
  compactMode: boolean
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'auto',
  language: 'ja',
  fontSize: 'md',
  soundEnabled: true,
  notificationsEnabled: true,
  compactMode: false,
}

const STORAGE_KEY = 'user_preferences'

export class PreferenceManager {
  private preferences: UserPreferences

  constructor() {
    this.preferences = this.loadPreferences()
  }

  loadPreferences(): UserPreferences {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) }
      }
    } catch (e) {
      console.warn('Failed to load preferences:', e)
    }

    return DEFAULT_PREFERENCES
  }

  savePreferences(partial: Partial<UserPreferences>): void {
    this.preferences = { ...this.preferences, ...partial }

    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.preferences))
    } catch (e) {
      console.warn('Failed to save preferences:', e)
    }
  }

  getPreferences(): UserPreferences {
    return { ...this.preferences }
  }

  getSingle<K extends keyof UserPreferences>(key: K): UserPreferences[K] {
    return this.preferences[key]
  }

  setSingle<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]): void {
    this.savePreferences({ [key]: value } as Partial<UserPreferences>)
  }

  reset(): void {
    this.preferences = DEFAULT_PREFERENCES

    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      console.warn('Failed to reset preferences:', e)
    }
  }
}

export const preferences = new PreferenceManager()
