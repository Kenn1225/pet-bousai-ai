import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { DiagnosisFormData, DiagnosisReport } from '@/lib/types'
import { calcRiskScores } from '@/lib/scoring'
import { buildDiagnosisPrompt } from '@/lib/prompts'
import { enrichReport } from '@/lib/reportDefaults'

function repairAndParseJson(raw: string): DiagnosisReport {
  const clean = raw.replace(/,\s*([}\]])/g, '$1')
  try {
    return JSON.parse(clean)
  } catch {
    // fall through
  }

  const opens = (clean.match(/[{[]/g) ?? []).length
  const closes = (clean.match(/[}\]]/g) ?? []).length
  let repaired = clean.trimEnd().replace(/,\s*$/, '')
  for (let i = closes; i < opens; i++) {
    repaired += repaired.includes('"finalAdvice"') ? '"' : ']'
  }
  repaired += '}'
  try {
    return JSON.parse(repaired)
  } catch {
    // fall through
  }

  const depth = { obj: 0, arr: 0 }
  for (const ch of clean) {
    if (ch === '{') depth.obj++
    else if (ch === '}') depth.obj--
    else if (ch === '[') depth.arr++
    else if (ch === ']') depth.arr--
  }
  let forced = clean.trimEnd().replace(/,\s*$/, '')
  for (let i = 0; i < depth.arr; i++) forced += ']'
  for (let i = 0; i < depth.obj; i++) forced += '}'
  return JSON.parse(forced)
}

export async function POST(req: NextRequest) {
  try {
    const formData: DiagnosisFormData = await req.json()

    // API キー確認
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY が設定されていません')
    }

    // スコア計算
    const scores = calcRiskScores(formData)

    // AI版のプロンプト生成
    const prompt = buildDiagnosisPrompt(formData, scores)

    // Claude API クライアント作成（リクエスト時）
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    // Claude API を呼び出し（ストリーミングで確実に応答を取得）
    const message = await client.messages.create({
      model: process.env.DIAGNOSE_MODEL ?? 'claude-haiku-4-5-20251001',
      max_tokens: 6000,
      messages: [{ role: 'user', content: prompt }],
    })

    const rawText = message.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('')

    if (!rawText) {
      throw new Error('Claude から空の応答を受け取りました')
    }

    // JSON を抽出
    const jsonMatch = rawText.match(/\{[\s\S]*/)
    if (!jsonMatch) {
      console.error('[diagnose] Raw response:', rawText.substring(0, 500))
      throw new Error('Claude からの JSON 抽出に失敗しました')
    }

    // JSON をパースして修復
    let report: DiagnosisReport = repairAndParseJson(jsonMatch[0])
    report.riskScores = scores

    // reportDefaults で後付け強化
    enrichReport(report, formData)

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[diagnose] mode=ai success pet=${formData.pets?.[0]?.type ?? 'unknown'}`)
    }

    return NextResponse.json({ report, scores, formData })
  } catch (err) {
    console.error('[diagnose] error:', err instanceof Error ? err.message : err)
    const errorMsg = err instanceof Error ? err.message : '診断中にエラーが発生しました'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
