import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { LocationFormData, LocationDiagnosisReport } from '@/lib/locationTypes'
import { calcLocationRiskScores } from '@/lib/locationScoring'
import { buildLocationPrompt } from '@/lib/locationPrompt'
import { generateLocationFreeReport } from '@/lib/locationFreeReport'
import { DISASTER_MASTER } from '@/lib/disasterMaster'
import { getMunicipalPetLink } from '@/lib/municipalLinks'

const MODEL = process.env.DIAGNOSE_MODEL ?? 'claude-haiku-4-5'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export const maxDuration = 60

function repairAndParseJson(raw: string) {
  // 1. コードブロック削除
  let clean = raw.replace(/```(?:json)?\n?/g, '').trim()

  // 2. 末尾の非JSON文字を削除
  const lastBrace = Math.max(clean.lastIndexOf('}'), clean.lastIndexOf(']'))
  if (lastBrace !== -1) {
    clean = clean.substring(0, lastBrace + 1)
  }

  // 3. 末尾のカンマ削除
  clean = clean.replace(/,\s*([}\]])/g, '$1').replace(/,\s*$/, '')

  try {
    return JSON.parse(clean)
  } catch {
    /* fall through */
  }

  // 4. 括弧のバランスを取る
  const opens = (clean.match(/[{[]/g) ?? []).length
  const closes = (clean.match(/[}\]]/g) ?? []).length
  let repaired = clean
  for (let i = closes; i < opens; i++) {
    repaired += i % 2 === 0 ? ']' : '}'
  }

  try {
    return JSON.parse(repaired)
  } catch {
    /* fall through */
  }

  // 5. 最終手段：深さベースの強制クロージング
  const depth = { obj: 0, arr: 0 }
  for (const ch of clean) {
    if (ch === '{') depth.obj++
    else if (ch === '}') depth.obj--
    else if (ch === '[') depth.arr++
    else if (ch === ']') depth.arr--
  }
  let forced = clean
  for (let i = 0; i < depth.arr; i++) forced += ']'
  for (let i = 0; i < depth.obj; i++) forced += '}'
  return JSON.parse(forced)
}

export async function POST(req: NextRequest) {
  try {
    const formData: LocationFormData = await req.json()

    if (!formData.postalCode || !formData.petType) {
      return NextResponse.json({ error: '郵便番号とペット種類は必須です' }, { status: 400 })
    }

    const scores = calcLocationRiskScores(formData)
    const prompt = buildLocationPrompt(formData, scores)

    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })
    const message = await stream.finalMessage()

    const rawText = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('')

    const jsonMatch = rawText.match(/\{[\s\S]*/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'AI からの JSON 取得に失敗しました' }, { status: 500 })
    }

    const aiOutput = repairAndParseJson(jsonMatch[0])

    // 無料版レポートをベースに AI 出力で強化
    const freeReport = generateLocationFreeReport(formData, scores)
    const location = freeReport.location

    // AI が書いたテキスト（創造的な部分）を組み込む
    const report: LocationDiagnosisReport = {
      ...freeReport,
      summary: {
        catchCopy: aiOutput.summary?.catchCopy ?? freeReport.summary.catchCopy,
        overallMessage: aiOutput.summary?.overallMessage ?? freeReport.summary.overallMessage,
      },
      topDisasters: (aiOutput.topDisasters ?? []).slice(0, 3).map((ai: any, idx: number) => {
        const base = freeReport.topDisasters[idx]
        return {
          ...base,
          firstAction: ai.firstAction ?? base.firstAction,
          petAction: ai.petAction ?? base.petAction,
          caution: ai.caution ?? base.caution,
        }
      }),
      petSpecificAdvice: aiOutput.petSpecificAdvice ?? freeReport.petSpecificAdvice,
      essentialSupplies: (aiOutput.essentialSupplies ?? freeReport.essentialSupplies).slice(0, 4),
      finalAdvice: aiOutput.finalAdvice ?? freeReport.finalAdvice,
    }

    if (process.env.NODE_ENV !== 'production') {
      const u = message.usage
      console.log(`[diagnose-location] model=${MODEL} in=${u.input_tokens} out=${u.output_tokens} prefecture=${location.matchLevel}`)
    }

    return NextResponse.json({ report, scores, formData })
  } catch (err) {
    console.error('[diagnose-location] error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '診断に失敗しました' },
      { status: 500 }
    )
  }
}
