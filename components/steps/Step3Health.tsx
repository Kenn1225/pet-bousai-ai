'use client'

import { DISEASE_MASTER } from '@/lib/diseaseMaster'
import type { Disease } from '@/lib/diseaseMaster'
import type { DiagnosisFormData, MedicationStatus } from '@/lib/types'

interface Props {
  data: Partial<DiagnosisFormData>
  onChange: (updates: Partial<DiagnosisFormData>) => void
}

const ALL_DISEASES = Object.keys(DISEASE_MASTER) as Disease[]
const MEDICATIONS: { value: MedicationStatus; label: string; desc: string }[] = [
  { value: '毎日必要（処方薬）', label: '毎日（処方薬）', desc: '動物病院の処方薬を毎日投与' },
  { value: '毎日必要（市販薬）', label: '毎日（市販薬）', desc: 'サプリ・市販薬を毎日投与' },
  { value: '時々必要', label: '時々必要', desc: '症状が出た時のみ投与' },
  { value: '不要', label: '不要', desc: '現在投薬なし' },
]

export default function Step3Health({ data, onChange }: Props) {
  const selected = data.diseases ?? ['なし']

  function toggleDisease(dis: Disease) {
    if (dis === 'なし') { onChange({ diseases: ['なし'] }); return }
    const without = selected.filter(d => d !== 'なし')
    const next = without.includes(dis) ? without.filter(d => d !== dis) : [...without, dis]
    onChange({ diseases: next.length === 0 ? ['なし'] : next })
  }

  const hasSeriousDisease = selected.some(d =>
    ['心臓病', '腎臓病', '糖尿病', '癲癇', '腫瘍・がん', '呼吸器疾患（気管虚脱等）'].includes(d)
  )

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          持病・既往症 <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-3">複数選択可。選択すると避難時の注意点が表示されます。</p>
        <div className="grid grid-cols-2 gap-2">
          {ALL_DISEASES.map(d => {
            const master = DISEASE_MASTER[d]
            const isSelected = selected.includes(d)
            const urgencyColor = master.urgency === '高' ? 'text-red-500' : master.urgency === '中' ? 'text-orange-500' : 'text-gray-400'
            return (
              <button key={d} type="button" onClick={() => toggleDisease(d)}
                className={`py-2 px-3 rounded-lg border-2 text-xs font-medium transition-all text-left flex items-center justify-between ${
                  isSelected ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white text-gray-600'}`}>
                <span>{d === 'なし' ? '✓ 特になし' : d}</span>
                {d !== 'なし' && <span className={`text-[10px] font-bold ${urgencyColor}`}>{master.urgency}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* 選択した疾患の詳細 */}
      {selected.filter(d => d !== 'なし').length > 0 && (
        <div className="space-y-2">
          {selected.filter(d => d !== 'なし').map(d => {
            const master = DISEASE_MASTER[d as Disease]
            if (!master) return null
            return (
              <div key={d} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold text-amber-800">{d}</p>
                  <a href={master.infoUrl} target="_blank" rel="noopener noreferrer"
                    className="text-[10px] text-blue-600 underline">詳細を見る →</a>
                </div>
                <p className="text-xs text-amber-700">{master.note}</p>
                {master.stockItems.length > 0 && (
                  <div className="mt-2">
                    <p className="text-[10px] font-bold text-amber-800 mb-1">必要な備蓄品：</p>
                    <ul className="text-[10px] text-amber-700 space-y-0.5">
                      {master.stockItems.map((item, i) => <li key={i}>• {item}</li>)}
                    </ul>
                    <a href={master.amazonSearchUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-block mt-1 text-[10px] text-orange-600 underline">
                      🛒 Amazonで備蓄品を探す →
                    </a>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          定期的な投薬 <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {MEDICATIONS.map(m => (
            <button key={m.value} type="button" onClick={() => onChange({ medication: m.value })}
              className={`w-full flex items-center justify-between py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                data.medication === m.value
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-white text-gray-600'}`}>
              <span>{m.label}</span>
              <span className="text-xs text-gray-400">{m.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          療法食・特別食 <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['不要', '必要（療法食）', '必要（アレルギー対応）', '必要（その他）'] as const).map(v => (
            <button key={v} type="button" onClick={() => onChange({ specialDiet: v })}
              className={`py-2 px-3 rounded-lg border-2 text-xs font-medium transition-all ${
                data.specialDiet === v
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-white text-gray-600'}`}>
              {v}
            </button>
          ))}
        </div>
        {data.specialDiet && data.specialDiet !== '不要' && (
          <div className="mt-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2">
            ⚠️ 特別食は救援物資では入手できません。最低2週間〜1ヶ月分の自前備蓄が必須です。
            <br />
            <a href="https://www.amazon.co.jp/s?k=ペット+療法食+長期保存" target="_blank" rel="noopener noreferrer"
              className="text-orange-600 underline">🛒 Amazonで療法食を備蓄する →</a>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          ワクチン接種状況 <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['すべて接種済', '一部未接種', '未接種', '不明'] as const).map(v => (
            <button key={v} type="button" onClick={() => onChange({ vaccinationStatus: v })}
              className={`py-2 px-3 rounded-lg border-2 text-xs font-medium transition-all ${
                data.vaccinationStatus === v
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-white text-gray-600'}`}>
              {v}
            </button>
          ))}
        </div>
        {data.vaccinationStatus && data.vaccinationStatus !== 'すべて接種済' && (
          <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2 mt-2">
            ⚠️ 避難所での感染症リスクが高まります。最寄りの動物病院でワクチン接種を検討してください。
          </p>
        )}
      </div>

      {hasSeriousDisease && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-3 text-xs text-red-800">
          🚨 重篤な持病があります。かかりつけ獣医師に「災害時の対応方法」を事前に相談し、
          薬の処方箋コピー・診断書をご準備ください。
        </div>
      )}
    </div>
  )
}
