'use client'

import { useEffect, useState } from 'react'
import type { LocationDiagnosisResult } from '@/lib/locationTypes'
import { DISASTER_MASTER } from '@/lib/disasterMaster'

export default function LocationResultPage() {
  const [result, setResult] = useState<LocationDiagnosisResult | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('locationResult')
    if (stored) {
      const parsed = JSON.parse(stored)
      const now = new Date()
      setResult({
        ...parsed,
        createdAt: now.toISOString(),
      })
    }
  }, [])

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">結果を読み込み中...</p>
        </div>
      </div>
    )
  }

  const { report, scores, formData } = result

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="mb-4">
            <p className="text-xs text-amber-600 font-semibold mb-1">診断結果</p>
            <h1 className="text-2xl font-bold text-gray-800">{report.summary.catchCopy}</h1>
            <p className="text-xs text-gray-500 mt-2">
              {report.location.prefecture}
              {report.location.city ? ` ${report.location.city}` : ''} ({report.location.matchLevel === 'city' ? '市区町村' : '都道府県'} レベル)
            </p>
          </div>

          {/* 総合評価スコア */}
          <div className="mb-4">
            <div
              className={`p-4 rounded-lg text-center ${
                scores.overall >= 75
                  ? 'bg-red-50 border border-red-200'
                  : scores.overall >= 55
                    ? 'bg-orange-50 border border-orange-200'
                    : scores.overall >= 35
                      ? 'bg-yellow-50 border border-yellow-200'
                      : 'bg-green-50 border border-green-200'
              }`}
            >
              <div className="text-3xl font-bold text-gray-800">{scores.overall}</div>
              <p className="text-xs text-gray-600 mt-1">総合リスクスコア（高いほど要注意）</p>
              <p className="text-sm font-semibold text-gray-800 mt-2">{scores.rating}</p>
            </div>
          </div>

          <p className="text-sm text-gray-700 leading-relaxed">{report.summary.overallMessage}</p>
        </div>

        {/* 想定される災害 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">想定される災害と対策</h2>
          <div className="space-y-4">
            {report.topDisasters.map((d, idx) => (
              <div key={d.disaster} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{DISASTER_MASTER[d.disaster]?.emoji}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-800">{d.disaster}</h3>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-amber-600">{d.exposure}/100</div>
                        <div className="text-xs text-gray-500">該当度</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      <strong>猶予時間:</strong> {d.leadTime}
                    </p>
                    <p className="text-xs text-gray-600 mb-2">
                      <strong>まず最初に:</strong> {d.firstAction}
                    </p>
                    <p className="text-xs text-gray-600 mb-2">
                      <strong>ペットは:</strong> {d.petAction}
                    </p>
                    <p className="text-xs text-gray-600 p-2 bg-amber-50 rounded border border-amber-200">
                      <strong>注意:</strong> {d.caution}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 必須備蓄品 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">優先的に準備すべきもの</h2>
          <div className="space-y-3">
            {report.essentialSupplies.map((s, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">{s.item}</p>
                    <p className="text-xs text-gray-600 mt-1">{s.reason}</p>
                  </div>
                  <div className={`text-xs font-bold px-2 py-1 rounded ${s.priority === 1 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    優先度{s.priority}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ペット種別アドバイス */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">ペット種固有のアドバイス</h2>
          <ul className="space-y-2">
            {report.petSpecificAdvice.map((advice, idx) => (
              <li key={idx} className="text-sm text-gray-700 flex gap-2">
                <span className="text-amber-600">▸</span>
                <span>{advice}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 最後のメッセージ */}
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-center mb-8">
          <p className="text-sm text-gray-800 leading-relaxed">{report.finalAdvice}</p>
        </div>

        {/* チェックリスト */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">備えのチェックリスト</h2>
          <div className="space-y-2">
            {report.checklist.map((item, idx) => (
              <label key={idx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" defaultChecked={item.done} className="w-4 h-4 accent-amber-600" />
                <span className="text-sm text-gray-700">{item.item}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 自治体リンク */}
        {report.municipalLink && (
          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-2">地域のペット防災ページ</h3>
            <p className="text-sm text-gray-700 mb-3">{report.municipalLink.name}</p>
            <a
              href={report.municipalLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700"
            >
              詳しく見る →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
