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
    console.log('[diagnose] Request started')
    const formData: DiagnosisFormData = await req.json()
    console.log(`[diagnose] Received formData for pet: ${formData.pets?.[0]?.type}`)

    // API キー確認
    if (!process.env.ANTHROPIC_API_KEY) {
      const msg = 'ANTHROPIC_API_KEY が設定されていません'
      console.error(`[diagnose] ${msg}`)
      return NextResponse.json({ error: msg }, { status: 500 })
    }

    // スコア計算
    console.log('[diagnose] Calculating scores...')
    const scores = calcRiskScores(formData)
    console.log(`[diagnose] Scores calculated: overall=${scores.overall}`)

    // AI版のプロンプト生成
    console.log('[diagnose] Building prompt...')
    const prompt = buildDiagnosisPrompt(formData, scores)
    console.log(`[diagnose] Prompt length: ${prompt.length} chars`)

    // Claude API クライアント作成（リクエスト時）
    console.log('[diagnose] Creating Anthropic client...')
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    // Claude API を呼び出し
    console.log('[diagnose] Calling Claude API...')
    const model = process.env.DIAGNOSE_MODEL ?? 'claude-haiku-4-5-20251001'
    console.log(`[diagnose] Model: ${model}`)

    const message = await client.messages.create({
      model,
      max_tokens: 6000,
      messages: [{ role: 'user', content: prompt }],
    })

    console.log(`[diagnose] Claude API response received. Content blocks: ${message.content.length}`)

    const rawText = message.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('')

    console.log(`[diagnose] Raw text length: ${rawText.length}`)

    if (!rawText) {
      const msg = 'Claude から空の応答を受け取りました'
      console.error(`[diagnose] ${msg}`)
      return NextResponse.json({ error: msg }, { status: 500 })
    }

    // JSON を抽出
    const jsonMatch = rawText.match(/\{[\s\S]*/)
    if (!jsonMatch) {
      console.error('[diagnose] JSON extraction failed')
      console.error('[diagnose] Raw response:', rawText.substring(0, 1000))
      const msg = 'Claude からの JSON 抽出に失敗しました'
      return NextResponse.json({ error: msg }, { status: 500 })
    }

    // JSON をパースして修復
    console.log('[diagnose] Parsing JSON...')
    let report: DiagnosisReport
    try {
      report = repairAndParseJson(jsonMatch[0])
      console.log('[diagnose] JSON parsed successfully')
    } catch (parseErr) {
      console.error('[diagnose] JSON parse error:', parseErr instanceof Error ? parseErr.message : parseErr)
      console.error('[diagnose] Attempted to parse:', jsonMatch[0].substring(0, 500))
      throw parseErr
    }

    report.riskScores = scores

    // reportDefaults で後付け強化
    console.log('[diagnose] Enriching report...')
    enrichReport(report, formData)
    console.log('[diagnose] Report enriched')

    console.log(`[diagnose] ✅ Success: pet=${formData.pets?.[0]?.type}`)

    return NextResponse.json({ report, scores, formData })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('[diagnose] ❌ Error:', errorMsg)
    console.error('[diagnose] Stack:', err instanceof Error ? err.stack : 'N/A')
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
