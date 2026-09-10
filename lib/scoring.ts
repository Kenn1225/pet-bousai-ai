import type { DiagnosisFormData, RiskScores, DisasterScore } from './types'
import { DISEASE_MASTER } from './diseaseMaster'
import { DISASTER_MASTER, suggestDisasters, type DisasterType } from './disasterMaster'

function primaryType(d: DiagnosisFormData): string {
  return d.pets?.[0]?.type ?? 'その他'
}

function totalCount(d: DiagnosisFormData): number {
  return d.pets?.reduce((sum, p) => sum + p.count, 0) ?? 1
}

// ────────────────────────────────────────────────
// H: 健康リスク (0–100)
// ────────────────────────────────────────────────
export function calcHealthRisk(d: DiagnosisFormData): number {
  let score = 0

  const ageMap: Record<string, number> = {
    '0〜6ヶ月': 15, '7ヶ月〜1歳': 10, '2〜4歳': 0,
    '5〜7歳': 5, '8〜10歳': 20, '11〜14歳': 30, '15歳以上': 40,
  }
  score += ageMap[d.age] ?? 0

  for (const dis of (d.diseases ?? [])) {
    score += DISEASE_MASTER[dis]?.riskScore ?? 0
  }

  const medMap: Record<string, number> = {
    '毎日必要（処方薬）': 25, '毎日必要（市販薬）': 15, '時々必要': 8, '不要': 0,
  }
  score += medMap[d.medication] ?? 0

  if (d.specialDiet && d.specialDiet !== '不要') score += 15

  const vacMap: Record<string, number> = {
    'すべて接種済': 0, '一部未接種': 10, '未接種': 20, '不明': 10,
  }
  score += vacMap[d.vaccinationStatus ?? '不明'] ?? 0

  return Math.min(100, score)
}

// ────────────────────────────────────────────────
// B: 行動スコア（高いほど避難しやすい）
// ────────────────────────────────────────────────
export function calcBehaviorScore(d: DiagnosisFormData): number {
  if (!d.behavior) return 50
  const b = d.behavior
  const avg = (b.strangerReaction + b.animalReaction + b.crateComfort
    + b.noiseReaction + b.aloneAbility + b.stressTolerance) / 6
  return Math.round(avg * 10) // 0〜100
}

// ────────────────────────────────────────────────
// E: 避難難易度 (0–100、高いほど困難)
// ────────────────────────────────────────────────
export function calcEvacuationDifficulty(d: DiagnosisFormData): number {
  let score = 0

  // 行動スコアから変換（行動が良い=難易度低）
  const behaviorPenalty = 100 - calcBehaviorScore(d)
  score += behaviorPenalty * 0.4

  const hasDog = d.pets?.some(p => p.type === '犬')
  if (hasDog && d.dogSize) {
    const sizeMap: Record<string, number> = {
      '超小型犬（〜4kg）': 0, '小型犬（4〜10kg）': 0,
      '中型犬（10〜25kg）': 8, '大型犬（25〜45kg）': 18, '超大型犬（45kg〜）': 28,
    }
    score += sizeMap[d.dogSize] ?? 0
  }

  const floorMap: Record<string, number> = {
    '1階': 0, '2階': 5, '3階': 10, '4〜6階': 15, '7〜15階': 20, '16階以上': 25,
  }
  score += floorMap[d.floor] ?? 0

  if (d.floor !== '1階' && d.elevator === 'なし') score += 15

  const familyMap: Record<string, number> = {
    '一人暮らし': 22, '2人': 8, '3〜4人': 2, '5人以上': 0,
  }
  score += familyMap[d.familySize] ?? 0

  const riverMap: Record<string, number> = {
    'すぐそば（500m以内）': 20, '近く（500m〜1km）': 10, 'なし・遠い': 0,
  }
  score += riverMap[d.riverProximity] ?? 0

  const landslideMap: Record<string, number> = {
    'はい（ハザードマップで確認済）': 20, 'おそらくある': 15, 'いいえ': 0, '分からない': 8,
  }
  score += landslideMap[d.landslideRisk] ?? 0

  if (d.tsunamiRisk === 'あり') score += 15

  const shelterMap: Record<string, number> = {
    'ペット同行可の避難所を確認済': 0,
    '避難所の場所は知っているがペット可否不明': 10,
    '未確認': 20,
  }
  score += shelterMap[d.shelterConfirmed] ?? 0

  if (d.hasCarOrTransport === 'なし') score += 10

  const total = totalCount(d)
  if (total === 2) score += 10
  else if (total === 3) score += 18
  else if (total >= 4) score += 28

  const pt = primaryType(d)
  if (['爬虫類', 'フェレット', 'うさぎ', 'ハムスター', 'カメ', 'トカゲ・ヤモリ', 'ヘビ', '金魚・熱帯魚', 'カエル・両生類'].includes(pt)) {
    score += 15
  }

  return Math.min(100, Math.round(score))
}

// ────────────────────────────────────────────────
// S: 備蓄充足度 (0–100)
// ────────────────────────────────────────────────
export function calcSupplyLevel(d: DiagnosisFormData): number {
  let score = 0

  const foodMap: Record<string, number> = {
    '3日未満': 0, '3〜5日': 10, '1週間': 25, '2週間': 40, '1か月以上': 55,
  }
  score += foodMap[d.foodStock] ?? 0

  const waterMap: Record<string, number> = {
    '3日分以上備蓄あり': 15, '少しある': 7, 'なし': 0,
  }
  score += waterMap[d.waterStock] ?? 0

  if (d.hasCrate === 'ある') score += 10
  if (d.hasIdTag === 'ある') score += 8
  if (d.hasMicrochip === 'ある') score += 7
  if (d.hasFirstAid === 'ある') score += 5
  if (d.hasMedRecord === 'ある') score += 5

  return Math.min(100, score)
}

// ────────────────────────────────────────────────
// D: 災害別の対応力
// ────────────────────────────────────────────────

/** 診断対象の災害。未選択なら地域リスクの回答から自動で決める */
export function resolveDisasters(d: DiagnosisFormData): DisasterType[] {
  const picked = d.disasterTypes?.length ? d.disasterTypes : suggestDisasters(d)
  // マスターに無いものは除外し、重複を落とす
  return Array.from(new Set(picked)).filter(t => t in DISASTER_MASTER)
}

/**
 * 災害ごとに「該当度（exposure）」と「備えの充足度（readiness）」を出す。
 * exposure が高いのに readiness が低い災害が、その家庭の穴になる。
 */
export function calcDisasterScores(d: DiagnosisFormData): DisasterScore[] {
  const S = calcSupplyLevel(d)
  const B = calcBehaviorScore(d)
  const shelterKnown = d.shelterConfirmed === 'ペット同行可の避難所を確認済'
  const hasCar = d.hasCarOrTransport === 'あり'
  const hasCrate = d.hasCrate === 'ある'
  const highFloor = ['4〜6階', '7〜15階', '16階以上'].includes(d.floor)
  const noElevator = d.floor !== '1階' && d.elevator === 'なし'
  const longStock = ['1週間', '2週間', '1か月以上'].includes(d.foodStock)

  return resolveDisasters(d).map(disaster => {
    let exposure = 50
    let readiness = Math.round(S * 0.5 + B * 0.2 + 15)

    switch (disaster) {
      case '地震':
        exposure = 85 // 全国どこでも起こる
        readiness += hasCrate ? 12 : -12
        readiness += B >= 60 ? 6 : -6
        break
      case '津波':
        exposure = d.tsunamiRisk === 'あり' ? 90 : d.tsunamiRisk === '分からない' ? 45 : 15
        readiness += highFloor ? 10 : -5      // 高層階は垂直避難で有利
        readiness += hasCrate ? 8 : -10       // 数分で運び出せるか
        readiness += shelterKnown ? 6 : -6
        break
      case '台風':
        exposure = 75
        readiness += longStock ? 12 : -8      // 猶予があるぶん備蓄で決まる
        readiness += shelterKnown ? 8 : -6
        break
      case '大雨・洪水':
        exposure = d.riverProximity === 'すぐそば（500m以内）' ? 90
          : d.riverProximity === '近く（500m〜1km）' ? 65 : 25
        readiness += hasCar ? 8 : -6
        readiness += shelterKnown ? 8 : -8
        readiness += highFloor ? 6 : 0
        break
      case '土砂災害':
        exposure = d.landslideRisk === 'はい（ハザードマップで確認済）' ? 90
          : d.landslideRisk === 'おそらくある' ? 70
          : d.landslideRisk === '分からない' ? 45 : 15
        readiness += longStock ? 10 : -10     // 孤立しやすい
        readiness += shelterKnown ? 8 : -8
        break
      case '火山噴火':
        exposure = 35
        readiness += longStock ? 8 : -6
        readiness += d.hasFirstAid === 'ある' ? 6 : -4
        break
      case '大雪':
        exposure = 40
        readiness += longStock ? 12 : -12     // 孤立して買い出しに行けない
        readiness += d.medication === '不要' ? 4 : -8  // 通院できない期間が痛い
        break
      case '高潮':
        exposure = d.tsunamiRisk === 'あり' ? 70 : 20
        readiness += highFloor ? 10 : -6
        readiness += hasCrate ? 6 : -6
        break
      case '停電・断水':
        exposure = 80 // どの災害にも付随する
        readiness += longStock ? 10 : -10
        readiness += d.waterStock === '3日分以上備蓄あり' ? 12 : -10
        break
    }

    if (noElevator && ['津波', '大雨・洪水', '高潮'].includes(disaster)) readiness -= 8

    return {
      disaster,
      exposure: Math.max(0, Math.min(100, exposure)),
      readiness: Math.max(0, Math.min(100, Math.round(readiness))),
    }
  })
}

/**
 * 想定災害への総合対応力。該当度が高い災害ほど重く見る
 * （起きにくい災害に備えていても、起きやすい災害が手薄なら点は上がらない）
 */
export function calcDisasterReadiness(d: DiagnosisFormData): number {
  const list = calcDisasterScores(d)
  if (!list.length) return 50
  const weightSum = list.reduce((s, x) => s + x.exposure, 0)
  if (weightSum === 0) return 50
  const weighted = list.reduce((s, x) => s + x.readiness * x.exposure, 0) / weightSum
  return Math.max(0, Math.min(100, Math.round(weighted)))
}

// ────────────────────────────────────────────────
// 総合スコア
// ────────────────────────────────────────────────
export function calcRiskScores(d: DiagnosisFormData): RiskScores {
  const H = calcHealthRisk(d)
  const E = calcEvacuationDifficulty(d)
  const S = calcSupplyLevel(d)
  const B = calcBehaviorScore(d)
  const D = calcDisasterReadiness(d)

  const overall = Math.max(0, Math.min(100,
    Math.round(100 - (H * 0.24 + E * 0.28 + (100 - S) * 0.24 + (100 - B) * 0.10 + (100 - D) * 0.14))
  ))

  let rating: RiskScores['rating']
  if (overall >= 80)      rating = '◎ しっかり備えられています'
  else if (overall >= 60) rating = '○ 基本的な準備ができています'
  else if (overall >= 40) rating = '△ 要改善：備えが必要です'
  else                    rating = '✗ 緊急の対応が必要です'

  return {
    healthRisk: H, evacuationDifficulty: E, supplyLevel: S,
    behaviorScore: B, disasterReadiness: D, overall, rating,
  }
}
