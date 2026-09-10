'use client'

import { PET_MASTER } from '@/lib/petMaster'
import type { PetType } from '@/lib/petMaster'
import type { DiagnosisFormData, FoodStock, WaterStock, HasItem } from '@/lib/types'

interface Props {
  data: Partial<DiagnosisFormData>
  onChange: (updates: Partial<DiagnosisFormData>) => void
}

export default function Step7Supplies({ data, onChange }: Props) {
  const primaryType = data.pets?.[0]?.type
  const master = primaryType ? PET_MASTER[primaryType as PetType] : null

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          ペットフードの備蓄量 <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-2">
          環境省推奨：最低5日分。理想は{master ? `${master.minStockDays}日分以上` : '2週間〜1か月'}
        </p>
        <div className="space-y-2">
          {([
            { value: '3日未満', label: '3日未満', color: 'border-red-300' },
            { value: '3〜5日', label: '3〜5日分', color: 'border-orange-300' },
            { value: '1週間', label: '1週間分', color: 'border-yellow-300' },
            { value: '2週間', label: '2週間分', color: 'border-emerald-300' },
            { value: '1か月以上', label: '1か月以上', color: 'border-emerald-500' },
          ] as { value: FoodStock; label: string; color: string }[]).map(v => (
            <button key={v.value} type="button" onClick={() => onChange({ foodStock: v.value })}
              className={`w-full text-left py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                data.foodStock === v.value
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : `${v.color} bg-white text-gray-600`}`}>
              {v.label}
            </button>
          ))}
        </div>
        {master && (
          <a href={master.amazonSearchUrl} target="_blank" rel="noopener noreferrer"
            className="inline-block mt-2 text-xs text-orange-600 underline">
            🛒 Amazonでペットフードを備蓄する →
          </a>
        )}
        {master && (
          <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
            <p className="font-bold mb-1">📦 救援物資について</p>
            <p>{master.emergencyFood}</p>
            {master.specialFoodNote && (
              <p className="mt-1 text-orange-700">{master.specialFoodNote}</p>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          ペット用飲料水の備蓄 <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {([
            { value: '3日分以上備蓄あり', label: '3日分以上備蓄あり ✅' },
            { value: '少しある', label: '少しある（1〜2日分程度）' },
            { value: 'なし', label: 'なし（備蓄していない）' },
          ] as { value: WaterStock; label: string }[]).map(v => (
            <button key={v.value} type="button" onClick={() => onChange({ waterStock: v.value })}
              className={`w-full text-left py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                data.waterStock === v.value
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-white text-gray-600'}`}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">保有しているもの（複数選択）<span className="text-red-500">*</span></label>
        <div className="space-y-2">
          {[
            { key: 'hasCrate' as keyof DiagnosisFormData, label: '🧳 移動用キャリー・クレート', desc: '同行避難の必須アイテム' },
            { key: 'hasIdTag' as keyof DiagnosisFormData, label: '🏷️ 迷子札（名前・連絡先）', desc: '災害時の迷子防止に必須' },
            { key: 'hasMicrochip' as keyof DiagnosisFormData, label: '💉 マイクロチップ装着', desc: '法定義務（犬猫）・最も確実な身元証明' },
            { key: 'hasFirstAid' as keyof DiagnosisFormData, label: '🩹 ペット用救急セット', desc: '消毒薬・包帯・ガーゼ等' },
            { key: 'hasMedRecord' as keyof DiagnosisFormData, label: '📋 ワクチン接種証明書・診察券', desc: '避難所への提示が必要な場合あり' },
          ].map(item => (
            <button key={item.key} type="button"
              onClick={() => onChange({ [item.key]: data[item.key] === 'ある' ? 'ない' : 'ある' } as Partial<DiagnosisFormData>)}
              className={`w-full flex items-center justify-between py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                data[item.key] === 'ある'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-white text-gray-600'}`}>
              <div className="text-left">
                <p>{item.label}</p>
                <p className="text-xs text-gray-400 font-normal">{item.desc}</p>
              </div>
              <span className={`text-lg ${data[item.key] === 'ある' ? 'text-emerald-500' : 'text-gray-200'}`}>
                {data[item.key] === 'ある' ? '✅' : '○'}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800">
        🐾 すべての回答が完了しました！「AI診断を開始する」ボタンを押すと、
        うちの子専用の防災レポートをAIが生成します（30〜60秒）。
      </div>
    </div>
  )
}
