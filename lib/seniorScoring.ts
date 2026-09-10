import type { SeniorDiagnosisFormData, SeniorRiskScores } from './seniorTypes'

// ────────────────────────────────────────────────
// 身体機能リスク (0–100、高いほどリスク大)
// ────────────────────────────────────────────────
export function calcMobilityRisk(d: SeniorDiagnosisFormData): number {
  let score = 0

  const mobilityMap: Record<string, number> = {
    '自力でしっかり歩ける': 0, 'ふらつきがある': 25,
    '補助・介助が必要': 55, 'ほぼ歩けない・寝たきり': 80,
  }
  score += mobilityMap[d.mobility] ?? 0

  const senseMap: Record<string, number> = {
    '問題ない': 0, '衰えを感じる': 8, 'ほとんど機能していない': 15,
  }
  score += senseMap[d.vision] ?? 0
  score += (senseMap[d.hearing] ?? 0) * 0.8

  const cognitiveMap: Record<string, number> = {
    '症状なし': 0, '夜鳴き・徘徊などの兆候がある': 15, '認知症と診断済み': 25,
  }
  score += cognitiveMap[d.cognitive] ?? 0

  return Math.min(100, Math.round(score))
}

// ────────────────────────────────────────────────
// 医療継続リスク (0–100、高いほどリスク大)
// ────────────────────────────────────────────────
export function calcMedicalRisk(d: SeniorDiagnosisFormData): number {
  let score = 0

  const diseaseWeight: Record<string, number> = {
    '腎臓病': 25, '心臓病': 25, '糖尿病': 20, '関節疾患・椎間板': 12,
    'がん・腫瘍': 28, '認知症': 15, '肝臓病': 20, 'その他の慢性疾患': 12, 'なし': 0,
  }
  for (const dis of d.diseases ?? []) {
    score += diseaseWeight[dis] ?? 0
  }

  if (d.dailyMedication === 'あり') score += 15

  const stockMap: Record<string, number> = {
    '備蓄なし': 25, '3日未満': 15, '3〜7日分': 8, '1〜2週間分': 3, '1か月以上': 0,
  }
  score += stockMap[d.medStock] ?? 0

  if (d.vetContactSaved === '控えていない') score += 10

  return Math.min(100, Math.round(score))
}

// ────────────────────────────────────────────────
// 避難難易度 (0–100、高いほど困難)
// ────────────────────────────────────────────────
export function calcEvacuationDifficulty(d: SeniorDiagnosisFormData): number {
  let score = 0

  const evacMap: Record<string, number> = {
    '自力で歩いて避難できる': 0, '抱っこ・カートが必要': 25,
    'ほぼ運んでもらう必要がある（寝たきり等）': 45,
  }
  score += evacMap[d.evacuationMobility] ?? 0

  const toiletMap: Record<string, number> = {
    '問題なし': 0, 'たまに失敗する': 10, '常時おむつ・介助が必要': 20,
  }
  score += toiletMap[d.toiletStatus] ?? 0

  const stressMap: Record<string, number> = {
    '落ち着いている': 0, 'やや不安になりやすい': 10, '非常に神経質・パニックになりやすい': 20,
  }
  score += stressMap[d.stressTolerance] ?? 0

  if (d.hasElevator === 'なし・戸建て') score += 8
  if (d.hasHelper === 'いない・一人で対応') score += 15

  return Math.min(100, Math.round(score))
}

// ────────────────────────────────────────────────
// 備蓄・準備充足度 (0–100、高いほど充実)
// ────────────────────────────────────────────────
export function calcSupplyLevel(d: SeniorDiagnosisFormData): number {
  let score = 0

  if (d.hasCarrierOrCart === 'ある') score += 20
  if (d.hasFamiliarBedding === 'ある') score += 15
  if (d.toiletStatus === '問題なし' || d.hasDiapers === 'ある') score += 15
  if (d.hasTempCareItems === 'ある') score += 15

  const stockMap: Record<string, number> = {
    '備蓄なし': 0, '3日未満': 3, '3〜7日分': 8, '1〜2週間分': 15, '1か月以上': 20,
  }
  score += stockMap[d.medStock] ?? 0

  if (d.vetContactSaved === '控えている') score += 15

  return Math.min(100, Math.round(score))
}

// ────────────────────────────────────────────────
// 総合スコア
// ────────────────────────────────────────────────
export function calcSeniorRiskScores(d: SeniorDiagnosisFormData): SeniorRiskScores {
  const mobilityRisk = calcMobilityRisk(d)
  const medicalRisk = calcMedicalRisk(d)
  const evacuationDifficulty = calcEvacuationDifficulty(d)
  const supplyLevel = calcSupplyLevel(d)

  const overall = Math.max(0, Math.min(100,
    Math.round(100 - (mobilityRisk * 0.20 + medicalRisk * 0.30 + evacuationDifficulty * 0.30 + (100 - supplyLevel) * 0.20))
  ))

  let rating: SeniorRiskScores['rating']
  if (overall >= 80)      rating = '◎ しっかり備えられています'
  else if (overall >= 60) rating = '○ 基本的な準備ができています'
  else if (overall >= 40) rating = '△ 要改善：備えが必要です'
  else                    rating = '✗ 緊急の対応が必要です'

  return { mobilityRisk, medicalRisk, evacuationDifficulty, supplyLevel, overall, rating }
}
