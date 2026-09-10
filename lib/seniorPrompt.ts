import type { SeniorDiagnosisFormData } from './seniorTypes'
import type { SeniorRiskScores } from './seniorTypes'

export function buildSeniorDiagnosisPrompt(d: SeniorDiagnosisFormData, scores: SeniorRiskScores): string {
  const name = d.petName ?? (d.petType === '犬' ? 'ワンちゃん' : 'ネコちゃん')

  const mobilityNote = scores.mobilityRisk >= 55
    ? '※ 歩行・認知機能の低下が大きい。抱っこ紐やスリング、キャリーでの移動を前提とした具体策を優先すること。'
    : ''
  const medicalNote = scores.medicalRisk >= 55
    ? '※ 持病・投薬リスクが高い。避難先での投薬継続と、かかりつけ医・処方薬情報の携帯を最重要課題として扱うこと。'
    : ''
  const evacuationNote = scores.evacuationDifficulty >= 55
    ? '※ 避難難易度が高い。同行避難時に一人で運べない可能性を踏まえ、車中泊や助け手の確保を具体的に提案すること。'
    : ''
  const supplyNote = scores.supplyLevel < 40
    ? '※ 備えが著しく不足。今すぐ揃えるべき必須品を最優先で提示すること。'
    : ''

  const jsonSchema = `{
  "summary": {
    "catchCopy": "string（20字以内のキャッチコピー。「${name}」を入れると良い）",
    "overallMessage": "string（150〜200字の総評。高齢ペットへの共感と励ましを含める）",
    "petName": "${name}"
  },
  "riskScores": {
    "mobilityRisk": ${scores.mobilityRisk},
    "medicalRisk": ${scores.medicalRisk},
    "evacuationDifficulty": ${scores.evacuationDifficulty},
    "supplyLevel": ${scores.supplyLevel},
    "overall": ${scores.overall},
    "rating": "${scores.rating}"
  },
  "topRisks": [
    {"rank": 1, "category": "string", "title": "string", "urgency": "緊急|重要|推奨", "detail": "string（80〜120字）"},
    {"rank": 2, "category": "string", "title": "string", "urgency": "緊急|重要|推奨", "detail": "string（80〜120字）"},
    {"rank": 3, "category": "string", "title": "string", "urgency": "緊急|重要|推奨", "detail": "string（80〜120字）"}
  ],
  "essentialSupplies": [
    {"item": "string（老犬・老猫だからこそ必要な準備品）", "reason": "string", "priority": 1}
  ],
  "dailyPrecautions": ["string（普段からの注意点）", "string", "string", "string"],
  "vetConsultationPoints": ["string（獣医師に相談すべき点）", "string", "string"],
  "evacuationTips": ["string（避難時の具体的な工夫・手順）", "string", "string"],
  "finalAdvice": "string（150〜200字。最後に飼い主が安心できる、最も重要なメッセージ）"
}`

  return `高齢ペット（シニア犬・シニア猫）の災害対策専門アドバイザーAIとして、以下の情報をもとに「高齢ペット災害対策診断」レポートをJSON形式のみで出力してください（コードブロック不要、説明文不要）。各テキストは日本語で簡潔に。

## ペット基本情報
- 名前: ${d.petName ?? '（未入力）'}
- 種類: ${d.petType}
- 年齢: ${d.age}
- 体重: ${d.weight ? d.weight + 'kg' : '不明'}

## 身体機能の変化
- 歩行状態: ${d.mobility}
- 視力: ${d.vision}
- 聴力: ${d.hearing}
- 認知機能: ${d.cognitive}

## 医療・持病
- 持病: ${(d.diseases ?? []).join('、')}
- 毎日の投薬: ${d.dailyMedication}
- 薬の備蓄: ${d.medStock}
- かかりつけ医連絡先: ${d.vetContactSaved}

## 避難時の状態
- 避難時の移動: ${d.evacuationMobility}
- トイレ・排泄: ${d.toiletStatus}
- ストレス耐性: ${d.stressTolerance}

## 備え・住環境
- キャリー・カート: ${d.hasCarrierOrCart}
- 使い慣れた毛布・匂いのあるグッズ: ${d.hasFamiliarBedding}
- おむつ・介護用品: ${d.hasDiapers}
- 防寒・防暑グッズ: ${d.hasTempCareItems}
- エレベーター: ${d.hasElevator}
- 避難を手伝える人: ${d.hasHelper}

## 診断スコア
- 身体機能リスク: ${scores.mobilityRisk}/100
- 医療継続リスク: ${scores.medicalRisk}/100
- 避難難易度: ${scores.evacuationDifficulty}/100
- 備蓄充足度: ${scores.supplyLevel}/100
- 総合: ${scores.overall}/100（${scores.rating}）

## 特記事項
${mobilityNote}
${medicalNote}
${evacuationNote}
${supplyNote}

## 出力要件
- topRisksは必ず3件（スコアが最も悪い領域を優先）
- essentialSuppliesは6〜8件（老犬・老猫だからこそ必要な物を中心に、priority 1〜3で分類）
- dailyPrecautionsは4件（普段の生活の中での注意点）
- vetConsultationPointsは3件（災害に備えて獣医師に相談すべき具体的な点）
- evacuationTipsは3件（避難時の具体的な工夫・手順）
- finalAdviceは飼い主が「これなら安心して備えられる」と思える、最も重要なメッセージを1つ
- 全体のトーンは「怖がらせない・でも具体的・すぐ動ける」
- ペットの名前「${name}」を入れてパーソナライズ
- 高齢ゆえの身体的制約（歩行困難・視聴覚低下・認知機能低下・慢性疾患）を踏まえた、若いペットとは異なる具体策にすること

以下のJSONスキーマに完全に従って出力してください（JSONのみ・コードブロック不要）：
${jsonSchema}`
}
