'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const hasCookie = document.cookie.split('; ').some(row => row.startsWith('pet_auth='))
    if (!hasCookie) {
      router.push('/auth?redirect=/')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50">
      {/* Hero */}
      <section className="px-4 pt-20 pb-10 text-center max-w-lg mx-auto">
        <div className="inline-block bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-widest">
          無料 AI 診断
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-4 leading-tight">
          AI でつくる<br />
          <span className="text-emerald-600">うちの子専用</span><br />
          防災メソッド
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed mb-8">
          ペットの健康・行動・住環境を AI が分析し、
          あなたのペットだけの防災レポートを生成します。
        </p>
      </section>

      {/* 2択カード */}
      <section className="max-w-lg mx-auto px-4 pb-16 space-y-4">

        {/* 簡易版 */}
        <div className="bg-white rounded-2xl border-2 border-emerald-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">簡易版</span>
            <span className="text-xs text-gray-400">⏱ 約5分・30問</span>
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-1">はじめての防災チェック</h2>
          <p className="text-xs text-gray-500 leading-relaxed mb-4">
            ペットの基本情報と住環境を入力するだけ。
            AIがリスクを採点して、今すぐできる対策を提案します。
          </p>
          <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-gray-500">
            <div className="flex gap-1 items-center"><span className="text-emerald-500">✓</span> H・E・S 3軸スコア診断</div>
            <div className="flex gap-1 items-center"><span className="text-emerald-500">✓</span> 優先対策 TOP3</div>
            <div className="flex gap-1 items-center"><span className="text-emerald-500">✓</span> 備蓄リスト生成</div>
            <div className="flex gap-1 items-center"><span className="text-emerald-500">✓</span> 避難アクションプラン</div>
          </div>
          <Link href="/diagnosis"
            className="flex items-center justify-center w-full py-3 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 active:scale-95 transition-all">
            🐾 簡易版で診断する
          </Link>
        </div>

        {/* 完全版 */}
        <div className="bg-white rounded-2xl border-2 border-violet-300 shadow-md p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
            PRO
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full">完全版</span>
            <span className="text-xs text-gray-400">⏱ 約10分・50問</span>
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-1">プロ仕様の防災診断</h2>
          <p className="text-xs text-gray-500 leading-relaxed mb-4">
            環境省認定22種のペット・18疾患・10点行動スコアに対応。
            避難所リスクや緊急連絡先まで含む詳細レポートを生成します。
          </p>
          <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-gray-500">
            <div className="flex gap-1 items-center"><span className="text-violet-500">✓</span> 22種のペット対応</div>
            <div className="flex gap-1 items-center"><span className="text-violet-500">✓</span> 18疾患・解説リンク</div>
            <div className="flex gap-1 items-center"><span className="text-violet-500">✓</span> 10点行動スコア診断</div>
            <div className="flex gap-1 items-center"><span className="text-violet-500">✓</span> 避難所リスク詳細</div>
            <div className="flex gap-1 items-center"><span className="text-violet-500">✓</span> 郵便番号→市町村リンク</div>
            <div className="flex gap-1 items-center"><span className="text-violet-500">✓</span> Amazon備蓄リンク付き</div>
          </div>
          <Link href="/diagnosis/pro"
            className="flex items-center justify-center w-full py-3 bg-violet-600 text-white text-sm font-bold rounded-xl hover:bg-violet-700 active:scale-95 transition-all">
            🐾 完全版（PRO）で診断する
          </Link>
        </div>
      </section>

      {/* 特徴 */}
      <section className="max-w-lg mx-auto px-4 pb-16">
        <h2 className="text-center text-sm font-bold text-gray-400 tracking-widest mb-6">共通の診断機能</h2>
        <div className="space-y-4">
          {[
            {
              icon: '🎯',
              title: 'H・E・S 3軸スコア診断',
              desc: '健康リスク・避難難易度・備蓄充足度を数値化。弱点が一目でわかります。',
            },
            {
              icon: '📋',
              title: 'うちの子専用アクションプラン',
              desc: '「避難開始から60分以内にやること」をペット別に具体的に提示。',
            },
            {
              icon: '🗺️',
              title: '郵便番号から地域の防災情報へ',
              desc: '入力した郵便番号から市区町村のペット防災ページへ自動リンク。',
            },
            {
              icon: '🛒',
              title: '優先度付き備蓄リスト',
              desc: '「今すぐ買うべきもの」をAIが優先度1〜3で分類してリストアップ。',
            },
          ].map(f => (
            <div key={f.title} className="flex gap-4 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <span className="text-2xl">{f.icon}</span>
              <div>
                <p className="text-sm font-bold text-gray-800">{f.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-emerald-700 text-white py-12 px-4 text-center">
        <p className="text-xs tracking-widest mb-3 opacity-80">ペット防災の第一歩をAIと一緒に</p>
        <h2 className="text-xl font-bold mb-6">今日から始める<br />うちの子防災</h2>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-sm mx-auto">
          <Link href="/diagnosis"
            className="w-full flex items-center justify-center px-6 py-3 bg-white text-emerald-700 text-sm font-bold rounded-xl shadow-md hover:bg-emerald-50 active:scale-95 transition-all">
            🐾 簡易版（5分）
          </Link>
          <Link href="/diagnosis/pro"
            className="w-full flex items-center justify-center px-6 py-3 bg-violet-500 text-white text-sm font-bold rounded-xl shadow-md hover:bg-violet-400 active:scale-95 transition-all">
            🐾 完全版PRO（10分）
          </Link>
        </div>
      </section>

      <footer className="text-center py-8 text-xs text-gray-400">
        © 一般社団法人ペット防災アドバイザー協会
      </footer>
    </div>
  )
}
