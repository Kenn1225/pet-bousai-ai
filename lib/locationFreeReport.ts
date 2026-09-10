// 無料版レポート生成（ルールベース、AI不使用）

import type { LocationFormData, LocationDiagnosisReport, LocationRiskScores } from './locationTypes'
import { PET_MASTER } from './petMaster'
import type { PetType } from './petMaster'
import { DISASTER_MASTER } from './disasterMaster'
import { getMunicipalPetLink } from './municipalLinks'
import { lookupPostalCode } from './postalMaster'

function getCatchCopy(overall: number, petType: PetType): string {
  const petName = PET_MASTER[petType]?.emoji ?? '🐾'
  if (overall >= 75) return `${petName}と守る、地域別防災`
  if (overall >= 55) return `${petName}のための、災害対策`
  if (overall >= 35) return `${petName}と一緒に、備える`
  return `${petName}を守る準備、今から`
}

function getOverallMessage(overall: number, petType: PetType): string {
  const petName = PET_MASTER[petType]?.emoji ?? '🐾'
  if (overall >= 75) {
    return `この地域でのペット同行避難には、特に重点的な準備が必要です。災害種別ごとの対策を確認し、ペットの避難経路・避難先を複数確保しておきましょう。${petName}のストレスケアも忘れずに。`
  }
  if (overall >= 55) {
    return `地域の災害リスクと、ペット種の避難所受け入れ状況を考慮した備えを推奨します。最低でも3日分以上の備蓄と、ペット可能な避難先の事前確保が重要です。`
  }
  if (overall >= 35) {
    return `標準的な防災準備で対応可能な地域です。ただしペット種によっては、避難所での受け入れが制限される場合があります。事前に自治体に確認しておきましょう。`
  }
  return `相対的にリスクの低い地域ですが、どの地域でも防災は重要です。ペットとの同行避難を想定して、最低限の備蓄と避難先を確認しておくことをお勧めします。`
}

/**
 * 無料版診断レポートを生成
 * DISASTER_MASTER と PET_MASTER から直接引用
 */
export function generateLocationFreeReport(
  formData: LocationFormData,
  riskScores: LocationRiskScores
): LocationDiagnosisReport {
  const location = lookupPostalCode(formData.postalCode)
  const petType = formData.petType as PetType
  const petMaster = PET_MASTER[petType]

  // 上位3災害を「主な対策対象」として定義
  const topDisasters = riskScores.exposures.slice(0, 3).map((exp, idx) => {
    const master = DISASTER_MASTER[exp.disaster]
    return {
      disaster: exp.disaster,
      exposure: exp.exposure,
      leadTime: `${master.leadTime}（${master.leadTimeNote}）`,
      evacuationStyle: master.evacuationStyle,
      firstAction: master.primaryAction,
      petAction: master.petActions[0],
      caution: master.petRisks[0],
      keySupplies: master.keySupplies.slice(0, 2),
    }
  })

  // ペット種別アドバイス
  const petSpecificAdvice = [
    petMaster.shelterNote,
    `最低${petMaster.minStockDays}日分の備蓄を推奨。特別フード必要な場合は自前確保が必須。`,
  ]

  // 必須備蓄品
  const essentialSupplies = [
    { item: 'フード', reason: `${petMaster.minStockDays}日分以上`, priority: 1, amazonUrl: petMaster.amazonSearchUrl },
    { item: '飲料水', reason: '1日1L/kg以上', priority: 1 },
    { item: 'キャリー・クレート', reason: 'ペット運搬・避難所受け入れに必須', priority: 2 },
    { item: 'リード・迷子札', reason: '脱走・迷子防止', priority: 2 },
  ]

  // 市区町村レベルの自治体リンク
  const municipalLink = getMunicipalPetLink(formData.postalCode)

  // チェックリスト
  const checklist = [
    { item: 'ペットの写真と健康記録を準備', done: false },
    { item: `${petMaster.minStockDays}日分以上の備蓄を確保`, done: false },
    { item: 'ペット可能な避難先を複数確保', done: false },
    { item: '健康診断を受け、健康状態を把握', done: false },
  ]

  return {
    summary: {
      catchCopy: getCatchCopy(riskScores.overall, petType),
      overallMessage: getOverallMessage(riskScores.overall, petType),
    },
    location: {
      prefecture: location.prefecture,
      city: location.city,
      matchLevel: location.matchLevel,
    },
    riskScores,
    topDisasters,
    petSpecificAdvice,
    essentialSupplies,
    municipalLink,
    checklist,
    finalAdvice: 'ペット同行避難は、事前の準備と心構えが命です。このレポートをきっかけに、ご家族とペットの避難計画を今からスタートしましょう。',
  }
}
