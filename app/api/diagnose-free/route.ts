import { NextRequest, NextResponse } from 'next/server'
import type { DiagnosisFormData } from '@/lib/types'
import { calcRiskScores } from '@/lib/scoring'
import { generateFreeReport } from '@/lib/freeReport'

// 無料版診断：ルールベース、AI 不使用、無制限
export async function POST(req: NextRequest) {
  try {
    const formData: DiagnosisFormData = await req.json()

    const scores = calcRiskScores(formData)
    const report = generateFreeReport(formData, scores)

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[diagnose-free] mode=ruleset user=${formData.petName ?? '(unnamed)'}`)
    }

    return NextResponse.json({ report, scores, formData })
  } catch (err) {
    console.error('[diagnose-free] error:', err)
    return NextResponse.json(
      { error: '診断に失敗しました' },
      { status: 500 }
    )
  }
}
