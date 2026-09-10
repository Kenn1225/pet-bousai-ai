import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { SeniorDiagnosisFormData, SeniorDiagnosisReport } from '@/lib/seniorTypes'
import { calcSeniorRiskScores } from '@/lib/seniorScoring'
import { buildSeniorDiagnosisPrompt } from '@/lib/seniorPrompt'

function repairAndParseJson(raw: string): SeniorDiagnosisReport {
  const clean = raw.replace(/,\s*([}\]])/g, '$1')
  try { return JSON.parse(clean) } catch { /* fall through */ }

  const opens = (clean.match(/[{[]/g) ?? []).length
  const closes = (clean.match(/[}\]]/g) ?? []).length
  let repaired = clean.trimEnd().replace(/,\s*$/, '')
  for (let i = closes; i < opens; i++) {
    repaired += repaired.includes('"finalAdvice"') ? '"' : ']'
  }
  repaired += '}'
  try { return JSON.parse(repaired) } catch { /* fall through */ }

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

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const formData: SeniorDiagnosisFormData = await req.json()

    const scores = calcSeniorRiskScores(formData)
    const prompt = buildSeniorDiagnosisPrompt(formData, scores)

    const message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 6000,
      messages: [{ role: 'user', content: prompt }],
    })

    const rawText = message.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('')

    const jsonMatch = rawText.match(/\{[\s\S]*/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'AI からの JSON 取得に失敗しました' }, { status: 500 })
    }

    const report: SeniorDiagnosisReport = repairAndParseJson(jsonMatch[0])
    report.riskScores = scores

    return NextResponse.json({ report, scores, formData })
  } catch (err) {
    console.error('diagnose-senior error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '診断中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
