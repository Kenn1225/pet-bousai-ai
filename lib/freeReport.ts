// ルールベース診断（無料版）
// AI 不使用、テンプレート + コード側で全て生成
// 出力トークン 0、料金 0 円

import type { DiagnosisFormData, DiagnosisReport, RiskScores } from './types'
import { calcRiskScores, calcDisasterScores, resolveDisasters } from './scoring'
import { DISASTER_MASTER } from './disasterMaster'
import { PET_MASTER } from './petMaster'
import type { PetType } from './petMaster'

/** スコア帯別のキャッチコピー（ペット名入り） */
function getCatchCopy(overall: number, petName: string): string {
  if (overall >= 80) return `${petName}と安心する暮らし`
  if (overall >= 60) return `${petName}のための防災、始まる`
  if (overall >= 40) return `${petName}と一緒に、備える`
  return `${petName}を守るために、今から`
}

/** スコア帯別の総評 */
function getOverallMessage(overall: number, rating: string): string {
  const base = rating === '◎ しっかり備えられています'
    ? '防災への準備がしっかり整っています。継続的な確認を心がけましょう。'
    : rating === '○ 基本的な準備ができています'
      ? '基本的な準備ができていますが、いくつか改善の余地があります。'
      : rating === '△ 要改善：備えが必要です'
        ? '今からでも遅くありません。段階的に準備を進めてください。'
        : '緊急の対応が必要です。まずは最優先項目から始めましょう。'
  return base
}

/** リスク領域別に優先度を決める（機械的） */
function getTopRisks(scores: RiskScores, petType: PetType): Array<{
  rank: number
  category: string
  title: string
  urgency: '緊急' | '重要' | '推奨'
  detail: string
}> {
  const risks: Array<{
    score: number
    rank: number
    category: string
    title: string
    urgency: '緊急' | '重要' | '推奨'
    detail: string
  }> = []

  if (scores.healthRisk >= 70) {
    risks.push({
      score: scores.healthRisk,
      rank: risks.length + 1,
      category: '健康',
      title: '持病・投薬管理',
      urgency: '緊急',
      detail: '避難先での医療継続が最重要。薬は最低2週間分備蓄する。',
    })
  }

  if (scores.evacuationDifficulty >= 70) {
    risks.push({
      score: scores.evacuationDifficulty,
      rank: risks.length + 1,
      category: '移動',
      title: '避難運搬の現実性',
      urgency: '緊急',
      detail: `${petType}の体格・年齢で実際に運べるか事前確認が必須。`,
    })
  }

  if (scores.supplyLevel < 40) {
    risks.push({
      score: 100 - scores.supplyLevel,
      rank: risks.length + 1,
      category: '備蓄',
      title: 'フード・水の確保',
      urgency: '重要',
      detail: '72時間分の確保から始める。フードより水が優先。',
    })
  }

  if (scores.behaviorScore < 40) {
    risks.push({
      score: 100 - scores.behaviorScore,
      rank: risks.length + 1,
      category: '行動',
      title: 'ストレス対応',
      urgency: '重要',
      detail: '避難所で暴れ・鳴き続けるリスク。日頃の訓練が有効。',
    })
  }

  // ランダムではなく、スコア順でソート、上位3件を返す
  return risks
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(r => {
      const { score, ...rest } = r
      return rest
    })
}

/** 無料版診断レポート生成（テンプレートのみ） */
export function generateFreeReport(
  formData: DiagnosisFormData,
  scores: RiskScores
): DiagnosisReport {
  const petName = formData.petName ?? 'うちの子'
  const primaryType = (formData.pets?.[0]?.type ?? 'その他') as PetType
  const master = PET_MASTER[primaryType]
  const disasters = resolveDisasters(formData)
  const disasterScores = calcDisasterScores(formData)

  const report: DiagnosisReport = {
    summary: {
      catchCopy: getCatchCopy(scores.overall, petName),
      overallMessage: getOverallMessage(scores.overall, scores.rating),
      petName,
    },
    riskScores: scores,
    topRisks: getTopRisks(scores, primaryType),
    recommendedSupplies: [
      { item: 'フード・おやつ', quantity: '1週間分', reason: '', priority: 1 },
      { item: '飲料水', quantity: '1日 1L/kg', reason: '', priority: 1 },
      { item: 'クレート・キャリー', quantity: '1個', reason: '', priority: 2 },
      { item: 'リード・迷子札', quantity: '複数', reason: '', priority: 2 },
      { item: 'トイレ・シーツ', quantity: '1週間分', reason: '', priority: 2 },
    ],
    actionPlan: {
      min0_10: '安全確保。ペットを落ち着かせてクレートへ。',
      min10_30: '火の始末・戸締まり。情報収集。',
      min30_60: 'ペット連れ避難路を確認。避難所へ向かう。',
      day1_3: 'かかりつけ医・知人に連絡。ペット用品を追加確保。',
    },
    shelterInfo: {
      primary: {
        name: 'かかりつけ動物病院',
        distance: '事前に確認してください',
        walkMin: 0,
        petOk: true,
        note: 'ペット同行不可の場合の代替先として機能',
      },
      secondary: {
        name: 'ペットホテル / 知人宅',
        distance: '事前に確保してください',
        walkMin: 0,
        petOk: true,
        note: '多くの避難所でペット受け入れ不可',
      },
      alternatives: ['車中泊（自家用車）', 'ペット可ホテル事前確保を推奨'],
    },
    shelterRisks: [
      {
        risk: '多くの避難所でペット受け入れ不可',
        prevention: '事前に車中泊・ペットホテル・知人宅を確保。',
      },
      {
        risk: 'ストレスによる鳴き・暴れ・体調不良',
        prevention: '日頃からクレート慣れ・他のペットとの交流を。',
      },
    ],
    improvementRoadmap: [
      {
        priority: 1,
        action: 'ペット同行可能な避難先を複数確保',
        deadline: '今月中',
        difficulty: '低',
        estimatedCost: '知人との打ち合わせのみ',
      },
      {
        priority: 2,
        action: 'フード・水を1週間分以上備蓄',
        deadline: '今月中',
        difficulty: '低',
        estimatedCost: '2,000〜3,000円',
      },
    ],
    petSpecificAdvice: [
      `${primaryType}の避難所受け入れ：${master?.shelterStatus ?? '要確認'}`,
      `平時から短時間のクレート馴化を。避難時は大きなストレス要因になります。`,
    ],
    exerciseAdvice: '避難生活中は散歩できない可能性も。室内運動グッズを準備しておく。',
    checklist: [
      { item: 'ペットの写真（迷子時用）', done: false, category: '書類' },
      { item: 'ワクチン接種証明書', done: false, category: '書類' },
      { item: 'フード・おやつ（1週間分）', done: false, category: 'フード' },
      { item: 'クレート・リード・迷子札', done: false, category: 'グッズ' },
    ],
    emergencyContacts: {
      nearestVet: 'かかりつけ動物病院の連絡先を事前にメモしておく',
      emergencyVet: '夜間救急動物病院を調べておく',
      animalPoisonControl: '動物中毒110番（一般社団法人 日本中毒情報センター）: 072-726-9923',
    },
    disasterPlans: disasters.map(t => {
      const m = DISASTER_MASTER[t]
      const sc = disasterScores.find(s => s.disaster === t)
      return {
        disaster: t,
        leadTime: `${m.leadTime}（${m.leadTimeNote}）`,
        evacuationStyle: m.evacuationStyle,
        firstAction: m.primaryAction,
        petAction: m.petActions[0],
        caution: m.petRisks[0],
        missingSupplies: [m.keySupplies[0], m.keySupplies[1] ?? 'リード'].slice(0, 2),
      }
    }),
  }

  return report
}
