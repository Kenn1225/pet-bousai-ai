'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/diagnosis'

  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? '認証に失敗しました')
        setLoading(false)
        return
      }
      router.push(redirect)
    } catch {
      setError('通信エラーが発生しました。時間をおいて再度お試しください。')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
            <span className="text-3xl">🐾</span>
          </div>
          <h1 className="text-xl font-black text-gray-900 mb-1">
            うちの子専用防災メソッド
          </h1>
          <p className="text-xs text-gray-500">
            本サービスは登録会員専用です
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-base font-bold text-gray-800 mb-1">アクセスコードを入力</h2>
          <p className="text-xs text-gray-400 mb-6 leading-relaxed">
            事務局からお送りしたアクセスコードを入力してください。<br />
            コードをお持ちでない方は
            <a href="/lp" className="text-emerald-600 underline ml-1">こちら</a>
            からお申し込みください。
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="例：PBA2024-001"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-mono tracking-widest text-center focus:outline-none focus:border-emerald-400 transition-colors"
              autoComplete="off"
              spellCheck={false}
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 text-center">
                ❌ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!code.trim() || loading}
              className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  確認中…
                </span>
              ) : 'ログイン →'}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400 mb-2">まだ登録されていない方</p>
          <a href="/lp"
            className="inline-block px-6 py-2.5 border border-emerald-400 text-emerald-600 text-sm font-semibold rounded-xl hover:bg-emerald-50 transition-colors">
            サービスの詳細を見る →
          </a>
        </div>

        <div className="mt-4 text-center">
          <a href="/diagnosis/line"
            className="text-xs text-gray-400 underline">
            まずは無料簡易診断を試す（登録不要）
          </a>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <AuthForm />
    </Suspense>
  )
}
