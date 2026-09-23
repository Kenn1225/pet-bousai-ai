'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getHistoryFromStorage, deleteHistoryEntry, clearAllHistory, formatDate } from '@/lib/diagnosisHistory'
import type { DiagnosisHistoryEntry } from '@/lib/diagnosisHistory'

export default function HistoryPage() {
  const router = useRouter()
  const [history, setHistory] = useState<DiagnosisHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const hasCookie = document.cookie.split('; ').some(row => row.startsWith('pet_auth='))
    if (!hasCookie) {
      router.push('/auth?redirect=/diagnosis/history')
      return
    }

    setHistory(getHistoryFromStorage())
    setLoading(false)
  }, [router])

  const handleDelete = (id: string) => {
    if (confirm('この診断結果を削除しますか？')) {
      deleteHistoryEntry(id)
      setHistory(getHistoryFromStorage())
    }
  }

  const handleClearAll = () => {
    if (confirm('すべての診断履歴を削除しますか？この操作は取り消せません。')) {
      clearAllHistory()
      setHistory([])
    }
  }

  const handleViewResult = (entry: DiagnosisHistoryEntry) => {
    sessionStorage.setItem('diagnosisResult', JSON.stringify({ report: entry.report, scores: (entry.report as any).scores }))
    router.push('/diagnosis/result')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-gray-500 text-sm">読み込み中…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <p className="text-xs text-emerald-600 font-semibold tracking-widest mb-1">診断履歴</p>
          <h1 className="text-2xl font-bold text-gray-800">過去の診断結果</h1>
          <p className="text-xs text-gray-500 mt-2">最大20件を保存しています</p>
        </div>

        {history.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="text-4xl mb-3">📋</div>
            <h2 className="text-gray-800 font-semibold mb-1">診断履歴がありません</h2>
            <p className="text-xs text-gray-500 mb-4">
              診断を実行すると、ここに履歴が表示されます
            </p>
            <Link href="/diagnosis"
              className="inline-block px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors"
            >
              診断を開始 →
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {history.map(entry => (
                <div key={entry.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">
                          {entry.diagnosisType === 'free' ? '🐾' : entry.diagnosisType === 'pro' ? '👑' : '📍'}
                        </span>
                        <span className="text-sm font-bold text-gray-800">{entry.petName || 'ペット'}</span>
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">
                          {entry.diagnosisType === 'free' ? '簡易版' : entry.diagnosisType === 'pro' ? 'PRO版' : '地域診断'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{entry.summary}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="text-lg font-bold text-emerald-600">{entry.score}</div>
                      <div className="text-xs text-gray-400">{formatDate(entry.timestamp)}</div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleViewResult(entry)}
                      className="flex-1 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors"
                    >
                      詳細を見る
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={handleClearAll}
                className="text-xs text-red-600 underline hover:text-red-700"
              >
                すべての履歴を削除
              </button>
            </div>
          </>
        )}

        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <Link href="/diagnosis"
            className="inline-block px-6 py-3 border border-emerald-400 text-emerald-600 rounded-xl text-sm font-semibold hover:bg-emerald-50 transition-colors"
          >
            新しく診断する →
          </Link>
        </div>
      </div>
    </div>
  )
}
