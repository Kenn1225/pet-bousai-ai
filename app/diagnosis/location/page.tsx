'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { LocationFormData } from '@/lib/locationTypes'
import { PET_MASTER } from '@/lib/petMaster'
import type { PetType } from '@/lib/petMaster'

const PET_TYPES: (keyof typeof PET_MASTER)[] = ['犬', '猫', 'うさぎ', 'ハムスター', 'その他']

export default function LocationDiagnosisPage() {
  const router = useRouter()

  // 認証をバイパス（テスト用）
  useEffect(() => {
    document.cookie = 'pet_auth=test_code; path=/; max-age=31536000'
  }, [])

  const [postalCode, setPostalCode] = useState('')
  const [petType, setPetType] = useState<PetType | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isValid = postalCode.replace(/[^\d]/g, '').length === 7 && petType

  async function handleSubmit(mode: 'free' | 'ai') {
    if (!isValid || !petType) return

    setLoading(true)
    setError(null)

    try {
      const formData: LocationFormData = {
        postalCode: postalCode.replace(/[^\d]/g, ''),
        petType,
      }

      const endpoint = mode === 'free' ? '/api/diagnose-location-free' : '/api/diagnose-location'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? '診断に失敗しました')

      sessionStorage.setItem('locationResult', JSON.stringify(json))
      router.push('/diagnosis/location/result')
    } catch (e) {
      setError(e instanceof Error ? e.message : '診断中にエラーが発生しました')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <p className="text-xs text-amber-600 font-semibold tracking-widest mb-1">郵便番号で診断</p>
          <h1 className="text-2xl font-bold text-gray-800">災害リスク × ペット同行避難</h1>
          <p className="text-xs text-gray-500 mt-2">郵便番号だけで、地域の災害リスクを判定</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              郵便番号 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="123-4567"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-lg font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {postalCode && (
              <p className="mt-2 text-xs text-gray-600">
                入力中... ({postalCode.replace(/[^\d]/g, '').length}/7)
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              ペットの種類 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PET_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setPetType(type)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    petType === type
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {PET_MASTER[type]?.emoji ?? '🐾'} {type}
                </button>
              ))}
            </div>
          </div>

          {petType && (
            <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800">
                <strong>{PET_MASTER[petType]?.shelterStatus}:</strong> {PET_MASTER[petType]?.shelterNote}
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 mb-4">
            ❌ {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => handleSubmit('free')}
            disabled={!isValid || loading}
            className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '処理中…' : '無料版で診断 (0円)'}
          </button>
          <button
            onClick={() => handleSubmit('ai')}
            disabled={!isValid || loading}
            className="flex-1 py-3 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                AI が診断中…
              </span>
            ) : (
              'AI版で診断 ✨'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
