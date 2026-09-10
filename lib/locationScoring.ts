// 地域ベース災害診断のスコアリング

import type { LocationFormData, LocationRiskScores, DisasterExposureScore } from './locationTypes'
import type { PostalLookupResult } from './postalMaster'
import type { PetType } from './petMaster'
import { lookupPostalCode } from './postalMaster'
import { getPrefectureHazard } from './prefectureHazardMaster'
import { isCoastalCity, isRiverBasinCity, isMountainousCity } from './hazardCorrections'
import { PET_MASTER } from './petMaster'
import { DISASTER_MASTER } from './disasterMaster'

/**
 * 郵便番号→都道府県・市区町村を検索してスコア化
 */
export function calcLocationExposure(location: PostalLookupResult): DisasterExposureScore[] {
  const prefHazard = getPrefectureHazard(location.prefecture)
  if (!prefHazard) {
    throw new Error(`Unknown prefecture: ${location.prefecture}`)
  }

  const results: DisasterExposureScore[] = []

  // 地震: 都道府県傾向から基本スコアを決定
  const earthquakeExposure =
    prefHazard.earthquakeTendency === 'very-high' ? 85 : prefHazard.earthquakeTendency === 'high' ? 72 : prefHazard.earthquakeTendency === 'medium' ? 55 : 35
  results.push({ disaster: '地震', exposure: earthquakeExposure })

  // 台風: 都道府県傾向
  const typhoonExposure =
    prefHazard.typhoonFrequency === 'very-high' ? 80 : prefHazard.typhoonFrequency === 'high' ? 65 : prefHazard.typhoonFrequency === 'medium' ? 45 : 25
  results.push({ disaster: '台風', exposure: typhoonExposure })

  // 津波: 沿岸県かつ沿岸都市なら高い、未登録は中間値
  if (prefHazard.hasCoast) {
    const isCoastal = isCoastalCity(location.prefecture, location.city)
    const tsunamiExposure = isCoastal ? 82 : location.matchLevel === 'city' ? 45 : 60
    results.push({ disaster: '津波', exposure: tsunamiExposure })
  }

  // 高潮: 津波と同じ判定
  if (prefHazard.hasCoast) {
    const isCoastal = isCoastalCity(location.prefecture, location.city)
    const stormSurgeExposure = isCoastal ? 70 : location.matchLevel === 'city' ? 35 : 50
    results.push({ disaster: '高潮', exposure: stormSurgeExposure })
  }

  // 洪水: 河川流域判定
  const isRiver = isRiverBasinCity(location.prefecture, location.city)
  const floodExposure = isRiver ? 78 : location.matchLevel === 'city' ? 40 : 55
  results.push({ disaster: '大雨・洪水', exposure: floodExposure })

  // 土砂災害: 山間部判定
  const isMountain = isMountainousCity(location.prefecture, location.city)
  const landslideExposure = isMountain ? 75 : location.matchLevel === 'city' ? 32 : 50
  results.push({ disaster: '土砂災害', exposure: landslideExposure })

  // 大雪: 豪雪地帯判定
  if (prefHazard.heavySnowArea) {
    results.push({ disaster: '大雪', exposure: 70 })
  }

  // 火山: 活火山判定
  if (prefHazard.hasActiveVolcano) {
    results.push({ disaster: '火山噴火', exposure: 45 })
  }

  // 停電・断水: 全国一律（必ず含める）
  results.push({ disaster: '停電・断水', exposure: 75 })

  // 地震用（内陸県でも含める）は常に含まれている
  // 火山噴火、大雪は条件付き

  return results.sort((a, b) => b.exposure - a.exposure)
}

/**
 * ペット種による同行避難困難度を計算
 * PET_MASTERの避難所受け入れ可否とストレス感受性から算出
 */
export function calcPetEvacuationDifficulty(petType: PetType): number {
  const petData = PET_MASTER[petType]

  // shelterStatus による基本スコア
  let shelterScore = 0
  if (petData.shelterStatus === '× 不可') shelterScore = 90
  else if (petData.shelterStatus === '△ 要確認') shelterScore = 55
  else shelterScore = 25 // '○ 可能'

  // stressSensitivity による加算
  let stressScore = 0
  if (petData.stressSensitivity === '非常に高い') stressScore = 22
  else if (petData.stressSensitivity === '高') stressScore = 15
  else if (petData.stressSensitivity === '中') stressScore = 8
  else stressScore = 0 // '低'

  return Math.min(100, shelterScore + stressScore)
}

/**
 * 郵便番号とペット種から総合スコアを計算
 */
export function calcLocationRiskScores(formData: LocationFormData): LocationRiskScores {
  // 郵便番号からlocation情報を取得
  const location = lookupPostalCode(formData.postalCode)

  // 災害別の露出スコアを計算
  const exposures = calcLocationExposure(location)

  // 上位3〜4災害の平均を「地域リスク」とする
  const topRisks = exposures.slice(0, 4)
  const regionalRiskLevel = Math.round(topRisks.reduce((s, x) => s + x.exposure, 0) / topRisks.length)

  // ペット同行避難の困難度
  const petEvacuationDifficulty = calcPetEvacuationDifficulty(formData.petType as PetType)

  // 総合スコア: 地域60% + ペット40%
  // 高いほど「要注意」（既存フローと異なる向き）
  const overall = Math.round(regionalRiskLevel * 0.6 + petEvacuationDifficulty * 0.4)

  // 総合評価（高いほど要注意）
  let rating: LocationRiskScores['rating']
  if (overall >= 75) rating = '● 特に重点的な備えが必要な地域・ペットです'
  else if (overall >= 55) rating = '▲ しっかりした備えを推奨します'
  else if (overall >= 35) rating = '○ 標準的な備えで対応可能です'
  else rating = '◎ 相対的にリスクの低い地域です'

  return {
    exposures,
    regionalRiskLevel,
    petEvacuationDifficulty,
    overall,
    rating,
    matchLevel: location.matchLevel,
  }
}
