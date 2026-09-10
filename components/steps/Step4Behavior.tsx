'use client'

import type { DiagnosisFormData, BehaviorScores } from '@/lib/types'

interface Props {
  data: Partial<DiagnosisFormData>
  onChange: (updates: Partial<DiagnosisFormData>) => void
}

interface ScoreItemProps {
  label: string
  lowLabel: string
  highLabel: string
  value: number
  onChange: (v: number) => void
  description: string
}

function ScoreItem({ label, lowLabel, highLabel, value, onChange, description }: ScoreItemProps) {
  const color = value >= 8 ? 'bg-emerald-500' : value >= 5 ? 'bg-yellow-400' : 'bg-red-400'
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <span className={`text-white text-sm font-bold px-2 py-0.5 rounded-full ${color}`}>{value}/10</span>
      </div>
      <p className="text-xs text-gray-400 mb-3">{description}</p>
      <div className="flex gap-1">
        {[1,2,3,4,5,6,7,8,9,10].map(n => (
          <button key={n} type="button" onClick={() => onChange(n)}
            className={`flex-1 h-8 rounded text-xs font-bold transition-all ${
              n <= value
                ? n <= 3 ? 'bg-red-400 text-white' : n <= 6 ? 'bg-yellow-400 text-white' : 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  )
}

export default function Step4Behavior({ data, onChange }: Props) {
  const b: BehaviorScores = data.behavior ?? {
    strangerReaction: 5,
    animalReaction: 5,
    crateComfort: 5,
    noiseReaction: 5,
    aloneAbility: 5,
    stressTolerance: 5,
  }

  function update(key: keyof BehaviorScores, val: number) {
    onChange({ behavior: { ...b, [key]: val } })
  }

  const avg = Math.round(Object.values(b).reduce((s, v) => s + v, 0) / 6)
  const avgColor = avg >= 8 ? 'text-emerald-600' : avg >= 5 ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700">行動特性スコア（平均）</p>
        <span className={`text-2xl font-black ${avgColor}`}>{avg}<span className="text-sm">/10</span></span>
      </div>

      <ScoreItem label="知らない人への反応"
        lowLabel="1=威嚇・咬む" highLabel="10=とても友好的"
        value={b.strangerReaction} onChange={v => update('strangerReaction', v)}
        description="初対面の人（獣医・ボランティア等）への反応。避難所では多くの見知らぬ人と接します。" />

      <ScoreItem label="他の動物への反応"
        lowLabel="1=激しく攻撃" highLabel="10=全く問題なし"
        value={b.animalReaction} onChange={v => update('animalReaction', v)}
        description="他の犬・猫・動物への反応。避難所では多種多様な動物が近くにいます。" />

      <ScoreItem label="キャリー・クレートの慣れ"
        lowLabel="1=全く入れない" highLabel="10=喜んで入る"
        value={b.crateComfort} onChange={v => update('crateComfort', v)}
        description="同行避難では多くの場所でキャリー収容が必須です。" />

      <ScoreItem label="大きな音・騒音への反応"
        lowLabel="1=パニック・逃走" highLabel="10=全く動じない"
        value={b.noiseReaction} onChange={v => update('noiseReaction', v)}
        description="サイレン・大声・爆発音等への反応。災害時は大きな音が多発します。" />

      <ScoreItem label="お留守番（単独でいられる）"
        lowLabel="1=全くできない" highLabel="10=長時間OK"
        value={b.aloneAbility} onChange={v => update('aloneAbility', v)}
        description="避難所では飼い主が離れる場面もあります。分離不安の強い子は特別なケアが必要。" />

      <ScoreItem label="ストレス耐性"
        lowLabel="1=非常に敏感" highLabel="10=非常に強い"
        value={b.stressTolerance} onChange={v => update('stressTolerance', v)}
        description="環境変化・不規則な生活・疲労等に対する全般的なストレス耐性。" />

      {avg <= 4 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-800">
          ⚠️ 行動特性スコアが低いです。避難所共同生活が困難な場合があります。
          車中泊・ペットホテル・知人宅等の代替避難先を必ず事前確保してください。
        </div>
      )}
    </div>
  )
}
