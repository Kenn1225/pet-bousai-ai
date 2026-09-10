'use client'

import type { DiagnosisFormData, DogSize, ExerciseInfo } from '@/lib/types'

interface Props {
  data: Partial<DiagnosisFormData>
  onChange: (updates: Partial<DiagnosisFormData>) => void
}

const DOG_SIZES: { value: DogSize; weight: string; example: string }[] = [
  { value: '超小型犬（〜4kg）', weight: '〜4kg', example: 'チワワ・トイプードル' },
  { value: '小型犬（4〜10kg）', weight: '4〜10kg', example: 'ダックスフント・ポメラニアン' },
  { value: '中型犬（10〜25kg）', weight: '10〜25kg', example: '柴犬・コーギー・ビーグル' },
  { value: '大型犬（25〜45kg）', weight: '25〜45kg', example: '秋田犬・ラブラドール・ゴールデン' },
  { value: '超大型犬（45kg〜）', weight: '45kg〜', example: 'グレートデン・セントバーナード' },
]

const EXERCISE_OPTIONS = [
  { minutes: 10, label: '約10分' },
  { minutes: 20, label: '約20分' },
  { minutes: 30, label: '約30分' },
  { minutes: 45, label: '約45分' },
  { minutes: 60, label: '約1時間' },
  { minutes: 90, label: '約1.5時間' },
  { minutes: 120, label: '約2時間以上' },
]

export default function Step2Dog({ data, onChange }: Props) {
  const ex = data.exercise ?? { dailyMinutes: 30, exerciseType: '散歩' }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          犬のサイズ <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {DOG_SIZES.map(s => (
            <button key={s.value} type="button" onClick={() => onChange({ dogSize: s.value })}
              className={`w-full flex items-center justify-between py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                data.dogSize === s.value
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300'}`}>
              <span>{s.value}</span>
              <span className="text-xs text-gray-400">{s.example}</span>
            </button>
          ))}
        </div>
        {data.dogSize && ['大型犬（25〜45kg）', '超大型犬（45kg〜）'].includes(data.dogSize) && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-2 text-xs text-orange-800">
            ⚠️ 大型犬は多くの避難所で受け入れが困難です。ペット可のホテル・知人宅など複数の避難先を事前確保してください。
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">体重（kg）</label>
          <input type="number" step="0.1" min="0" placeholder="例：5.2"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            value={data.dogWeight ?? ''}
            onChange={e => onChange({ dogWeight: e.target.value ? Number(e.target.value) : undefined })} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">犬種（任意）</label>
          <input type="text" placeholder="例：トイプードル"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            value={data.dogBreed ?? ''}
            onChange={e => onChange({ dogBreed: e.target.value })} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          1日の平均散歩・運動時間 <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {EXERCISE_OPTIONS.map(o => (
            <button key={o.minutes} type="button"
              onClick={() => onChange({ exercise: { ...ex, dailyMinutes: o.minutes } })}
              className={`py-2 px-1 rounded-lg border-2 text-xs font-medium transition-all ${
                ex.dailyMinutes === o.minutes
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300'}`}>
              {o.label}
            </button>
          ))}
        </div>
        {ex.dailyMinutes >= 60 && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 mt-2">
            💡 運動量の多い犬は避難時の運動不足がストレスになりやすいです。避難場所でも短時間の運動を確保しましょう。
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">運動の種類（任意）</label>
        <div className="grid grid-cols-3 gap-2">
          {['散歩', '公園での遊び', 'ドッグラン', '水泳', '自宅内遊び', 'その他'].map(t => (
            <button key={t} type="button"
              onClick={() => onChange({ exercise: { ...ex, exerciseType: t } })}
              className={`py-2 px-2 rounded-lg border-2 text-xs font-medium transition-all ${
                ex.exerciseType === t
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
