import type { MansionDiagnosisFormData, MansionRiskScores } from './mansionTypes'

// ────────────────────────────────────────────────
// 階数リスク (0–100、高いほどリスク大)
// ────────────────────────────────────────────────
export function calcFloorRisk(d: MansionDiagnosisFormData): number {
  let score: number
  if (d.floor <= 10) score = 20
  else if (d.floor <= 20) score = 40
  else if (d.floor <= 30) score = 60
  else if (d.floor <= 40) score = 75
  else score = 90 // 41階以上

  if (d.elevatorCount === '1基のみ') score += 10
  if (d.elevatorEmergencyOp === '対応していない') score += 8
  else if (d.elevatorEmergencyOp === 'わからない') score += 5

  return Math.min(100, Math.round(score))
}

// ────────────────────────────────────────────────
// 避難準備度 (0–100、高いほど準備が整っている)
// ────────────────────────────────────────────────
export function calcEvacuationReadiness(d: MansionDiagnosisFormData): number {
  let score = 0

  const stairsMap: Record<string, number> = {
    '把握している': 30, 'なんとなく知っている': 15, '知らない': 0,
  }
  score += stairsMap[d.stairsKnowledge] ?? 0

  if (d.hasEvacuationCarrier === 'ある') score += 25
  if (d.practiceExperience === 'ある') score += 20
  if (d.hasLightSource === 'ある') score += 15

  const familiarityMap: Record<string, number> = {
    '慣れている': 10, 'あまり慣れていない': 5, '全く慣れていない': 0,
  }
  score += familiarityMap[d.carrierFamiliarity] ?? 0

  return Math.min(100, Math.round(score))
}

// ────────────────────────────────────────────────
// 建物・管理組合の備え (0–100、高いほど整っている)
// ────────────────────────────────────────────────
export function calcBuildingPreparedness(d: MansionDiagnosisFormData): number {
  let score = 0

  const planMap: Record<string, number> = {
    'ある': 30, 'わからない': 10, 'ない': 0,
  }
  score += planMap[d.managementPetPlan] ?? 0

  if (d.drillParticipation === 'ある') score += 25
  if (d.autoLockKnowledge === '知っている') score += 20
  if (d.waterPumpRisk === '知っている') score += 25

  return Math.min(100, Math.round(score))
}

// ────────────────────────────────────────────────
// 備蓄充足度 (0–100、高いほど充実)
// ────────────────────────────────────────────────
export function calcStockpileLevel(d: MansionDiagnosisFormData): number {
  let score = 0

  const stockMap: Record<string, number> = {
    'なし': 0, '3日未満': 10, '3〜7日分': 30, '1〜2週間分': 55, '2週間以上': 75,
  }
  score += stockMap[d.waterFoodStock] ?? 0

  if (d.toiletPrep === '準備している') score += 15
  if (d.furnitureFixed === 'している') score += 10

  return Math.min(100, Math.round(score))
}

// ────────────────────────────────────────────────
// 総合スコア
// ────────────────────────────────────────────────
export function calcMansionRiskScores(d: MansionDiagnosisFormData): MansionRiskScores {
  const floorRisk = calcFloorRisk(d)
  const evacuationReadiness = calcEvacuationReadiness(d)
  const buildingPreparedness = calcBuildingPreparedness(d)
  const stockpileLevel = calcStockpileLevel(d)

  const overall = Math.max(0, Math.min(100,
    Math.round(100 - (
      floorRisk * 0.35
      + (100 - evacuationReadiness) * 0.25
      + (100 - buildingPreparedness) * 0.15
      + (100 - stockpileLevel) * 0.25
    ))
  ))

  let rating: MansionRiskScores['rating']
  if (overall >= 80)      rating = '◎ しっかり備えられています'
  else if (overall >= 60) rating = '○ 基本的な準備ができています'
  else if (overall >= 40) rating = '△ 要改善：備えが必要です'
  else                    rating = '✗ 緊急の対応が必要です'

  return { floorRisk, evacuationReadiness, buildingPreparedness, stockpileLevel, overall, rating }
}

// ────────────────────────────────────────────────
// 階層帯（プロンプト・表示用）
// ────────────────────────────────────────────────
export function getFloorTier(floor: number): { tier: string; strategy: string } {
  if (floor <= 10) {
    return {
      tier: '低層（5〜10階）',
      strategy: '階段での同行避難が現実的。ペット用キャリー・カートを整え、避難経路を事前確認しておく。',
    }
  }
  if (floor <= 20) {
    return {
      tier: '中層（11〜20階）',
      strategy: '階段避難は可能だが体力的負担が大きい。エレベーター停止を前提に、在宅避難と避難所避難の両方を計画しておく。',
    }
  }
  if (floor <= 30) {
    return {
      tier: '高層（21〜30階）',
      strategy: '階段避難は困難。余震のリスクが収まるまでは原則「在宅避難（垂直避難）」を基本方針とし、備蓄を厚くする。',
    }
  }
  if (floor <= 40) {
    return {
      tier: '超高層（31〜40階）',
      strategy: 'エレベーター復旧には数日〜1週間以上かかることを想定。階段避難は緊急時のみとし、在宅避難を前提に2週間以上の備蓄を確保する。',
    }
  }
  return {
    tier: '超高層タワー最上部（41〜60階）',
    strategy: '長周期地震動の揺れが大きく、階段避難自体が危険を伴う。原則として在宅避難を徹底し、水・電気・トイレの自給自足体制を最優先で整える。',
  }
}
