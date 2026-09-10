'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { DiagnosisReport, RiskScores } from '@/lib/types'

interface ResultData {
  report: DiagnosisReport
  scores: RiskScores
}

function ScoreGauge({ label, value, invert = false }: { label: string; value: number; invert?: boolean }) {
  const displayVal = invert ? 100 - value : value
  const color = displayVal >= 80 ? 'bg-emerald-500' : displayVal >= 60 ? 'bg-yellow-400' : displayVal >= 40 ? 'bg-orange-400' : 'bg-red-500'
  const textColor = displayVal >= 80 ? 'text-emerald-600' : displayVal >= 60 ? 'text-yellow-600' : displayVal >= 40 ? 'text-orange-600' : 'text-red-600'

  return (
    <div className="text-center">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${textColor}`}>{displayVal}</div>
      <div className="h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${displayVal}%` }} />
      </div>
    </div>
  )
}

const URGENCY_STYLE: Record<string, string> = {
  '緊急': 'bg-red-100 text-red-700 border-red-200',
  '重要': 'bg-orange-100 text-orange-700 border-orange-200',
  '推奨': 'bg-blue-100 text-blue-700 border-blue-200',
}

export default function ResultPage() {
  const router = useRouter()
  const [data, setData] = useState<ResultData | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('diagnosisResult')
    if (!stored) { router.push('/diagnosis'); return }
    setData(JSON.parse(stored))
  }, [router])

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-gray-500 text-sm">読み込み中…</p>
        </div>
      </div>
    )
  }

  const { report, scores } = data

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">

        {/* キャッチコピー & 総評 */}
        <div className="bg-emerald-700 text-white rounded-2xl p-6 text-center shadow-lg">
          <p className="text-xs tracking-widest mb-2 opacity-80">あなたのペットの防災診断結果</p>
          <h1 className="text-xl font-bold mb-3">{report.summary.catchCopy}</h1>
          <p className="text-sm opacity-90 leading-relaxed">{report.summary.overallMessage}</p>
        </div>

        {/* 総合スコア */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-700 mb-4">総合診断スコア</h2>
          <div className="text-center mb-4">
            <div className="text-5xl font-black text-emerald-600">{scores.overall}</div>
            <div className="text-sm text-gray-500 mt-1">/ 100点</div>
            <div className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
              {scores.rating}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
            <ScoreGauge label="健康リスク" value={scores.healthRisk} invert />
            <ScoreGauge label="避難難易度" value={scores.evacuationDifficulty} invert />
            <ScoreGauge label="備蓄充足度" value={scores.supplyLevel} />
          </div>
        </div>

        {/* トップリスク */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-700 mb-4">優先対策 TOP3</h2>
          <div className="space-y-3">
            {report.topRisks.map(risk => (
              <div key={risk.rank} className="flex gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                  {risk.rank}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${URGENCY_STYLE[risk.urgency] ?? ''}`}>
                      {risk.urgency}
                    </span>
                    <span className="text-xs text-gray-400">{risk.category}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{risk.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{risk.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 避難アクションプラン */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-700 mb-4">避難時アクションプラン</h2>
          <div className="space-y-3">
            {[
              { time: '0〜10分', text: report.actionPlan.min0_10, color: 'bg-red-100 text-red-700' },
              { time: '10〜30分', text: report.actionPlan.min10_30, color: 'bg-orange-100 text-orange-700' },
              { time: '30〜60分', text: report.actionPlan.min30_60, color: 'bg-yellow-100 text-yellow-700' },
            ].map(({ time, text, color }) => (
              <div key={time} className="flex gap-3">
                <span className={`flex-shrink-0 text-xs font-bold px-2 py-1 rounded ${color}`}>{time}</span>
                <p className="text-xs text-gray-600 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 推奨備蓄リスト */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-700 mb-4">推奨備蓄リスト</h2>
          <div className="space-y-2">
            {report.recommendedSupplies.map((s, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                <span className={`flex-shrink-0 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${
                  s.priority === 1 ? 'bg-red-100 text-red-600' : s.priority === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {s.priority}
                </span>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-800">{s.item}</span>
                    <span className="text-xs text-gray-400">{s.quantity}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{s.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 改善ロードマップ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-700 mb-4">改善ロードマップ</h2>
          <div className="space-y-3">
            {report.improvementRoadmap.map(item => (
              <div key={item.priority} className="flex gap-3 items-start">
                <div className="flex-shrink-0 text-center">
                  <div className="w-6 h-6 rounded-full border-2 border-emerald-400 text-xs font-bold text-emerald-600 flex items-center justify-center">
                    {item.priority}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-800">{item.action}</p>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs text-emerald-600">{item.deadline}</span>
                    <span className="text-xs text-gray-400">難易度：{item.difficulty}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ペット種別アドバイス */}
        {report.petSpecificAdvice && report.petSpecificAdvice.length > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-emerald-800 mb-3">あなたのペット専用アドバイス</h2>
            <ul className="space-y-2">
              {report.petSpecificAdvice.map((advice, i) => (
                <li key={i} className="flex gap-2 text-xs text-emerald-800">
                  <span className="mt-0.5">🐾</span>
                  <span>{advice}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* チェックリスト */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-700 mb-4">防災チェックリスト</h2>
          <div className="space-y-2">
            {report.checklist.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded border-2 border-gray-300" />
                <span className="text-sm text-gray-700">{item.item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* LINE登録バナー */}
        <div className="bg-[#06C755] rounded-2xl p-6 text-center shadow-md">
          <p className="text-white text-xs font-semibold tracking-widest mb-1 opacity-90">無料プレゼント</p>
          <h3 className="text-white text-lg font-black mb-2">ペット防災完全チェックリスト（PDF）を<br />LINE友だち追加で無料プレゼント中</h3>
          <p className="text-white text-xs opacity-90 mb-4 leading-relaxed">
            自然災害危機管理士 × ペット災害危機管理士 Wライセンス保有の専門家が作成。<br />
            セミナー情報・防災ノウハウも定期配信します。
          </p>
          <a
            href="https://line.me/R/ti/p/@941zsnxl"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-white text-[#06C755] font-black text-sm px-8 py-3 rounded-xl shadow hover:bg-green-50 active:scale-95 transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#06C755"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
            LINE友だち追加（無料）
          </a>
          <p className="text-white text-xs opacity-70 mt-3">登録後すぐにPDFが届きます</p>
        </div>

        {/* 完全版への誘導 */}
        <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5 text-center">
          <p className="text-xs text-violet-600 font-bold mb-1">22種のペット × 18疾患 × 行動10点スコア</p>
          <p className="text-sm font-bold text-gray-800 mb-3">より詳しい診断は「完全版PRO」で</p>
          <a href="/diagnosis/pro"
            className="inline-block px-6 py-2.5 bg-violet-600 text-white text-sm font-bold rounded-xl hover:bg-violet-700 transition-colors">
            完全版（PRO）を試す →
          </a>
        </div>

        {/* 再診断ボタン */}
        <div className="text-center py-2">
          <button
            type="button"
            onClick={() => { sessionStorage.removeItem('diagnosisResult'); router.push('/diagnosis') }}
            className="px-6 py-3 border border-emerald-400 text-emerald-600 rounded-xl text-sm font-semibold hover:bg-emerald-50 transition-colors"
          >
            もう一度診断する
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 pb-4">
          © 一般社団法人ペット防災アドバイザー協会
        </p>
      </div>
    </div>
  )
}
