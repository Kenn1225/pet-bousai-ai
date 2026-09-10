'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type {
  SeniorDiagnosisFormData, SeniorPetType, SeniorAgeRange, MobilityLevel, SenseLevel,
  CognitiveStatus, SeniorDisease, MedStock, VetContactStatus, EvacuationMobility,
  ToiletStatus, StressTolerance,
} from '@/lib/seniorTypes'

const STEP_LABELS = ['基本情報', '身体機能の変化', '医療・持病', '避難時の状態', '備え・住環境']
const TOTAL_STEPS = 5

const DISEASE_OPTIONS: SeniorDisease[] = [
  'なし', '腎臓病', '心臓病', '糖尿病', '関節疾患・椎間板', 'がん・腫瘍', '認知症', '肝臓病', 'その他の慢性疾患',
]

type SeniorFormState = Partial<SeniorDiagnosisFormData>

function Btn({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={`w-full text-left py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
        selected ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 bg-white text-gray-700 active:bg-gray-50'
      }`}>
      {children}
    </button>
  )
}

export default function SeniorDiagnosisPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<SeniorFormState>({ diseases: ['なし'] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof SeniorDiagnosisFormData>(key: K, value: SeniorDiagnosisFormData[K]) {
    setData(prev => ({ ...prev, [key]: value }))
  }

  function toggleDisease(d: SeniorDisease) {
    const curr = data.diseases ?? []
    if (d === 'なし') { setData(prev => ({ ...prev, diseases: ['なし'] })); return }
    const without = curr.filter(x => x !== 'なし' && x !== d)
    if (curr.includes(d)) {
      setData(prev => ({ ...prev, diseases: without.length ? without : ['なし'] }))
    } else {
      setData(prev => ({ ...prev, diseases: [...without, d] }))
    }
  }

  function isValid(): boolean {
    switch (step) {
      case 1: return !!(data.petType && data.age)
      case 2: return !!(data.mobility && data.vision && data.hearing && data.cognitive)
      case 3: return !!(data.diseases?.length && data.dailyMedication && data.medStock && data.vetContactSaved)
      case 4: return !!(data.evacuationMobility && data.toiletStatus && data.stressTolerance)
      case 5: return !!(data.hasCarrierOrCart && data.hasFamiliarBedding && data.hasDiapers && data.hasTempCareItems && data.hasElevator && data.hasHelper)
      default: return false
    }
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/diagnose-senior', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? '診断に失敗しました')
      sessionStorage.setItem('seniorDiagnosisResult', JSON.stringify(json))
      router.push('/diagnosis/senior/result')
    } catch (e) {
      setError(e instanceof Error ? e.message : '診断中にエラーが発生しました')
      setLoading(false)
    }
  }

  const progress = (step / TOTAL_STEPS) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <p className="text-xs text-amber-600 font-semibold tracking-widest mb-1">無料・即時診断</p>
          <h1 className="text-xl font-black text-gray-900">高齢ペット災害対策診断</h1>
          <p className="text-xs text-gray-400 mt-1">シニア犬・シニア猫だからこそ必要な備えをAIが診断します</p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>STEP {step} / {TOTAL_STEPS}</span>
            <span>{STEP_LABELS[step - 1]}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-base font-bold text-gray-800 mb-4">{STEP_LABELS[step - 1]}</h2>

          {/* STEP1: 基本情報 */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">ペットのニックネーム（任意）</label>
                <input type="text" placeholder="例：ポチ、みかん…" maxLength={20}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  value={data.petName ?? ''}
                  onChange={e => set('petName', e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  種類 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {([{ v: '犬', emoji: '🐕' }, { v: '猫', emoji: '🐈' }] as { v: SeniorPetType; emoji: string }[]).map(({ v, emoji }) => (
                    <button key={v} type="button" onClick={() => set('petType', v)}
                      className={`py-3 rounded-xl border-2 text-center text-sm font-medium transition-all ${
                        data.petType === v ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 bg-white text-gray-600'
                      }`}>
                      <div className="text-xl mb-1">{emoji}</div>{v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  年齢 <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {(['8〜10歳（シニア初期）', '11〜14歳（シニア期）', '15歳以上（高齢期）'] as SeniorAgeRange[]).map(v => (
                    <Btn key={v} selected={data.age === v} onClick={() => set('age', v)}>{v}</Btn>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">体重（任意・kg）</label>
                <input type="number" min={0} step={0.1} placeholder="例：4.5"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  value={data.weight ?? ''}
                  onChange={e => set('weight', e.target.value ? Number(e.target.value) : undefined)} />
              </div>
            </div>
          )}

          {/* STEP2: 身体機能の変化 */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  歩行状態 <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {(['自力でしっかり歩ける', 'ふらつきがある', '補助・介助が必要', 'ほぼ歩けない・寝たきり'] as MobilityLevel[]).map(v => (
                    <Btn key={v} selected={data.mobility === v} onClick={() => set('mobility', v)}>{v}</Btn>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  視力 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {(['問題ない', '衰えを感じる', 'ほとんど機能していない'] as SenseLevel[]).map(v => (
                    <Btn key={v} selected={data.vision === v} onClick={() => set('vision', v)}>{v}</Btn>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  聴力 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {(['問題ない', '衰えを感じる', 'ほとんど機能していない'] as SenseLevel[]).map(v => (
                    <Btn key={v} selected={data.hearing === v} onClick={() => set('hearing', v)}>{v}</Btn>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  認知機能 <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {(['症状なし', '夜鳴き・徘徊などの兆候がある', '認知症と診断済み'] as CognitiveStatus[]).map(v => (
                    <Btn key={v} selected={data.cognitive === v} onClick={() => set('cognitive', v)}>{v}</Btn>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP3: 医療・持病 */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  持病（複数選択可） <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-400 mb-2">「なし」選択で他の選択が外れます</p>
                <div className="grid grid-cols-2 gap-2">
                  {DISEASE_OPTIONS.map(d => (
                    <button key={d} type="button" onClick={() => toggleDisease(d)}
                      className={`py-2 px-3 text-left rounded-lg border-2 text-sm font-medium transition-all ${
                        data.diseases?.includes(d) ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 bg-white text-gray-600'
                      }`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  毎日の投薬 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['あり', 'なし'] as const).map(v => (
                    <button key={v} type="button" onClick={() => set('dailyMedication', v)}
                      className={`py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        data.dailyMedication === v ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 bg-white text-gray-600'
                      }`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  薬の備蓄 <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {(['備蓄なし', '3日未満', '3〜7日分', '1〜2週間分', '1か月以上'] as MedStock[]).map(v => (
                    <Btn key={v} selected={data.medStock === v} onClick={() => set('medStock', v)}>{v}</Btn>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  かかりつけ動物病院の連絡先を控えているか <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['控えている', '控えていない'] as VetContactStatus[]).map(v => (
                    <button key={v} type="button" onClick={() => set('vetContactSaved', v)}
                      className={`py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        data.vetContactSaved === v ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 bg-white text-gray-600'
                      }`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP4: 避難時の状態 */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  避難時の移動 <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {(['自力で歩いて避難できる', '抱っこ・カートが必要', 'ほぼ運んでもらう必要がある（寝たきり等）'] as EvacuationMobility[]).map(v => (
                    <Btn key={v} selected={data.evacuationMobility === v} onClick={() => set('evacuationMobility', v)}>{v}</Btn>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  トイレ・排泄の状況 <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {(['問題なし', 'たまに失敗する', '常時おむつ・介助が必要'] as ToiletStatus[]).map(v => (
                    <Btn key={v} selected={data.toiletStatus === v} onClick={() => set('toiletStatus', v)}>{v}</Btn>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  環境変化へのストレス耐性 <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {(['落ち着いている', 'やや不安になりやすい', '非常に神経質・パニックになりやすい'] as StressTolerance[]).map(v => (
                    <Btn key={v} selected={data.stressTolerance === v} onClick={() => set('stressTolerance', v)}>{v}</Btn>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP5: 備え・住環境 */}
          {step === 5 && (
            <div className="space-y-4">
              {([
                { key: 'hasCarrierOrCart', label: '🧳 キャリー・ペットカート', yes: 'ある', no: 'ない' },
                { key: 'hasFamiliarBedding', label: '🛏️ 使い慣れた毛布・匂いのあるグッズ', yes: 'ある', no: 'ない' },
                { key: 'hasDiapers', label: '🩹 おむつ・介護用品', yes: 'ある', no: 'ない・不要' },
                { key: 'hasTempCareItems', label: '🌡️ 防寒・防暑グッズ', yes: 'ある', no: 'ない' },
              ] as { key: keyof SeniorDiagnosisFormData; label: string; yes: string; no: string }[]).map(item => (
                <div key={item.key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{item.label}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[item.yes, item.no].map(v => (
                      <button key={v} type="button" onClick={() => set(item.key, v as never)}
                        className={`py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                          data[item.key] === v ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 bg-white text-gray-600'
                        }`}>
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">エレベーター</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['あり', 'なし・戸建て'] as const).map(v => (
                    <button key={v} type="button" onClick={() => set('hasElevator', v)}
                      className={`py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                        data.hasElevator === v ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 bg-white text-gray-600'
                      }`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">避難を手伝える家族・近隣の協力者</label>
                <div className="grid grid-cols-1 gap-2">
                  {(['いる（家族・近隣等）', 'いない・一人で対応'] as const).map(v => (
                    <button key={v} type="button" onClick={() => set('hasHelper', v)}
                      className={`py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                        data.hasHelper === v ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 bg-white text-gray-600'
                      }`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                🐾 回答が完了しました！「診断する」ボタンを押すと、
                {data.petName ?? 'うちの子'}専用の高齢ペット防災レポートを生成します（30〜60秒）。
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
              className="flex-1 py-3 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              次へ →
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={!isValid() || loading}
              className="flex-1 py-3 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  AI が診断中…（30〜60秒）
                </span>
              ) : '診断する 🐾'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
