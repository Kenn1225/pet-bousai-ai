export interface DiagnosisHistoryEntry {
  id: string
  timestamp: number
  diagnosisType: 'free' | 'pro' | 'location'
  petName?: string
  petType: string
  summary: string
  score: number
  report: unknown
}

const STORAGE_KEY = 'pet_bousai_history'
const MAX_ENTRIES = 20

export function saveDiagnosisToHistory(
  diagnosisType: 'free' | 'pro' | 'location',
  report: unknown,
  petName?: string,
  petType?: string
): DiagnosisHistoryEntry {
  const entry: DiagnosisHistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    diagnosisType,
    petName,
    petType: petType || '不明',
    summary: (report as any)?.summary?.catchCopy || '診断結果',
    score: (report as any)?.scores?.overall || 0,
    report,
  }

  if (typeof window === 'undefined') return entry

  try {
    const existing = getHistoryFromStorage()
    const updated = [entry, ...existing].slice(0, MAX_ENTRIES)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (e) {
    console.warn('Failed to save diagnosis history:', e)
  }

  return entry
}

export function getHistoryFromStorage(): DiagnosisHistoryEntry[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.warn('Failed to read diagnosis history:', e)
    return []
  }
}

export function deleteHistoryEntry(id: string): void {
  if (typeof window === 'undefined') return

  try {
    const existing = getHistoryFromStorage()
    const updated = existing.filter(e => e.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (e) {
    console.warn('Failed to delete history entry:', e)
  }
}

export function clearAllHistory(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    console.warn('Failed to clear history:', e)
  }
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  ) {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  } else if (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  ) {
    return '昨日'
  } else {
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
  }
}
