'use client'

import { PET_MASTER, CANNOT_BRING_PETS } from '@/lib/petMaster'
import type { PetType } from '@/lib/petMaster'
import type { DiagnosisFormData, PetEntry, AgeRange, Gender, NeuteredStatus } from '@/lib/types'

interface Props {
  data: Partial<DiagnosisFormData>
  onChange: (updates: Partial<DiagnosisFormData>) => void
}

const PET_TYPES = Object.keys(PET_MASTER) as PetType[]
const AGE_RANGES: AgeRange[] = ['0〜6ヶ月', '7ヶ月〜1歳', '2〜4歳', '5〜7歳', '8〜10歳', '11〜14歳', '15歳以上']

const SHELTER_COLOR: Record<string, string> = {
  '○ 可能': 'border-emerald-400 bg-emerald-50',
  '△ 要確認': 'border-yellow-400 bg-yellow-50',
  '× 不可': 'border-red-400 bg-red-50',
}
const SHELTER_BADGE: Record<string, string> = {
  '○ 可能': 'bg-emerald-100 text-emerald-700',
  '△ 要確認': 'bg-yellow-100 text-yellow-700',
  '× 不可': 'bg-red-100 text-red-700',
}

export default function Step1Basic({ data, onChange }: Props) {
  const pets: PetEntry[] = data.pets ?? []
  const totalCount = pets.reduce((sum, p) => sum + p.count, 0)
  const [showCannotBring, setShowCannotBring] = useState(false)

  function addPet(type: PetType) {
    const existing = pets.find(p => p.type === type)
    if (existing) {
      onChange({ pets: pets.map(p => p.type === type ? { ...p, count: p.count + 1 } : p) })
    } else {
      onChange({ pets: [...pets, { type, count: 1 }] })
    }
  }

  function updateCount(type: PetType, delta: number) {
    onChange({ pets: pets.map(p => p.type === type ? { ...p, count: Math.max(1, p.count + delta) } : p) })
  }

  function removePet(type: PetType) {
    onChange({ pets: pets.filter(p => p.type !== type) })
  }

  return (
    <div className="space-y-6">
      {/* ペット種類選択 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          ペットの種類 <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-3">
          タップで追加（環境省認定の家庭用ペット全種対応）
        </p>
        <div className="grid grid-cols-3 gap-2">
          {PET_TYPES.map(t => {
            const master = PET_MASTER[t]
            const added = pets.some(p => p.type === t)
            return (
              <button
                key={t}
                type="button"
                onClick={() => addPet(t)}
                className={`py-2 px-2 rounded-lg border-2 text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                  added
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : `${SHELTER_COLOR[master.shelterStatus]} text-gray-700 hover:opacity-80`
                }`}
              >
                <span className="text-lg">{master.emoji}</span>
                <span className="leading-tight text-center">{t}</span>
                <span className={`text-[10px] px-1 rounded ${SHELTER_BADGE[master.shelterStatus]}`}>
                  {master.shelterStatus}
                </span>
              </button>
            )
          })}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          ○可能 / △要確認 / × 不可 … 避難所への同行可否の目安
        </p>
      </div>

      {/* 避難所に連れていけないペットの解説 */}
      <div>
        <button
          type="button"
          onClick={() => setShowCannotBring(!showCannotBring)}
          className="text-xs text-red-600 underline"
        >
          ⚠️ 避難所に連れていけないペットの理由を見る
        </button>
        {showCannotBring && (
          <div className="mt-2 space-y-2">
            {CANNOT_BRING_PETS.map(p => (
              <div key={p.type} className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs font-bold text-red-700">{p.emoji} {p.type}</p>
                <p className="text-xs text-red-600 mt-1">{p.cannotBringReason}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 追加済みペット */}
      {pets.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            追加済みペット（合計 {totalCount} 匹）
          </label>
          <div className="space-y-2">
            {pets.map(p => {
              const master = PET_MASTER[p.type]
              return (
                <div key={p.type} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{master.emoji}</span>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{p.type}</p>
                        <p className={`text-xs px-1.5 py-0.5 rounded inline-block ${SHELTER_BADGE[master.shelterStatus]}`}>
                          {master.shelterStatus}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => updateCount(p.type, -1)}
                        className="w-8 h-8 rounded-full border-2 border-emerald-400 text-emerald-600 font-bold flex items-center justify-center">−</button>
                      <span className="text-sm font-bold w-8 text-center">{p.count}匹</span>
                      <button type="button" onClick={() => updateCount(p.type, 1)}
                        className="w-8 h-8 rounded-full border-2 border-emerald-400 text-emerald-600 font-bold flex items-center justify-center">＋</button>
                      <button type="button" onClick={() => removePet(p.type)}
                        className="ml-1 text-gray-300 hover:text-red-400">✕</button>
                    </div>
                  </div>
                  {master.shelterStatus === '× 不可' && (
                    <p className="text-xs text-red-600 mt-2 bg-red-50 rounded p-2">
                      ⚠️ {master.cannotBringReason}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{master.shelterNote}</p>
                </div>
              )
            })}
          </div>
          {totalCount >= 3 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mt-2 text-xs text-amber-800">
              ⚠️ {totalCount}匹の同時避難は大変です。家族内で役割分担を事前に決めておきましょう。
            </div>
          )}
        </div>
      )}

      {/* ペット名前 */}
      {pets.length > 0 && (
        <>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">代表ペットの名前（任意）</label>
            <input
              type="text"
              placeholder="例：ポチ"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={data.petName ?? ''}
              onChange={e => onChange({ petName: e.target.value })}
            />
          </div>

          {pets.length > 1 && (
            <p className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
              💡 以下の質問は「最も医療・ケアが必要なペット」を代表として答えてください。
            </p>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              年齢（代表ペット） <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {AGE_RANGES.map(a => (
                <button key={a} type="button" onClick={() => onChange({ age: a })}
                  className={`py-2 px-1 rounded-lg border-2 text-xs font-medium transition-all ${
                    data.age === a ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white text-gray-600'}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">性別 <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                {(['オス', 'メス'] as Gender[]).map(g => (
                  <button key={g} type="button" onClick={() => onChange({ gender: g })}
                    className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      data.gender === g ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white text-gray-600'}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">去勢・避妊 <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                {(['済', '未'] as NeuteredStatus[]).map(n => (
                  <button key={n} type="button" onClick={() => onChange({ neutered: n })}
                    className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      data.neutered === n ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white text-gray-600'}`}>
                    {n === '済' ? '済み' : '未'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {pets.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-4">上のボタンからペットの種類を選んでください</p>
      )}
    </div>
  )
}

// useState のインポートが必要
import { useState } from 'react'
