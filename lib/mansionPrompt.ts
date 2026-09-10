import type { MansionDiagnosisFormData, MansionRiskScores } from './mansionTypes'
import { getFloorTier } from './mansionScoring'

export function buildMansionDiagnosisPrompt(d: MansionDiagnosisFormData, scores: MansionRiskScores): string {
  const name = d.petName ?? (d.petType === '犬' ? 'ワンちゃん' : d.petType === '猫' ? 'ネコちゃん' : 'うちの子')
  const floorTier = getFloorTier(d.floor)

  const floorNote = scores.floorRisk >= 75
    ? '※ 超高層階。エレベーター復旧には数日〜1週間以上かかる想定で、階段避難は原則リスク行為と位置づけること。在宅避難（垂直避難）を軸に、水・電気・トイレの自給体制を最重要課題として扱うこと。'
    : scores.floorRisk >= 55
    ? '※ 高層階。階段避難は体力的・現実的に困難。余震が続く間は在宅避難を基本方針とし、無理な階段避難を避けるよう助言すること。'
    : ''
  const readinessNote = scores.evacuationReadiness < 40
    ? '※ 避難手段の準備が不足。非常階段の場所確認・避難用キャリーの準備を最優先で提示すること。'
    : ''
  const buildingNote = scores.buildingPreparedness < 40
    ? '※ 管理組合・建物側の備えについての把握が不足。管理組合への確認方法を具体的に提案すること。'
    : ''
  const stockNote = scores.stockpileLevel < 40
    ? '※ 備蓄が著しく不足。高層階では支援物資到着が遅れやすいため、最低限そろえるべき品を具体的に提示すること。'
    : ''

  const jsonSchema = `{
  "summary": {
    "catchCopy": "string（20字以内のキャッチコピー。「${name}」と「${d.floor}階」を意識した内容）",
    "overallMessage": "string（150〜200字の総評。共感と励ましを含める）",
    "petName": "${name}"
  },
  "riskScores": {
    "floorRisk": ${scores.floorRisk},
    "evacuationReadiness": ${scores.evacuationReadiness},
    "buildingPreparedness": ${scores.buildingPreparedness},
    "stockpileLevel": ${scores.stockpileLevel},
    "overall": ${scores.overall},
    "rating": "${scores.rating}"
  },
  "floorTierAdvice": {
    "tier": "${floorTier.tier}",
    "strategy": "string（${floorTier.tier}の住民に向けた基本戦略を100〜150字で具体的に）"
  },
  "topRisks": [
    {"rank": 1, "category": "string", "title": "string", "urgency": "緊急|重要|推奨", "detail": "string（80〜120字）"},
    {"rank": 2, "category": "string", "title": "string", "urgency": "緊急|重要|推奨", "detail": "string（80〜120字）"},
    {"rank": 3, "category": "string", "title": "string", "urgency": "緊急|重要|推奨", "detail": "string（80〜120字）"}
  ],
  "essentialSupplies": [
    {"item": "string（マンション避難・在宅避難だからこそ必要な物）", "reason": "string", "priority": 1}
  ],
  "evacuationSteps": ["string（実際に地震が起きた直後からの避難手順を時系列で）", "string", "string", "string"],
  "buildingChecklist": ["string（管理組合・建物に事前確認すべき項目）", "string", "string"],
  "finalAdvice": "string（150〜200字。最後に飼い主が安心できる、最も重要なメッセージ）"
}`

  return `マンション防災・ペット同行避難の専門家AIとして、以下の情報をもとに「マンション避難チェック診断」レポートをJSON形式のみで出力してください（コードブロック不要、説明文不要）。各テキストは日本語で簡潔に。

## 住居情報
- 居住階: ${d.floor}階${d.totalFloors ? `（建物全体 ${d.totalFloors}階建て）` : ''}
- 階層帯: ${floorTier.tier}
- エレベーター基数: ${d.elevatorCount}
- 地震時管理運転: ${d.elevatorEmergencyOp}

## ペット情報
- 名前: ${d.petName ?? '（未入力）'}
- 種類: ${d.petType}
- 体重区分: ${d.weightClass}
- キャリー・カートへの慣れ: ${d.carrierFamiliarity}

## 避難手段の準備
- 非常階段の把握: ${d.stairsKnowledge}
- 避難用キャリー・カート: ${d.hasEvacuationCarrier}
- 階段避難の練習経験: ${d.practiceExperience}
- 停電時の光源（懐中電灯等）: ${d.hasLightSource}

## 建物・管理組合の備え
- 管理組合の防災マニュアルにペット同行避難の記載: ${d.managementPetPlan}
- 防災訓練への参加経験: ${d.drillParticipation}
- オートロックの停電時対応の把握: ${d.autoLockKnowledge}
- 給水ポンプ停止リスクの認識: ${d.waterPumpRisk}

## 在宅避難・備蓄
- 避難方針: ${d.evacuationPlan}
- 水・フードの備蓄: ${d.waterFoodStock}
- 断水時トイレ対策: ${d.toiletPrep}
- 家具・ケージ周りの転倒防止: ${d.furnitureFixed}

## 診断スコア
- 階数リスク: ${scores.floorRisk}/100
- 避難準備度: ${scores.evacuationReadiness}/100
- 建物・管理組合の備え: ${scores.buildingPreparedness}/100
- 備蓄充足度: ${scores.stockpileLevel}/100
- 総合: ${scores.overall}/100（${scores.rating}）

## 特記事項
${floorNote}
${readinessNote}
${buildingNote}
${stockNote}

## 出力要件
- floorTierAdviceは${d.floor}階（${floorTier.tier}）の実情に即した具体的な戦略にすること
- topRisksは必ず3件（スコアが最も悪い領域を優先）
- essentialSuppliesは6〜8件（高層階ほど支援物資到達が遅れる前提で、priority 1〜3で分類）
- evacuationStepsは4〜5件（地震発生直後からの時系列の具体的行動）
- buildingChecklistは3件（管理組合・建物側に確認すべき項目）
- finalAdviceは飼い主が「これなら${name}と一緒に乗り越えられる」と思える、最も重要なメッセージを1つ
- 全体のトーンは「怖がらせない・でも具体的・すぐ動ける」
- 5階建てから60階建てまで階数によって最適な避難戦略が大きく異なることを踏まえ、${d.floor}階の住民に最適化した内容にすること
- エレベーターは地震後、点検が終わるまで使用してはいけないことを踏まえた助言にすること

以下のJSONスキーマに完全に従って出力してください（JSONのみ・コードブロック不要）：
${jsonSchema}`
}
