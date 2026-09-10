// ペット防災診断システム 完全版 — 型定義

export type { PetType } from './petMaster'
export type { Disease } from './diseaseMaster'
export type { DisasterType } from './disasterMaster'

import type { PetType } from './petMaster'
import type { Disease } from './diseaseMaster'
import type { DisasterType } from './disasterMaster'

export type AgeRange = '0〜6ヶ月' | '7ヶ月〜1歳' | '2〜4歳' | '5〜7歳' | '8〜10歳' | '11〜14歳' | '15歳以上'
export type Gender = 'オス' | 'メス'
export type NeuteredStatus = '済' | '未'
export type DogSize = '超小型犬（〜4kg）' | '小型犬（4〜10kg）' | '中型犬（10〜25kg）' | '大型犬（25〜45kg）' | '超大型犬（45kg〜）'
export type MedicationStatus = '毎日必要（処方薬）' | '毎日必要（市販薬）' | '時々必要' | '不要'
export type ResidenceType = '戸建て（一軒家）' | 'マンション' | 'アパート' | '集合住宅（その他）'
export type FloorLevel = '1階' | '2階' | '3階' | '4〜6階' | '7〜15階' | '16階以上'
export type ElevatorStatus = 'あり' | 'なし' | '該当なし（戸建て）'
export type FamilySize = '一人暮らし' | '2人' | '3〜4人' | '5人以上'
export type RiverProximity = 'すぐそば（500m以内）' | '近く（500m〜1km）' | 'なし・遠い'
export type LandslideRisk = 'はい（ハザードマップで確認済）' | 'おそらくある' | 'いいえ' | '分からない'
export type ShelterConfirmed = 'ペット同行可の避難所を確認済' | '避難所の場所は知っているがペット可否不明' | '未確認'
export type FoodStock = '3日未満' | '3〜5日' | '1週間' | '2週間' | '1か月以上'
export type WaterStock = '3日分以上備蓄あり' | '少しある' | 'なし'
export type HasItem = 'ある' | 'ない'

// 種類ごとの頭数エントリ
export interface PetEntry {
  type: PetType
  count: number
}

// 行動特性（1〜10点スコア）
export interface BehaviorScores {
  strangerReaction: number    // 1=非常に攻撃的 〜 10=非常に友好的
  animalReaction: number      // 1=非常に攻撃的 〜 10=問題なし
  crateComfort: number        // 1=全く入れない 〜 10=喜んで入る
  noiseReaction: number       // 1=パニック 〜 10=全く動じない
  aloneAbility: number        // 1=全くできない 〜 10=長時間OK
  stressTolerance: number     // 1=非常に弱い 〜 10=非常に強い
}

// 運動・活動情報
export interface ExerciseInfo {
  dailyMinutes: number        // 1日の平均運動・散歩時間（分）
  exerciseType: string        // 運動の種類（散歩・遊び・水泳等）
}

// 診断フォームの全データ
export interface DiagnosisFormData {
  // STEP1 基本情報
  pets: PetEntry[]
  age: AgeRange
  gender: Gender
  neutered: NeuteredStatus
  petName?: string

  // STEP2 犬の追加情報
  dogSize?: DogSize
  dogWeight?: number
  dogBreed?: string
  exercise?: ExerciseInfo

  // STEP3 健康状態
  diseases: Disease[]
  medication: MedicationStatus
  specialDiet: '必要（療法食）' | '必要（アレルギー対応）' | '必要（その他）' | '不要'
  vaccinationStatus: 'すべて接種済' | '一部未接種' | '未接種' | '不明'

  // STEP4 行動特性（10点スコア）
  behavior: BehaviorScores

  // STEP5 住環境
  residenceType: ResidenceType
  floor: FloorLevel
  elevator: ElevatorStatus
  familySize: FamilySize
  hasCarOrTransport: 'あり' | 'なし'

  // STEP6 災害リスク
  postalCode: string
  address?: string
  riverProximity: RiverProximity
  landslideRisk: LandslideRisk
  tsunamiRisk: 'あり' | 'なし' | '分からない'
  shelterConfirmed: ShelterConfirmed
  /** 想定する自然災害（複数選択）。地域リスクの回答から自動提案し、本人が確定する */
  disasterTypes: DisasterType[]

  // STEP7 備蓄
  foodStock: FoodStock
  waterStock: WaterStock
  hasCrate: HasItem
  hasIdTag: HasItem
  hasMicrochip: HasItem
  hasFirstAid: HasItem
  hasMedRecord: HasItem
}

// スコアリング結果
export interface RiskScores {
  healthRisk: number
  evacuationDifficulty: number
  supplyLevel: number
  behaviorScore: number
  /** 想定災害への対応力（0-100・高いほど備えられている） */
  disasterReadiness: number
  overall: number
  rating: '◎ しっかり備えられています' | '○ 基本的な準備ができています' | '△ 要改善：備えが必要です' | '✗ 緊急の対応が必要です'
}

/** 災害種別ごとの対応力の内訳（レーダー表示用） */
export interface DisasterScore {
  disaster: DisasterType
  /** この災害が自宅に該当する度合い（0-100） */
  exposure: number
  /** この災害への備えの充足度（0-100） */
  readiness: number
}

// AIが返すレポートJSON
export interface DiagnosisReport {
  summary: {
    catchCopy: string
    overallMessage: string
    petName: string
  }
  riskScores: RiskScores
  topRisks: Array<{
    rank: number
    category: string
    title: string
    urgency: '緊急' | '重要' | '推奨'
    detail: string
  }>
  recommendedSupplies: Array<{
    item: string
    quantity: string
    reason: string
    priority: number
    amazonUrl?: string
  }>
  actionPlan: {
    min0_10: string
    min10_30: string
    min30_60: string
    day1_3: string
  }
  shelterInfo: {
    primary: { name: string; distance: string; walkMin: number; petOk: boolean; note: string }
    secondary: { name: string; distance: string; walkMin: number; petOk: boolean; note: string }
    alternatives: string[]
  }
  shelterRisks: Array<{
    risk: string
    prevention: string
  }>
  improvementRoadmap: Array<{
    priority: number
    action: string
    deadline: string
    difficulty: '低' | '中' | '高'
    estimatedCost: string
  }>
  petSpecificAdvice: string[]
  exerciseAdvice?: string
  /** 災害種別ごとの行動計画（グレードアップで追加） */
  disasterPlans?: Array<{
    disaster: DisasterType
    leadTime: string
    /** その災害で最初に取るべき行動 */
    firstAction: string
    /** うちの子のための具体的な行動（ペットの特性を反映） */
    petAction: string
    /** この災害で特に足りていない備え */
    missingSupplies: string[]
    /** この家庭にとっての最大の落とし穴 */
    caution: string
    /** 避難の型（垂直避難・水平避難など） */
    evacuationStyle: string
  }>
  checklist: Array<{
    item: string
    done: boolean
    category: string
  }>
  emergencyContacts: {
    nearestVet: string
    emergencyVet: string
    animalPoisonControl: string
  }
}

export interface DiagnosisResult {
  formData: DiagnosisFormData
  scores: RiskScores
  report: DiagnosisReport
  createdAt: string
}
