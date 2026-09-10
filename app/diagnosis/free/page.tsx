'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type {
  DiagnosisFormData, PetEntry, AgeRange, Gender, NeuteredStatus,
  Disease, MedicationStatus, ResidenceType, FloorLevel, FamilySize,
  RiverProximity, LandslideRisk, ShelterConfirmed, FoodStock, WaterStock
} from '@/lib/types'
import type { PetType } from '@/lib/petMaster'
import { getMunicipalPetLink } from '@/lib/municipalLinks'

const SIMPLE_PET_TYPES: { type: PetType; emoji: string; label: string }[] = [
  { type: '犬', emoji: '🐕', label: '犬' },
  { type: '猫', emoji: '🐈', label: '猫' },
  { type: 'うさぎ', emoji: '🐇', label: 'うさぎ' },
  { type: 'ハムスター', emoji: '🐹', label: 'ハムスター' },
  { type: 'セキセイインコ', emoji: '🦜', label: '鳥（小型）' },
  { type: 'カメ', emoji: '🐢', label: 'カメ' },
  { type: 'フェレット', emoji: '🐾', label: 'フェレット' },
  { type: 'その他', emoji: '🐾', label: 'その他' },
]

const SIMPLE_DISEASES: { value: Disease; label: string }[] = [
  { value: 'なし', label: '持病なし' },
  { value: '心臓病', label: '心臓病' },
  { value: '腎臓病', label: '腎臓病' },
  { value: '糖尿病', label: '糖尿病' },
  { value: '癲癇', label: '癲癇（てんかん）' },
  { value: 'アレルギー（食物）', label: 'アレルギー' },
  { value: '関節疾患・椎間板疾患', label: '関節・骨の疾患' },
  { value: '腫瘍・がん', label: '腫瘍・がん' },
]

const STEP_LABELS = ['ペット基本情報', '健康・医療', '住環境', '地域・避難', '備蓄確認']
const TOTAL_STEPS = 5

type SimpleFormData = Partial<DiagnosisFormData>

export default function SimpleDiagnosisPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)

  // 認証をバイパス（テスト用）
  useEffect(() => {
    document.cookie = 'pet_auth=test_code; path=/; max-age=31536000'
  }, [])
  const [data, setData] = useState<SimpleFormData>({ diseases: ['なし'], hasCrate: 'ない', hasIdTag: 'ない' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof DiagnosisFormData>(key: K, value: DiagnosisFormData[K]) {
    setData(prev => ({ ...prev, [key]: value }))
  }

  function togglePet(type: PetType) {
    const pets = data.pets ?? []
    const existing = pets.find(p => p.type === type)
    if (existing) {
      setData(prev => ({ ...prev, pets: pets.filter(p => p.type !== type) }))
    } else {
      setData(prev => ({ ...prev, pets: [...pets, { type, count: 1 }] }))
    }
  }

  function setPetCount(type: PetType, count: number) {
    setData(prev => ({
      ...prev,
      pets: (prev.pets ?? []).map(p => p.type === type ? { ...p, count } : p)
    }))
  }

  function toggleDisease(d: Disease) {
    const curr = data.diseases ?? []
    if (d === 'なし') {
      setData(prev => ({ ...prev, diseases: ['なし'] }))
      return
    }
    const without = curr.filter(x => x !== 'なし' && x !== d)
    if (curr.includes(d)) {
      setData(prev => ({ ...prev, diseases: without.length ? without : ['なし'] }))
    } else {
      setData(prev => ({ ...prev, diseases: [...without, d] }))
    }
  }

  function isValid(): boolean {
    switch (step) {
      case 1: return !!(data.pets && data.pets.length > 0 && data.age && data.gender && data.neutered)
      case 2: return !!(data.diseases && data.diseases.length > 0 && data.medication && data.specialDiet)
      case 3: return !!(data.residenceType && data.floor && data.familySize && data.hasCarOrTransport)
      case 4: return !!(data.postalCode && data.postalCode.replace(/[^0-9]/g, '').length >= 7 && data.riverProximity && data.landslideRisk && data.tsunamiRisk && data.shelterConfirmed)
      case 5: return !!(data.foodStock && data.waterStock)
      default: return false
    }
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    const payload: Partial<DiagnosisFormData> = {
      ...data,
      vaccinationStatus: '不明',
      behavior: { strangerReaction: 5, animalReaction: 5, crateComfort: 5, noiseReaction: 5, aloneAbility: 5, stressTolerance: 5 },
      elevator: '該当なし（戸建て）',
      hasMicrochip: 'ない',
      hasFirstAid: 'ない',
      hasMedRecord: 'ない',
    }
    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? '診断に失敗しました')
      sessionStorage.setItem('diagnosisResult', JSON.stringify(json))
      router.push('/diagnosis/result')
    } catch (e) {
      setError(e instanceof Error ? e.message : '診断中にエラーが発生しました')
      setLoading(false)
    }
  }

  const progress = (step / TOTAL_STEPS) * 100
  const municipalInfo = data.postalCode && data.postalCode.replace(/[^0-9]/g, '').length >= 3
    ? getMunicipalPetLink(data.postalCode)
    : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <p className="text-xs text-emerald-600 font-semibold tracking-widest mb-1">AI 診断 簡易版</p>
          <h1 className="text-xl font-bold text-gray-800">うちの子専用防災メソッド</h1>
          <p className="text-xs text-gray-400 mt-1">約5分・30問でAIが防災レポートを作成します</p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>STEP {step} / {TOTAL_STEPS}</span>
            <span>{STEP_LABELS[step - 1]}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-base font-bold text-gray-800 mb-4">{STEP_LABELS[step - 1]}</h2>

          {/* STEP 1: ペット基本情報 */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  ペットのニックネーム（任意）
                </label>
                <input type="text" placeholder="例：ポチ、みかん…" maxLength={20}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  value={data.petName ?? ''}
                  onChange={e => set('petName', e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ペットの種類を選んでください <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {SIMPLE_PET_TYPES.map(({ type, emoji, label }) => {
                    const selected = data.pets?.some(p => p.type === type)
                    return (
                      <button key={type} type="button" onClick={() => togglePet(type)}
                        className={`py-3 rounded-xl border-2 text-center text-xs font-medium transition-all ${
                          selected ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white text-gray-600'
                        }`}>
                        <div className="text-xl mb-1">{emoji}</div>
                        <div>{label}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {(data.pets ?? []).length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">頭数（種類ごと）</label>
                  <div className="space-y-2">
                    {(data.pets ?? []).map(p => (
                      <div key={p.type} className="flex items-center gap-3 bg-emerald-50 rounded-lg px-3 py-2">
                        <span className="text-sm font-medium text-emerald-700 w-20">{p.type}</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(n => (
                            <button key={n} type="button" onClick={() => setPetCount(p.type, n)}
                              className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                                p.count === n ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-300 text-gray-500'
                              }`}>
                              {n}
                            </button>
                          ))}
                          <button type="button" onClick={() => setPetCount(p.type, 6)}
                            className={`px-2 h-8 rounded-full text-xs font-bold transition-all ${
                              p.count >= 6 ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-300 text-gray-500'
                            }`}>
                            5+
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  年齢 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: '0〜6ヶ月', label: '0〜6ヶ月（子犬・子猫期）' },
                    { value: '7ヶ月〜1歳', label: '7ヶ月〜1歳（若犬期）' },
                    { value: '2〜4歳', label: '2〜4歳（青年期）' },
                    { value: '5〜7歳', label: '5〜7歳（成熟期）' },
                    { value: '8〜10歳', label: '8〜10歳（シニア前期）' },
                    { value: '11〜14歳', label: '11〜14歳（シニア期）' },
                    { value: '15歳以上', label: '15歳以上（高齢期）' },
                  ] as { value: AgeRange; label: string }[]).map(a => (
                    <button key={a.value} type="button" onClick={() => set('age', a.value)}
                      className={`py-2 px-3 text-left rounded-lg border-2 text-xs font-medium transition-all ${
                        data.age === a.value ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white text-gray-600'
                      }`}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    性別 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    {(['オス', 'メス'] as Gender[]).map(g => (
                      <button key={g} type="button" onClick={() => set('gender', g)}
                        className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                          data.gender === g ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white text-gray-600'
                        }`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    去勢・避妊 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    {(['済', '未'] as NeuteredStatus[]).map(n => (
                      <button key={n} type="button" onClick={() => set('neutered', n)}
                        className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                          data.neutered === n ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white text-gray-600'
                        }`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: 健康・医療 */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  持病・疾患（複数選択可） <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-400 mb-2">「持病なし」選択で他の選択が外れます</p>
                <div className="grid grid-cols-2 gap-2">
                  {SIMPLE_DISEASES.map(d => (
                    <button key={d.value} type="button" onClick={() => toggleDisease(d.value)}
                      className={`py-2 px-3 text-left rounded-lg border-2 text-sm font-medium transition-all ${
                        data.diseases?.includes(d.value) ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white text-gray-600'
                      }`}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  投薬状況 <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {([
                    { value: '毎日必要（処方薬）', label: '毎日必要（処方薬）', desc: '動物病院の処方薬を毎日投与' },
                    { value: '毎日必要（市販薬）', label: '毎日必要（市販薬）', desc: 'フィラリア予防薬・サプリ等' },
                    { value: '時々必要', label: '時々必要', desc: '発作時・症状が出た時のみ' },
                    { value: '不要', label: '不要', desc: '薬の投与なし' },
                  ] as { value: MedicationStatus; label: string; desc: string }[]).map(m => (
                    <button key={m.value} type="button" onClick={() => set('medication', m.value)}
                      className={`w-full text-left py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                        data.medication === m.value ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white text-gray-600'
                      }`}>
                      <span className="font-semibold">{m.label}</span>
                      <span className="text-xs text-gray-400 ml-2">{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  特別な食事（療法食等） <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: '不要', label: '特になし' },
                    { value: '必要（療法食）', label: '療法食が必要' },
                    { value: '必要（アレルギー対応）', label: 'アレルギー対応食' },
                    { value: '必要（その他）', label: 'その他の特別食' },
                  ] as { value: DiagnosisFormData['specialDiet']; label: string }[]).map(s => (
                    <button key={s.value} type="button" onClick={() => set('specialDiet', s.value)}
                      className={`py-2.5 px-3 text-sm font-medium rounded-lg border-2 transition-all ${
                        data.specialDiet === s.value ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white text-gray-600'
                      }`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: 住環境 */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  住居の種類 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['戸建て（一軒家）', 'マンション', 'アパート', '集合住宅（その他）'] as ResidenceType[]).map(r => (
                    <button key={r} type="button" onClick={() => set('residenceType', r)}
                      className={`py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        data.residenceType === r ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white text-gray-600'
                      }`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  居住階 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: '1階', label: '1階' },
                    { value: '2階', label: '2階' },
                    { value: '3階', label: '3階' },
                    { value: '4〜6階', label: '4〜6階' },
                    { value: '7〜15階', label: '7〜15階' },
                    { value: '16階以上', label: '16階以上' },
                  ] as { value: FloorLevel; label: string }[]).map(f => (
                    <button key={f.value} type="button" onClick={() => set('floor', f.value)}
                      className={`py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        data.floor === f.value ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white text-gray-600'
                      }`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  同居家族の人数 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['一人暮らし', '2人', '3〜4人', '5人以上'] as FamilySize[]).map(f => (
                    <button key={f} type="button" onClick={() => set('familySize', f)}
                      className={`py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        data.familySize === f ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white text-gray-600'
                      }`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  自動車・移動手段 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['あり', 'なし'] as const).map(v => (
                    <button key={v} type="button" onClick={() => set('hasCarOrTransport', v)}
                      className={`py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        data.hasCarOrTransport === v ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white text-gray-600'
                      }`}>
                      {v === 'あり' ? '🚗 自動車あり' : '🚶 徒歩・公共交通のみ'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: 地域・避難 */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  郵便番号 <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-400 mb-2">市区町村のペット防災ページへのリンクが自動表示されます</p>
                <input type="text" placeholder="例：123-4567" maxLength={8}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  value={data.postalCode ?? ''}
                  onChange={e => set('postalCode', e.target.value.replace(/[^0-9-]/g, ''))} />
                {municipalInfo && (
                  <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <p className="text-xs font-bold text-emerald-800 mb-1">🏛️ {municipalInfo.name} のペット防災情報</p>
                    <a href={municipalInfo.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-emerald-600 underline">
                      {municipalInfo.name} 動物管理・ペット防災ページ →
                    </a>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  水害リスク <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {([
                    { value: 'すぐそば（500m以内）', label: '川・海・低地がすぐそば（500m以内）' },
                    { value: '近く（500m〜1km）', label: '近くにある（500m〜1km）' },
                    { value: 'なし・遠い', label: 'ない・遠い' },
                  ] as { value: RiverProximity; label: string }[]).map(v => (
                    <button key={v.value} type="button" onClick={() => set('riverProximity', v.value)}
                      className={`w-full text-left py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                        data.riverProximity === v.value ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white text-gray-600'
                      }`}>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  土砂災害リスク <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: 'はい（ハザードマップで確認済）', label: 'あり（確認済）' },
                    { value: 'おそらくある', label: 'おそらくある' },
                    { value: 'いいえ', label: 'なし' },
                    { value: '分からない', label: '分からない' },
                  ] as { value: LandslideRisk; label: string }[]).map(v => (
                    <button key={v.value} type="button" onClick={() => set('landslideRisk', v.value)}
                      className={`py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        data.landslideRisk === v.value ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white text-gray-600'
                      }`}>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  津波リスク <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['あり', 'なし', '分からない'] as const).map(v => (
                    <button key={v} type="button" onClick={() => set('tsunamiRisk', v)}
                      className={`py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        data.tsunamiRisk === v ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white text-gray-600'
                      }`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ペット同行避難所の確認状況 <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {([
                    { value: 'ペット同行可の避難所を確認済', label: '確認済（ペット可の避難所を知っている）' },
                    { value: '避難所の場所は知っているがペット可否不明', label: '場所は知っているがペット可否は不明' },
                    { value: '未確認', label: '未確認（何も把握していない）' },
                  ] as { value: ShelterConfirmed; label: string }[]).map(v => (
                    <button key={v.value} type="button" onClick={() => set('shelterConfirmed', v.value)}
                      className={`w-full text-left py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                        data.shelterConfirmed === v.value ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white text-gray-600'
                      }`}>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: 備蓄確認 */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ペットフードの備蓄量 <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {([
                    { value: '3日未満', label: '3日未満（ほぼ備蓄なし）' },
                    { value: '3〜5日', label: '3〜5日分' },
                    { value: '1週間', label: '1週間分' },
                    { value: '2週間', label: '2週間分' },
                    { value: '1か月以上', label: '1か月以上' },
                  ] as { value: FoodStock; label: string }[]).map(v => (
                    <button key={v.value} type="button" onClick={() => set('foodStock', v.value)}
                      className={`w-full text-left py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                        data.foodStock === v.value ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white text-gray-600'
                      }`}>
                      {v.label}
                    </button>
                  ))}
                </div>
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
                    <button key={v.value} type="button" onClick={() => set('waterStock', v.value)}
                      className={`w-full text-left py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                        data.waterStock === v.value ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white text-gray-600'
                      }`}>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  持っているもの <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {([
                    { key: 'hasCrate', label: '🧳 移動用キャリー・クレート', desc: '同行避難の必須アイテム' },
                    { key: 'hasIdTag', label: '🏷️ 迷子札（名前・連絡先入り）', desc: '災害時の迷子防止に必須' },
                  ] as { key: keyof DiagnosisFormData; label: string; desc: string }[]).map(item => (
                    <button key={item.key} type="button"
                      onClick={() => setData(prev => ({ ...prev, [item.key]: prev[item.key] === 'ある' ? 'ない' : 'ある' }))}
                      className={`w-full flex items-center justify-between py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                        data[item.key] === 'ある' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white text-gray-600'
                      }`}>
                      <div className="text-left">
                        <p>{item.label}</p>
                        <p className="text-xs text-gray-400 font-normal">{item.desc}</p>
                      </div>
                      <span className="text-lg">{data[item.key] === 'ある' ? '✅' : '○'}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  ※ マイクロチップ・救急セット・診察記録は完全版で詳しく診断できます
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800">
                🐾 回答が完了しました！「AI診断を開始する」ボタンを押すと、
                うちの子専用の防災レポートを生成します（30〜60秒）。
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
              className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              次へ →
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={!isValid() || loading}
              className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  AI が診断中…（30〜60秒）
                </span>
              ) : 'AI診断を開始する 🐾'}
            </button>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          より詳しく診断したい方は
          <a href="/diagnosis/pro" className="text-violet-600 underline ml-1">完全版（PRO）を試す →</a>
        </p>
      </div>
    </div>
  )
}
