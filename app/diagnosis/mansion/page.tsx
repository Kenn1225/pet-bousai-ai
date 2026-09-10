'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type {
  MansionDiagnosisFormData, MansionPetType, PetWeightClass, CarrierFamiliarity,
  ElevatorCount, ElevatorEmergencyOp, StairsKnowledge, PracticeExperience, YesNoUnknown,
  HomeEvacuationPlan, SupplyStock, ToiletPrep,
} from '@/lib/mansionTypes'

const STEP_LABELS = ['住居情報', 'ペット情報', '避難手段の準備', '建物・管理組合の備え', '在宅避難・備蓄']
const TOTAL_STEPS = 5

type MansionFormState = Partial<MansionDiagnosisFormData>

function Btn({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={`w-full text-left py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
        selected ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-gray-200 bg-white text-gray-700 active:bg-gray-50'
      }`}>
      {children}
    </button>
  )
}

function Toggle2({ value, onChange, options }: { value?: string; onChange: (v: string) => void; options: [string, string] }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map(v => (
        <button key={v} type="button" onClick={() => onChange(v)}
          className={`py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
            value === v ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-gray-200 bg-white text-gray-600'
          }`}>
          {v}
        </button>
      ))}
    </div>
  )
}

export default function MansionDiagnosisPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<MansionFormState>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof MansionDiagnosisFormData>(key: K, value: MansionDiagnosisFormData[K]) {
    setData(prev => ({ ...prev, [key]: value }))
  }

  function isValid(): boolean {
    switch (step) {
      case 1: return !!(data.floor && data.floor >= 5 && data.floor <= 60 && data.elevatorCount && data.elevatorEmergencyOp)
      case 2: return !!(data.petType && data.weightClass && data.carrierFamiliarity)
      case 3: return !!(data.stairsKnowledge && data.hasEvacuationCarrier && data.practiceExperience && data.hasLightSource)
      case 4: return !!(data.managementPetPlan && data.drillParticipation && data.autoLockKnowledge && data.waterPumpRisk)
      case 5: return !!(data.evacuationPlan && data.waterFoodStock && data.toiletPrep && data.furnitureFixed)
      default: return false
    }
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/diagnose-mansion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? '診断に失敗しました')
      sessionStorage.setItem('mansionDiagnosisResult', JSON.stringify(json))
      router.push('/diagnosis/mansion/result')
    } catch (e) {
      setError(e instanceof Error ? e.message : '診断中にエラーが発生しました')
      setLoading(false)
    }
  }

  const progress = (step / TOTAL_STEPS) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <p className="text-xs text-sky-600 font-semibold tracking-widest mb-1">無料・即時診断</p>
          <h1 className="text-xl font-black text-gray-900">マンション避難チェック診断</h1>
          <p className="text-xs text-gray-400 mt-1">5階建て〜60階建てまで、階数に応じたペット同行避難をAIが診断します</p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>STEP {step} / {TOTAL_STEPS}</span>
            <span>{STEP_LABELS[step - 1]}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-sky-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-base font-bold text-gray-800 mb-4">{STEP_LABELS[step - 1]}</h2>

          {/* STEP1: 住居情報 */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  居住階（5〜60階） <span className="text-red-500">*</span>
                </label>
                <input type="number" min={5} max={60} placeholder="例：23"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  value={data.floor ?? ''}
                  onChange={e => set('floor', e.target.value ? Number(e.target.value) : (undefined as unknown as number))} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">建物の総階数（任意）</label>
                <input type="number" min={1} placeholder="例：45"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  value={data.totalFloors ?? ''}
                  onChange={e => set('totalFloors', e.target.value ? Number(e.target.value) : undefined)} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  エレベーター基数 <span className="text-red-500">*</span>
                </label>
                <Toggle2 value={data.elevatorCount} onChange={v => set('elevatorCount', v as ElevatorCount)}
                  options={['1基のみ', '複数基']} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  地震時の管理運転（管理人によるエレベーター対応） <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {(['対応している（管理人常駐等）', '対応していない', 'わからない'] as ElevatorEmergencyOp[]).map(v => (
                    <Btn key={v} selected={data.elevatorEmergencyOp === v} onClick={() => set('elevatorEmergencyOp', v)}>{v}</Btn>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP2: ペット情報 */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">ペットのニックネーム（任意）</label>
                <input type="text" placeholder="例：ポチ、みかん…" maxLength={20}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  value={data.petName ?? ''}
                  onChange={e => set('petName', e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  種類 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([{ v: '犬', emoji: '🐕' }, { v: '猫', emoji: '🐈' }, { v: 'その他小動物', emoji: '🐾' }] as { v: MansionPetType; emoji: string }[]).map(({ v, emoji }) => (
                    <button key={v} type="button" onClick={() => set('petType', v)}
                      className={`py-3 rounded-xl border-2 text-center text-xs font-medium transition-all ${
                        data.petType === v ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-gray-200 bg-white text-gray-600'
                      }`}>
                      <div className="text-xl mb-1">{emoji}</div>{v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  体重区分（階段避難時に抱えられるかの目安） <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['〜3kg', '3〜10kg', '10〜25kg', '25kg以上'] as PetWeightClass[]).map(v => (
                    <button key={v} type="button" onClick={() => set('weightClass', v)}
                      className={`py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        data.weightClass === v ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-gray-200 bg-white text-gray-600'
                      }`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  キャリー・カートへの慣れ <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {(['慣れている', 'あまり慣れていない', '全く慣れていない'] as CarrierFamiliarity[]).map(v => (
                    <Btn key={v} selected={data.carrierFamiliarity === v} onClick={() => set('carrierFamiliarity', v)}>{v}</Btn>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP3: 避難手段の準備 */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  非常階段の場所の把握 <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {(['把握している', 'なんとなく知っている', '知らない'] as StairsKnowledge[]).map(v => (
                    <Btn key={v} selected={data.stairsKnowledge === v} onClick={() => set('stairsKnowledge', v)}>{v}</Btn>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  避難用キャリー・抱っこひも・スリング <span className="text-red-500">*</span>
                </label>
                <Toggle2 value={data.hasEvacuationCarrier} onChange={v => set('hasEvacuationCarrier', v as 'ある' | 'ない')}
                  options={['ある', 'ない']} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  非常階段での避難練習の経験 <span className="text-red-500">*</span>
                </label>
                <Toggle2 value={data.practiceExperience} onChange={v => set('practiceExperience', v as PracticeExperience)}
                  options={['ある', 'ない']} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  停電時の光源（懐中電灯・ヘッドライト等） <span className="text-red-500">*</span>
                </label>
                <Toggle2 value={data.hasLightSource} onChange={v => set('hasLightSource', v as 'ある' | 'ない')}
                  options={['ある', 'ない']} />
              </div>
            </div>
          )}

          {/* STEP4: 建物・管理組合の備え */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  管理組合の防災マニュアルにペット同行避難の記載 <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {(['ある', 'ない', 'わからない'] as YesNoUnknown[]).map(v => (
                    <Btn key={v} selected={data.managementPetPlan === v} onClick={() => set('managementPetPlan', v)}>{v}</Btn>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  マンションの防災訓練への参加経験 <span className="text-red-500">*</span>
                </label>
                <Toggle2 value={data.drillParticipation} onChange={v => set('drillParticipation', v as PracticeExperience)}
                  options={['ある', 'ない']} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  停電時のオートロック対応の把握 <span className="text-red-500">*</span>
                </label>
                <Toggle2 value={data.autoLockKnowledge} onChange={v => set('autoLockKnowledge', v as '知っている' | '知らない')}
                  options={['知っている', '知らない']} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  給水ポンプ停止（断水）リスクの認識 <span className="text-red-500">*</span>
                </label>
                <Toggle2 value={data.waterPumpRisk} onChange={v => set('waterPumpRisk', v as '知っている' | '知らない')}
                  options={['知っている', '知らない']} />
              </div>
            </div>
          )}

          {/* STEP5: 在宅避難・備蓄 */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  避難方針 <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {(['在宅避難する予定', '避難所に行く予定', '未定'] as HomeEvacuationPlan[]).map(v => (
                    <Btn key={v} selected={data.evacuationPlan === v} onClick={() => set('evacuationPlan', v)}>{v}</Btn>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  水・フードの備蓄 <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {(['なし', '3日未満', '3〜7日分', '1〜2週間分', '2週間以上'] as SupplyStock[]).map(v => (
                    <Btn key={v} selected={data.waterFoodStock === v} onClick={() => set('waterFoodStock', v)}>{v}</Btn>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  断水時のトイレ対策（携帯トイレ等） <span className="text-red-500">*</span>
                </label>
                <Toggle2 value={data.toiletPrep} onChange={v => set('toiletPrep', v as ToiletPrep)}
                  options={['準備している', '準備していない']} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  家具・ケージ周りの転倒防止対策 <span className="text-red-500">*</span>
                </label>
                <Toggle2 value={data.furnitureFixed} onChange={v => set('furnitureFixed', v as 'している' | 'していない')}
                  options={['している', 'していない']} />
              </div>

              <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 text-xs text-sky-800">
                🏢 回答が完了しました！「診断する」ボタンを押すと、
                {data.floor ?? '?'}階にお住まいの{data.petName ?? 'うちの子'}専用のマンション避難レポートを生成します（30〜60秒）。
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 mb-4">❌ {error}</div>
        )}

        <div className="flex gap-3">
          {step > 1 && (
            <button type="button" onClick={() => setStep(s => s - 1)}
              className="flex-1 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              ← 戻る
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button type="button" onClick={() => setStep(s => s + 1)} disabled={!isValid()}
              className="flex-1 py-3 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              次へ →
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={!isValid() || loading}
              className="flex-1 py-3 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  AI が診断中…（30〜60秒）
                </span>
              ) : '診断する 🏢'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
