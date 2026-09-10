// マンション避難チェック診断（ペット同行避難特化）— 型定義

export type MansionPetType = '犬' | '猫' | 'その他小動物'
export type PetWeightClass = '〜3kg' | '3〜10kg' | '10〜25kg' | '25kg以上'
export type CarrierFamiliarity = '慣れている' | 'あまり慣れていない' | '全く慣れていない'
export type ElevatorCount = '1基のみ' | '複数基'
export type ElevatorEmergencyOp = '対応している（管理人常駐等）' | '対応していない' | 'わからない'
export type StairsKnowledge = '把握している' | 'なんとなく知っている' | '知らない'
export type PracticeExperience = 'ある' | 'ない'
export type YesNoUnknown = 'ある' | 'ない' | 'わからない'
export type HomeEvacuationPlan = '在宅避難する予定' | '避難所に行く予定' | '未定'
export type SupplyStock = 'なし' | '3日未満' | '3〜7日分' | '1〜2週間分' | '2週間以上'
export type ToiletPrep = '準備している' | '準備していない'

export interface MansionDiagnosisFormData {
  // STEP1 住居情報
  floor: number              // 居住階（5〜60）
  totalFloors?: number       // 建物の総階数（任意）
  elevatorCount: ElevatorCount
  elevatorEmergencyOp: ElevatorEmergencyOp

  // STEP2 ペット情報
  petName?: string
  petType: MansionPetType
  weightClass: PetWeightClass
  carrierFamiliarity: CarrierFamiliarity

  // STEP3 避難手段の準備
  stairsKnowledge: StairsKnowledge
  hasEvacuationCarrier: 'ある' | 'ない'
  practiceExperience: PracticeExperience
  hasLightSource: 'ある' | 'ない'

  // STEP4 建物・管理組合の備え
  managementPetPlan: YesNoUnknown
  drillParticipation: PracticeExperience
  autoLockKnowledge: '知っている' | '知らない'
  waterPumpRisk: '知っている' | '知らない'

  // STEP5 在宅避難・備蓄
  evacuationPlan: HomeEvacuationPlan
  waterFoodStock: SupplyStock
  toiletPrep: ToiletPrep
  furnitureFixed: 'している' | 'していない'
}

export interface MansionRiskScores {
  floorRisk: number             // 0-100 高いほど階数によるリスクが高い
  evacuationReadiness: number   // 0-100 高いほど避難準備が整っている
  buildingPreparedness: number  // 0-100 高いほど建物・管理組合の備えが整っている
  stockpileLevel: number        // 0-100 高いほど備蓄が充実
  overall: number
  rating: '◎ しっかり備えられています' | '○ 基本的な準備ができています' | '△ 要改善：備えが必要です' | '✗ 緊急の対応が必要です'
}

export interface MansionDiagnosisReport {
  summary: {
    catchCopy: string
    overallMessage: string
    petName: string
  }
  riskScores: MansionRiskScores
  floorTierAdvice: {
    tier: string
    strategy: string
  }
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
  evacuationSteps: string[]
  buildingChecklist: string[]
  finalAdvice: string
}

export interface MansionDiagnosisResult {
  formData: MansionDiagnosisFormData
  scores: MansionRiskScores
  report: MansionDiagnosisReport
  createdAt: string
}
