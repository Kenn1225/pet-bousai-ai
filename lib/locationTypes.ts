// 郵便番号ベース地域災害診断の型定義

import type { DisasterType, PetType } from './types'

/** 郵便番号で診断する際の最小限の入力 */
export interface LocationFormData {
  postalCode: string // 郵便番号（ハイフンあり/なし）
  petType: PetType // ペット種類
}

/** 災害ごとの該当度スコア */
export interface DisasterExposureScore {
  disaster: DisasterType
  exposure: number // 0-100、高いほどリスク大
}

/** 地域診断の総合スコア */
export interface LocationRiskScores {
  exposures: DisasterExposureScore[] // 該当災害の露出スコア一覧
  regionalRiskLevel: number // 0-100、地域全体のリスク（高いほど要注意）
  petEvacuationDifficulty: number // 0-100、ペット種によるリスク（高いほど困難）
  overall: number // 0-100、総合スコア（高いほど要注意）
  rating: '● 特に重点的な備えが必要な地域・ペットです' | '▲ しっかりした備えを推奨します' | '○ 標準的な備えで対応可能です' | '◎ 相対的にリスクの低い地域です'
  matchLevel: 'city' | 'prefecture' // 'city'=市区町村レベル、'prefecture'=都道府県レベルのフォールバック
}

/** 診断結果レポート */
export interface LocationDiagnosisReport {
  summary: {
    catchCopy: string // 20字以内のキャッチコピー（ペット名入り）
    overallMessage: string // 100-150字の総評
  }
  location: {
    prefecture: string
    city: string | null
    matchLevel: 'city' | 'prefecture'
  }
  riskScores: LocationRiskScores
  topDisasters: Array<{
    disaster: DisasterType
    exposure: number
    leadTime: string // 避難猶予時間
    evacuationStyle: string // 避難様式
    firstAction: string // まず最初にやること
    petAction: string // ペット側のアクション
    caution: string // この地域・ペット固有の注意点
    keySupplies: string[]
  }>
  petSpecificAdvice: string[]
  essentialSupplies: Array<{
    item: string
    reason: string
    priority: number
    amazonUrl?: string
  }>
  municipalLink: { name: string; url: string } | null
  checklist: Array<{ item: string; done: boolean }>
  finalAdvice: string // 最後の励まし・アドバイス
}

/** 診断結果の完全な形（フォームデータ・スコア・レポートをセット） */
export interface LocationDiagnosisResult {
  formData: LocationFormData
  scores: LocationRiskScores
  report: LocationDiagnosisReport
  createdAt: string
}
