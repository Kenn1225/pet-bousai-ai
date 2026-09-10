'use client'

import { useState, useEffect } from 'react'
import { getMunicipalPetLink, FALLBACK_LINKS } from '@/lib/municipalLinks'
import { ALL_DISASTERS, DISASTER_MASTER, suggestDisasters } from '@/lib/disasterMaster'
import type { DisasterType } from '@/lib/disasterMaster'
import type { DiagnosisFormData, RiverProximity, LandslideRisk, ShelterConfirmed } from '@/lib/types'

interface Props {
  data: Partial<DiagnosisFormData>
  onChange: (updates: Partial<DiagnosisFormData>) => void
}

export default function Step6Disaster({ data, onChange }: Props) {
  const [municipalInfo, setMunicipalInfo] = useState<{ name: string; url: string } | null>(null)
  // 地域リスクの回答から自動提案したことを一度だけ知らせる
  const [autoFilled, setAutoFilled] = useState(false)

  useEffect(() => {
    if (data.postalCode && data.postalCode.replace(/[^0-9]/g, '').length >= 3) {
      const info = getMunicipalPetLink(data.postalCode)
      setMunicipalInfo(info)
    } else {
      setMunicipalInfo(null)
    }
  }, [data.postalCode])

  // 川・崖・津波の回答が揃った時点で、該当しそうな災害を自動で選んでおく
  useEffect(() => {
    if (data.disasterTypes?.length) return
    if (!data.riverProximity || !data.landslideRisk || !data.tsunamiRisk) return
    onChange({ disasterTypes: suggestDisasters(data) })
    setAutoFilled(true)
    // onChange は毎レンダー新しい関数のため依存に入れない
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.riverProximity, data.landslideRisk, data.tsunamiRisk, data.disasterTypes])

  function toggleDisaster(t: DisasterType) {
    const cur = data.disasterTypes ?? []
    onChange({
      disasterTypes: cur.includes(t) ? cur.filter(x => x !== t) : [...cur, t],
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          郵便番号 <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-2">市区町村のペット防災情報へのリンクが自動表示されます</p>
        <input
          type="text"
          placeholder="例：123-4567"
          maxLength={8}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          value={data.postalCode ?? ''}
          onChange={e => onChange({ postalCode: e.target.value.replace(/[^0-9-]/g, '') })}
        />
        {municipalInfo && (
          <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <p className="text-xs font-bold text-emerald-800 mb-1">🏛️ {municipalInfo.name} のペット防災情報</p>
            <a href={municipalInfo.url} target="_blank" rel="noopener noreferrer"
              className="text-xs text-emerald-600 underline break-all">
              {municipalInfo.name} 動物管理・ペット防災ページ →
            </a>
          </div>
        )}
        {!municipalInfo && data.postalCode && data.postalCode.length >= 7 && (
          <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-2">お住まいの市区町村サイトを検索してください：</p>
            <div className="space-y-1">
              <a href={FALLBACK_LINKS.hazardMap} target="_blank" rel="noopener noreferrer"
                className="block text-xs text-blue-600 underline">🗺️ ハザードマップポータルサイト（国土地理院）→</a>
              <a href={FALLBACK_LINKS.envMinistry} target="_blank" rel="noopener noreferrer"
                className="block text-xs text-blue-600 underline">🐾 環境省 ペット防災ガイドライン →</a>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          自宅付近の水害リスク <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {([
            { value: 'すぐそば（500m以内）', label: '川・海・低地がすぐそば（500m以内）', color: 'border-red-300' },
            { value: '近く（500m〜1km）', label: '川・海・低地が近い（500m〜1km）', color: 'border-orange-300' },
            { value: 'なし・遠い', label: '川・海・低地はない・遠い', color: 'border-gray-200' },
          ] as { value: RiverProximity; label: string; color: string }[]).map(v => (
            <button key={v.value} type="button" onClick={() => onChange({ riverProximity: v.value })}
              className={`w-full text-left py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                data.riverProximity === v.value
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : `${v.color} bg-white text-gray-600`}`}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          土砂災害リスク <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {([
            { value: 'はい（ハザードマップで確認済）', label: 'はい（ハザードマップで確認済）' },
            { value: 'おそらくある', label: 'おそらくある（山・崖の近く）' },
            { value: 'いいえ', label: 'いいえ（平地・リスクなし）' },
            { value: '分からない', label: '分からない（未確認）' },
          ] as { value: LandslideRisk; label: string }[]).map(v => (
            <button key={v.value} type="button" onClick={() => onChange({ landslideRisk: v.value })}
              className={`w-full text-left py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                data.landslideRisk === v.value
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-white text-gray-600'}`}>
              {v.label}
            </button>
          ))}
        </div>
        {(data.landslideRisk === '分からない' || data.landslideRisk === 'おそらくある') && (
          <a href={FALLBACK_LINKS.hazardMap} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center mt-2 text-xs text-emerald-600 underline">
            🗺️ ハザードマップポータルで今すぐ確認する →
          </a>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          津波リスク <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['あり', 'なし', '分からない'] as const).map(v => (
            <button key={v} type="button" onClick={() => onChange({ tsunamiRisk: v })}
              className={`py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                data.tsunamiRisk === v
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-white text-gray-600'}`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          想定する自然災害 <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-2">
          選んだ災害ごとに、行動手順と必要な備えを個別に診断します（複数選択可）
        </p>
        {autoFilled && (
          <div className="mb-2 bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-xs text-blue-800">
            ✅ 上の回答から、該当しそうな災害を自動で選びました。追加・解除できます。
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          {ALL_DISASTERS.map(t => {
            const p = DISASTER_MASTER[t]
            const on = data.disasterTypes?.includes(t) ?? false
            return (
              <button key={t} type="button" onClick={() => toggleDisaster(t)}
                className={`text-left py-2.5 px-3 rounded-lg border-2 transition-all ${
                  on ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white'}`}>
                <div className={`text-sm font-semibold ${on ? 'text-emerald-700' : 'text-gray-600'}`}>
                  {p.emoji} {t}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">
                  猶予：{p.leadTime}
                </div>
              </button>
            )
          })}
        </div>
        {data.disasterTypes && data.disasterTypes.length === 0 && (
          <p className="mt-2 text-xs text-red-600">1つ以上選んでください</p>
        )}
        {data.disasterTypes && data.disasterTypes.length > 0 && (
          <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-600 leading-relaxed">
              猶予時間ごとに備え方が変わります。
              <span className="font-semibold text-gray-700">前触れなし</span>の災害（地震・停電）は
              「事前の環境づくり」が、
              <span className="font-semibold text-gray-700">数日前に分かる</span>災害（台風・大雪）は
              「早めの避難と備蓄」が決め手になります。
            </p>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          ペット同行避難所の確認状況 <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {([
            { value: 'ペット同行可の避難所を確認済', label: 'ペット同行可の避難所を確認済', color: 'text-emerald-700' },
            { value: '避難所の場所は知っているがペット可否不明', label: '場所は知っているがペット可否は不明', color: 'text-orange-700' },
            { value: '未確認', label: '未確認（何も把握していない）', color: 'text-red-700' },
          ] as { value: ShelterConfirmed; label: string; color: string }[]).map(v => (
            <button key={v.value} type="button" onClick={() => onChange({ shelterConfirmed: v.value })}
              className={`w-full text-left py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                data.shelterConfirmed === v.value
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-white text-gray-600'}`}>
              {v.label}
            </button>
          ))}
        </div>
        {data.shelterConfirmed && data.shelterConfirmed !== 'ペット同行可の避難所を確認済' && (
          <div className="mt-2 bg-orange-50 border border-orange-200 rounded-lg p-3 text-xs text-orange-800">
            ⚠️ 全国の避難所の約4割がペット受け入れ不可です。
            市区町村の防災担当窓口に電話で確認するのが最確実な方法です。
            {municipalInfo && (
              <><br /><a href={municipalInfo.url} target="_blank" rel="noopener noreferrer"
                className="text-emerald-700 underline">{municipalInfo.name} の防災ページで確認 →</a></>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
