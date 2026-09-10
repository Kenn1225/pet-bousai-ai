'use client'

import type { DiagnosisFormData, ResidenceType, FloorLevel, ElevatorStatus, FamilySize } from '@/lib/types'

interface Props {
  data: Partial<DiagnosisFormData>
  onChange: (updates: Partial<DiagnosisFormData>) => void
}

const FLOOR_LEVELS: { value: FloorLevel; label: string; note: string }[] = [
  { value: '1階', label: '1階', note: '避難しやすい' },
  { value: '2階', label: '2階', note: '比較的良好' },
  { value: '3階', label: '3階', note: '大型犬は要注意' },
  { value: '4〜6階', label: '4〜6階', note: 'EV停止時は困難' },
  { value: '7〜15階', label: '7〜15階', note: 'EV停止で避難困難' },
  { value: '16階以上', label: '16階以上（高層）', note: '最難関・要事前計画' },
]

export default function Step5Living({ data, onChange }: Props) {
  const isHighFloor = data.floor && !['1階', '2階'].includes(data.floor)

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          住居の種類 <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['戸建て（一軒家）', 'マンション', 'アパート', '集合住宅（その他）'] as ResidenceType[]).map(r => (
            <button key={r} type="button" onClick={() => onChange({ residenceType: r })}
              className={`py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                data.residenceType === r ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white text-gray-600'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          居住階 <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {FLOOR_LEVELS.map(f => (
            <button key={f.value} type="button" onClick={() => onChange({ floor: f.value })}
              className={`w-full flex items-center justify-between py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                data.floor === f.value ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white text-gray-600'}`}>
              <span>{f.label}</span>
              <span className="text-xs text-gray-400">{f.note}</span>
            </button>
          ))}
        </div>
        {data.floor === '16階以上' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2 text-xs text-red-800">
            🚨 超高層階は停電時のEV停止でペットを抱えての階段避難が非常に困難です。
            事前に「避難補助ロープ」「ペット用スリング」の準備と、低層階への一時避難先の確保を強く推奨します。
          </div>
        )}
      </div>

      {data.residenceType !== '戸建て（一軒家）' && isHighFloor && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            エレベーター <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['あり', 'なし'] as ElevatorStatus[]).map(e => (
              <button key={e} type="button" onClick={() => onChange({ elevator: e })}
                className={`py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  data.elevator === e ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white text-gray-600'}`}>
                {e}
              </button>
            ))}
          </div>
          {data.elevator === 'なし' && (
            <p className="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-lg p-2 mt-2">
              ⚠️ EV なしの高層階は避難時に大きな負担。ペット用スリングやカートの準備を検討してください。
            </p>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          同居家族の人数 <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['一人暮らし', '2人', '3〜4人', '5人以上'] as FamilySize[]).map(f => (
            <button key={f} type="button" onClick={() => onChange({ familySize: f })}
              className={`py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                data.familySize === f ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white text-gray-600'}`}>
              {f}
            </button>
          ))}
        </div>
        {data.familySize === '一人暮らし' && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 mt-2">
            💡 一人でペットを連れての避難は大変です。近隣のペット飼育者と「相互支援ネットワーク」を作っておきましょう。
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          自動車・移動手段 <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['あり', 'なし'] as const).map(v => (
            <button key={v} type="button" onClick={() => onChange({ hasCarOrTransport: v })}
              className={`py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                data.hasCarOrTransport === v ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white text-gray-600'}`}>
              {v === 'あり' ? '🚗 自動車あり' : '🚶 徒歩・公共交通のみ'}
            </button>
          ))}
        </div>
        {data.hasCarOrTransport === 'あり' && (
          <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2 mt-2">
            ✅ 車があると避難の選択肢が大幅に広がります。車中泊・ペット可宿泊施設への移動も可能です。
          </p>
        )}
      </div>
    </div>
  )
}
