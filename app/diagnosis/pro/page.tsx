'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { DiagnosisFormData } from '@/lib/types'
import Step1Basic from '@/components/steps/Step1Basic'
import Step2Dog from '@/components/steps/Step2Dog'
import Step3Health from '@/components/steps/Step3Health'
import Step4Behavior from '@/components/steps/Step4Behavior'
import Step5Living from '@/components/steps/Step5Living'
import Step6Disaster from '@/components/steps/Step6Disaster'
import Step7Supplies from '@/components/steps/Step7Supplies'

const STEP_LABELS = ['基本情報', '犬の詳細', '健康状態', '行動特性', '住環境', '災害リスク', '備蓄状況']

const INITIAL: Partial<DiagnosisFormData> = {
  diseases: ['なし'],
  behavior: { strangerReaction: 5, animalReaction: 5, crateComfort: 5, noiseReaction: 5, aloneAbility: 5, stressTolerance: 5 },
  hasCrate: 'ない',
  hasIdTag: 'ない',
  hasMicrochip: 'ない',
  hasFirstAid: 'ない',
  hasMedRecord: 'ない',
}

export default function ProDiagnosisPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)

  // Pass Code 認証チェック
  useEffect(() => {
    const hasCookie = document.cookie.split('; ').some(row => row.startsWith('pet_auth='))
    if (!hasCookie) {
      router.push('/auth?redirect=/diagnosis/pro')
    }
  }, [router])

  const [data, setData] = useState<Partial<DiagnosisFormData>>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [diagnosisMode, setDiagnosisMode] = useState<'free' | 'ai' | null>(null)

  function handleChange(updates: Partial<DiagnosisFormData>) {
    setData(prev => ({ ...prev, ...updates }))
  }

  const hasDog = data.pets?.some(p => p.type === '犬') ?? false
  const totalSteps = hasDog ? 7 : 6

  function effectiveStep() {
    if (!hasDog && step >= 3) return step - 1
    return step
  }

  function nextStep() {
    if (step === 1 && !hasDog) setStep(3)
    else setStep(s => s + 1)
  }

  function prevStep() {
    if (step === 3 && !hasDog) setStep(1)
    else setStep(s => s - 1)
  }

  function isValid(): boolean {
    switch (step) {
      case 1: return !!(data.pets && data.pets.length > 0 && data.age && data.gender && data.neutered)
      case 2: return !!(data.dogSize)
      case 3: return !!(data.diseases && data.diseases.length > 0 && data.medication && data.specialDiet && data.vaccinationStatus)
      case 4: return !!(data.behavior)
      case 5: return !!(data.residenceType && data.floor && data.familySize && data.hasCarOrTransport)
      case 6: return !!(data.postalCode && data.postalCode.length >= 7 && data.riverProximity && data.landslideRisk && data.tsunamiRisk && data.shelterConfirmed && data.disasterTypes && data.disasterTypes.length > 0)
      case 7: return !!(data.foodStock && data.waterStock)
      default: return false
    }
  }

  async function handleSubmit(mode: 'free' | 'ai') {
    setLoading(true)
    setError(null)
    setDiagnosisMode(mode)
    try {
      const endpoint = mode === 'free' ? '/api/diagnose-free' : '/api/diagnose'
      console.log(`[frontend] Starting ${mode} diagnosis...`)
      console.log(`[frontend] Endpoint: ${endpoint}`)

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      console.log(`[frontend] Response status: ${res.status}`)

      const json = await res.json()
      console.log(`[frontend] Response received:`, { hasReport: !!json.report, hasError: !!json.error })

      if (!res.ok) {
        const errorMsg = json.error ?? `HTTP ${res.status}: 診断に失敗しました`
        console.error(`[frontend] API error: ${errorMsg}`)
        throw new Error(errorMsg)
      }

      if (!json.report) {
        console.error('[frontend] No report in response:', json)
        throw new Error('診断結果が空です')
      }

      console.log('[frontend] Storing result and navigating...')
      sessionStorage.setItem('proResult', JSON.stringify(json))
      router.push('/diagnosis/pro/result')
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : '診断中にエラーが発生しました'
      console.error('[frontend] Exception:', errorMsg)
      setError(errorMsg)
      setLoading(false)
    }
  }

  const progress = (effectiveStep() / totalSteps) * 100
  const currentLabel = STEP_LABELS[step - 1] ?? ''

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <p className="text-xs text-violet-600 font-semibold tracking-widest mb-1">AI 診断 完全版 PRO</p>
          <h1 className="text-xl font-bold text-gray-800">うちの子専用防災メソッド</h1>
          <p className="text-xs text-gray-400 mt-1">22種のペット対応 · 18疾患 · 9つの自然災害を個別診断</p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>STEP {effectiveStep()} / {totalSteps}</span>
            <span>{currentLabel}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-violet-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-base font-bold text-gray-800 mb-4">{currentLabel}について教えてください</h2>
          {step === 1 && <Step1Basic data={data} onChange={handleChange} />}
          {step === 2 && hasDog && <Step2Dog data={data} onChange={handleChange} />}
          {step === 3 && <Step3Health data={data} onChange={handleChange} />}
          {step === 4 && <Step4Behavior data={data} onChange={handleChange} />}
          {step === 5 && <Step5Living data={data} onChange={handleChange} />}
          {step === 6 && <Step6Disaster data={data} onChange={handleChange} />}
          {step === 7 && <Step7Supplies data={data} onChange={handleChange} />}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 mb-4">❌ {error}</div>
        )}

        <div className="flex gap-3">
          {step > 1 && (
            <button type="button" onClick={prevStep}
              className="flex-1 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              ← 戻る
            </button>
          )}
          {step < 7 ? (
            <button type="button" onClick={nextStep} disabled={!isValid()}
              className="flex-1 py-3 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              次へ →
            </button>
          ) : (
            <button type="button" onClick={() => handleSubmit('free')} disabled={!isValid() || loading}
              className="w-full py-3 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              {loading ? '処理中…' : '診断する'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
