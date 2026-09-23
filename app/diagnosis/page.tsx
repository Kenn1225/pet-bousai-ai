'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DiagnosisSelectPage() {
  const router = useRouter()

  useEffect(() => {
    const hasCookie = document.cookie.split('; ').some(row => row.startsWith('pet_auth='))
    if (!hasCookie) {
      router.push('/auth?redirect=/diagnosis')
    }
  }, [router])


  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <p className="text-xs text-amber-600 font-semibold tracking-widest mb-2">ペット防災診断</p>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">3つの診断方法から選ぶ</h1>
          <p className="text-gray-600">あなたのニーズに合わせて、最適な診断方法をお選びください</p>
        </div>

        {/* 3つの診断方法 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* 無料版 */}
          <Link href="/diagnosis/free"
            className="group bg-white rounded-2xl shadow-md border border-gray-200 p-8 hover:shadow-lg hover:border-emerald-400 transition-all duration-300 cursor-pointer">
            <div className="text-4xl mb-4">🐾</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">うちの子防災メソッド</h2>
            <p className="text-sm text-gray-600 mb-4">
              5ステップ・30問でAIが防災レポートを作成。ペットの詳細情報から最適な避難計画を診断
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>5分程度で完了</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>ペット個別の詳細診断</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>パスワード不要</span>
              </div>
            </div>
            <div className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold group-hover:bg-emerald-700 transition-colors">
              診断結果 →
            </div>
          </Link>

          {/* Pro版 */}
          <Link href="/diagnosis/pro"
            className="group bg-white rounded-2xl shadow-md border border-gray-200 p-8 hover:shadow-lg hover:border-violet-400 transition-all duration-300 cursor-pointer">
            <div className="text-4xl mb-4">👑</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">完全版（PRO）</h2>
            <p className="text-sm text-gray-600 mb-4">
              最も詳細な診断。行動スコア・住環境・ペット可能な避難所をすべてカバー。プロフェッショナル向け
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-violet-600 font-bold">✓</span>
                <span>最も詳細な診断</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-violet-600 font-bold">✓</span>
                <span>行動スコア・詳細評価</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-violet-600 font-bold">✓</span>
                <span>パスワード認証あり</span>
              </div>
            </div>
            <div className="inline-block px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-semibold group-hover:bg-violet-700 transition-colors">
              詳細診断 →
            </div>
          </Link>

          {/* 郵便番号版 */}
          <Link href="/diagnosis/location"
            className="group bg-white rounded-2xl shadow-md border border-gray-200 p-8 hover:shadow-lg hover:border-amber-400 transition-all duration-300 cursor-pointer">
            <div className="text-4xl mb-4">📍</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">災害リスク × ペット同行避難</h2>
            <p className="text-sm text-gray-600 mb-4">
              郵便番号だけで地域の災害リスクを判定。南海トラフ・地震・台風など想定される災害を即座に把握
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-amber-600 font-bold">✓</span>
                <span>郵便番号のみ入力</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-amber-600 font-bold">✓</span>
                <span>30秒で診断完了</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-amber-600 font-bold">✓</span>
                <span>パスワード不要</span>
              </div>
            </div>
            <div className="inline-block px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold group-hover:bg-amber-700 transition-colors">
              地域判定 →
            </div>
          </Link>
        </div>

        {/* 比較表 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-lg font-bold text-gray-800 mb-6">診断方法の比較</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">特徴</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">無料版</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Pro版</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">郵便番号版</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">診断にかかる時間</td>
                  <td className="text-center py-3 px-4">約5分</td>
                  <td className="text-center py-3 px-4">約10分</td>
                  <td className="text-center py-3 px-4">30秒</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">ペット個別診断</td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">〇</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">地域の災害リスク判定</td>
                  <td className="text-center py-3 px-4">〇</td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">行動・性格スコア</td>
                  <td className="text-center py-3 px-4">×</td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">×</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">住環境の詳細評価</td>
                  <td className="text-center py-3 px-4">×</td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">×</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">パスワード要否</td>
                  <td className="text-center py-3 px-4">不要</td>
                  <td className="text-center py-3 px-4">必要</td>
                  <td className="text-center py-3 px-4">不要</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* フッター */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>複数の診断方法を試して、最適なペット防災対策を見つけてください</p>
        </div>
      </div>
    </div>
  )
}
