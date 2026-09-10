'use client'

import { useState } from 'react'

type PetType = '犬' | '猫' | 'うさぎ・小動物' | '鳥' | 'その他'
type AgeGroup = '0〜1歳' | '2〜7歳' | '8歳以上'
type FoodStock = '3日未満' | '3日〜1週間' | '1週間以上'
type FloorGroup = '1〜2階・戸建て' | '3〜5階' | '6階以上'
type ShelterCheck = '確認済み（ペット可）' | '場所は知っているが可否不明' | '未確認'

interface Answers {
  petType: PetType | null
  age: AgeGroup | null
  food: FoodStock | null
  floor: FloorGroup | null
  shelter: ShelterCheck | null
}

const STEPS = 5

function calcScore(a: Answers): number {
  let score = 20
  if (a.age === '0〜1歳') score += 15
  else if (a.age === '2〜7歳') score += 20
  else if (a.age === '8歳以上') score += 0
  if (a.food === '3日未満') score += 0
  else if (a.food === '3日〜1週間') score += 20
  else if (a.food === '1週間以上') score += 30
  if (a.floor === '1〜2階・戸建て') score += 25
  else if (a.floor === '3〜5階') score += 15
  else if (a.floor === '6階以上') score += 5
  if (a.shelter === '確認済み（ペット可）') score += 25
  else if (a.shelter === '場所は知っているが可否不明') score += 10
  else if (a.shelter === '未確認') score += 0
  return Math.min(score, 100)
}

function getResult(score: number) {
  if (score >= 65) return {
    label: 'A判定：基本的な備えができています',
    color: 'bg-emerald-600',
    textColor: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: '✅',
    message: '基本的な準備はできています。ただし、実際の避難シミュレーションや持病のある子への対応など、さらに深い備えが必要です。完全版診断でより詳しいレポートを受け取りましょう。',
  }
  if (score >= 40) return {
    label: 'B判定：改善が必要です',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: '⚠️',
    message: 'いくつかの重要な備えが不足しています。このまま災害が起きると、ペットを守り切れないリスクがあります。完全版診断で優先的に対処すべき課題を確認してください。',
  }
  return {
    label: 'C判定：早急な対応が必要です',
    color: 'bg-red-600',
    textColor: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: '🚨',
    message: '備えが著しく不足しています。東日本大震災・能登半島地震でペットを失った方の多くが同じ状況でした。今すぐ完全版診断で具体的な対策リストを受け取ってください。',
  }
}

function Btn({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={`w-full text-left py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
        selected
          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
          : 'border-gray-200 bg-white text-gray-700 active:bg-gray-50'
      }`}>
      {children}
    </button>
  )
}

export default function LineDiagnosisPage() {
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState<Answers>({
    petType: null, age: null, food: null, floor: null, shelter: null,
  })
  const [showResult, setShowResult] = useState(false)

  function next() {
    if (step < STEPS) setStep(s => s + 1)
    else setShowResult(true)
  }

  function isStepValid() {
    if (step === 1) return !!answers.petType
    if (step === 2) return !!answers.age
    if (step === 3) return !!answers.food
    if (step === 4) return !!answers.floor
    if (step === 5) return !!answers.shelter
    return false
  }

  const score = calcScore(answers)
  const result = getResult(score)

  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-sm mx-auto px-4 py-8 space-y-5">
          <div className="text-center">
            <p className="text-xs text-emerald-600 font-bold tracking-widest mb-1">診断結果</p>
            <h1 className="text-lg font-black text-gray-900">うちの子の防災スコア</h1>
          </div>

          <div className={`rounded-2xl p-6 text-center ${result.bg} border-2 ${result.border}`}>
            <div className="text-5xl mb-2">{result.icon}</div>
            <div className="text-4xl font-black text-gray-900 mb-1">{score}<span className="text-lg font-normal text-gray-500">/100点</span></div>
            <div className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${result.color} text-white mt-1`}>
              {result.label}
            </div>
            <p className={`text-xs mt-3 leading-relaxed ${result.textColor}`}>{result.message}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <p className="text-xs font-bold text-gray-500 tracking-widest text-center">あなたの回答</p>
            {[
              { label: 'ペットの種類', value: answers.petType },
              { label: '年齢', value: answers.age },
              { label: '食料備蓄', value: answers.food },
              { label: '居住環境', value: answers.floor },
              { label: '避難所確認', value: answers.shelter },
            ].map(r => (
              <div key={r.label} className="flex justify-between text-sm">
                <span className="text-gray-500">{r.label}</span>
                <span className="font-semibold text-gray-800">{r.value}</span>
              </div>
            ))}
          </div>

          <div className="bg-[#06C755] rounded-2xl p-5 text-center">
            <p className="text-white text-xs font-bold mb-1 opacity-90">完全版診断（登録者限定）</p>
            <p className="text-white text-base font-black mb-2">
              AIが18疾患・行動特性まで<br />分析する詳細レポートを受け取る
            </p>
            <p className="text-white text-xs opacity-80 mb-4 leading-relaxed">
              自然災害危機管理士 × ペット災害危機管理士 監修<br />
              アクセスコードは公式LINEで配布中
            </p>
            <a href="https://line.me/R/ti/p/@941zsnxl"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#06C755] font-black text-sm px-6 py-3 rounded-xl shadow active:scale-95 transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#06C755"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
              LINE友だち追加 →
            </a>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
            <p className="text-xs text-amber-600 font-bold mb-1">修了後は副業・地域活動で活躍</p>
            <p className="text-sm font-black text-gray-800 mb-2">
              ペット防災アドバイザー<br />養成プログラム（330,000円）
            </p>
            <a href="/lp"
              className="inline-block text-xs text-amber-600 underline font-semibold">
              プログラムの詳細を見る →
            </a>
          </div>

          <button type="button" onClick={() => { setShowResult(false); setStep(1); setAnswers({ petType: null, age: null, food: null, floor: null, shelter: null }) }}
            className="w-full py-2.5 border border-gray-300 text-gray-500 rounded-xl text-xs hover:bg-gray-50 transition-colors">
            もう一度診断する
          </button>

          <p className="text-center text-xs text-gray-400 pb-2">
            © 一般社団法人ペット防災アドバイザー協会
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-sm mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <p className="text-xs text-emerald-600 font-bold tracking-widest mb-1">無料・即時診断</p>
          <h1 className="text-xl font-black text-gray-900 mb-1">うちの子防災チェック</h1>
          <p className="text-xs text-gray-400">5問・1分で完了します</p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>STEP {step} / {STEPS}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${(step / STEPS) * 100}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">

          {step === 1 && (
            <div className="space-y-3">
              <h2 className="text-base font-bold text-gray-800 mb-4">ペットの種類は？</h2>
              {(['犬', '猫', 'うさぎ・小動物', '鳥', 'その他'] as PetType[]).map(v => (
                <Btn key={v} selected={answers.petType === v} onClick={() => setAnswers(a => ({ ...a, petType: v }))}>
                  {v === '犬' ? '🐕 犬' : v === '猫' ? '🐈 猫' : v === 'うさぎ・小動物' ? '🐇 うさぎ・小動物' : v === '鳥' ? '🦜 鳥' : '🐾 その他'}
                </Btn>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h2 className="text-base font-bold text-gray-800 mb-4">ペットの年齢は？</h2>
              {([
                { v: '0〜1歳', desc: '子犬・子猫・幼体期', icon: '🌱' },
                { v: '2〜7歳', desc: '青年期・成熟期', icon: '🌿' },
                { v: '8歳以上', desc: 'シニア期（健康管理が特に重要）', icon: '🍂' },
              ] as { v: AgeGroup; desc: string; icon: string }[]).map(({ v, desc, icon }) => (
                <Btn key={v} selected={answers.age === v} onClick={() => setAnswers(a => ({ ...a, age: v }))}>
                  <span className="mr-2">{icon}</span>
                  <span className="font-bold">{v}</span>
                  <span className="text-xs text-gray-400 ml-2">{desc}</span>
                </Btn>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <h2 className="text-base font-bold text-gray-800 mb-1">フード・水の備蓄量は？</h2>
              <p className="text-xs text-gray-400 mb-4">環境省推奨：最低5日分以上</p>
              {([
                { v: '3日未満', desc: 'ほぼ備蓄なし', icon: '🔴' },
                { v: '3日〜1週間', desc: '最低ライン', icon: '🟡' },
                { v: '1週間以上', desc: '安心できるレベル', icon: '🟢' },
              ] as { v: FoodStock; desc: string; icon: string }[]).map(({ v, desc, icon }) => (
                <Btn key={v} selected={answers.food === v} onClick={() => setAnswers(a => ({ ...a, food: v }))}>
                  <span className="mr-2">{icon}</span>
                  <span className="font-bold">{v}</span>
                  <span className="text-xs text-gray-400 ml-2">{desc}</span>
                </Btn>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <h2 className="text-base font-bold text-gray-800 mb-1">お住まいの環境は？</h2>
              <p className="text-xs text-gray-400 mb-4">高層階ほどペットを連れた避難が困難になります</p>
              {([
                { v: '1〜2階・戸建て', desc: '最も避難しやすい', icon: '🏠' },
                { v: '3〜5階', desc: 'EV停止時は要注意', icon: '🏢' },
                { v: '6階以上', desc: '事前計画が必須', icon: '🏙️' },
              ] as { v: FloorGroup; desc: string; icon: string }[]).map(({ v, desc, icon }) => (
                <Btn key={v} selected={answers.floor === v} onClick={() => setAnswers(a => ({ ...a, floor: v }))}>
                  <span className="mr-2">{icon}</span>
                  <span className="font-bold">{v}</span>
                  <span className="text-xs text-gray-400 ml-2">{desc}</span>
                </Btn>
              ))}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3">
              <h2 className="text-base font-bold text-gray-800 mb-1">ペット同行できる避難所は？</h2>
              <p className="text-xs text-gray-400 mb-4">全国の避難所の約4割がペット受け入れ不可</p>
              {([
                { v: '確認済み（ペット可）', desc: '準備万端', icon: '✅' },
                { v: '場所は知っているが可否不明', desc: '要確認', icon: '❓' },
                { v: '未確認', desc: 'リスク大', icon: '⚠️' },
              ] as { v: ShelterCheck; desc: string; icon: string }[]).map(({ v, desc, icon }) => (
                <Btn key={v} selected={answers.shelter === v} onClick={() => setAnswers(a => ({ ...a, shelter: v }))}>
                  <span className="mr-2">{icon}</span>
                  <span className="font-bold text-sm leading-snug">{v}</span>
                  <span className="text-xs text-gray-400 ml-2">{desc}</span>
                </Btn>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {step > 1 && (
            <button type="button" onClick={() => setStep(s => s - 1)}
              className="flex-1 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              ← 戻る
            </button>
          )}
          <button type="button" onClick={next} disabled={!isStepValid()}
            className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {step < STEPS ? '次へ →' : '結果を見る 🐾'}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          より詳しい診断は
          <a href="/lp" className="text-emerald-600 underline ml-1">こちら（登録者限定）</a>
        </p>
      </div>
    </div>
  )
}
