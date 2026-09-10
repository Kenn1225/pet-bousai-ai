import { NextRequest, NextResponse } from 'next/server'
import type { LocationFormData } from '@/lib/locationTypes'
import { calcLocationRiskScores } from '@/lib/locationScoring'
import { generateLocationFreeReport } from '@/lib/locationFreeReport'

// 無料版診断（ルールベース、AI不使用、無制限、0円）
export async function POST(req: NextRequest) {
  try {
    const formData: LocationFormData = await req.json()

    // バリデーション
    if (!formData.postalCode || !formData.petType) {
      return NextResponse.json({ error: '郵便番号とペット種類は必須です' }, { status: 400 })
    }

    // スコア計算
    const scores = calcLocationRiskScores(formData)

    // ルールベースレポート生成
    const report = generateLocationFreeReport(formData, scores)

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[diagnose-location-free] mode=free_ruleset prefecture=${scores.matchLevel === 'city' ? 'city' : 'pref'} pet=${formData.petType}`)
    }

    return NextResponse.json({ report, scores, formData })
  } catch (err) {
    console.error('[diagnose-location-free] error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '診断に失敗しました' },
      { status: 500 }
    )
  }
}
