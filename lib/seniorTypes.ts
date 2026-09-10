// 高齢ペット（シニア犬・シニア猫）災害対策診断 — 型定義

export type SeniorPetType = '犬' | '猫'
export type SeniorAgeRange = '8〜10歳（シニア初期）' | '11〜14歳（シニア期）' | '15歳以上（高齢期）'
export type MobilityLevel = '自力でしっかり歩ける' | 'ふらつきがある' | '補助・介助が必要' | 'ほぼ歩けない・寝たきり'
export type SenseLevel = '問題ない' | '衰えを感じる' | 'ほとんど機能していない'
export type CognitiveStatus = '症状なし' | '夜鳴き・徘徊などの兆候がある' | '認知症と診断済み'
export type SeniorDisease =
  | '腎臓病' | '心臓病' | '糖尿病' | '関節疾患・椎間板' | 'がん・腫瘍'
  | '認知症' | '肝臓病' | 'その他の慢性疾患' | 'なし'
export type MedStock = '備蓄なし' | '3日未満' | '3〜7日分' | '1〜2週間分' | '1か月以上'
export type ToiletStatus = '問題なし' | 'たまに失敗する' | '常時おむつ・介助が必要'
export type EvacuationMobility = '自力で歩いて避難できる' | '抱っこ・カートが必要' | 'ほぼ運んでもらう必要がある（寝たきり等）'
export type StressTolerance = '落ち着いている' | 'やや不安になりやすい' | '非常に神経質・パニックになりやすい'
export type VetContactStatus = '控えている' | '控えていない'

export interface SeniorDiagnosisFormData {
  // STEP1 基本情報
  petName?: string
  petType: SeniorPetType
  age: SeniorAgeRange
  weight?: number

  // STEP2 身体機能の変化
  mobility: MobilityLevel
  vision: SenseLevel
  hearing: SenseLevel
  cognitive: CognitiveStatus

  // STEP3 医療・持病
  diseases: SeniorDisease[]
  dailyMedication: 'あり' | 'なし'
  medStock: MedStock
  vetContactSaved: VetContactStatus

  // STEP4 避難時の状態
  evacuationMobility: EvacuationMobility
  toiletStatus: ToiletStatus
  stressTolerance: StressTolerance

  // STEP5 備え・住環境
  hasCarrierOrCart: 'ある' | 'ない'
  hasFamiliarBedding: 'ある' | 'ない'
  hasDiapers: 'ある' | 'ない・不要'
  hasTempCareItems: 'ある' | 'ない'
  hasElevator: 'あり' | 'なし・戸建て'
  hasHelper: 'いる（家族・近隣等）' | 'いない・一人で対応'
}

export interface SeniorRiskScores {
  mobilityRisk: number         // 0-100 高いほど身体機能面のリスクが高い
  medicalRisk: number          // 0-100 高いほど医療継続リスクが高い
  evacuationDifficulty: number // 0-100 高いほど避難が困難
  supplyLevel: number          // 0-100 高いほど備蓄・準備が充実
  overall: number               // 0-100 高いほど備えが充実
  rating: '◎ しっかり備えられています' | '○ 基本的な準備ができています' | '△ 要改善：備えが必要です' | '✗ 緊急の対応が必要です'
}

export interface SeniorDiagnosisReport {
  summary: {
    catchCopy: string
    overallMessage: string
    petName: string
  }
  riskScores: SeniorRiskScores
  topRisks: Array<{
    rank: number
    category: string
    title: string
    urgency: '緊急' | '重要' | '推奨'
    detail: string
  }>
  essentialSupplies: Array<{
    item: string
    reason: string
    priority: number
  }>
  dailyPrecautions: string[]
  vetConsultationPoints: string[]
  evacuationTips: string[]
  finalAdvice: string
}

export interface SeniorDiagnosisResult {
  formData: SeniorDiagnosisFormData
  scores: SeniorRiskScores
  report: SeniorDiagnosisReport
  createdAt: string
}
