// AI版プロンプト構築

import type { LocationFormData, LocationRiskScores } from './locationTypes'
import { lookupPostalCode } from './postalMaster'
import { getPrefectureHazard } from './prefectureHazardMaster'
import { PET_MASTER } from './petMaster'
import type { PetType } from './petMaster'
import { DISASTER_MASTER } from './disasterMaster'

export function buildLocationPrompt(formData: LocationFormData, scores: LocationRiskScores): string {
  const location = lookupPostalCode(formData.postalCode)
  const prefHazard = getPrefectureHazard(location.prefecture)
  if (!prefHazard) throw new Error(`Unknown prefecture: ${location.prefecture}`)

  const petType = formData.petType as PetType
  const petMaster = PET_MASTER[petType]

  const disasterBrief = scores.exposures
    .map((exp) => {
      const m = DISASTER_MASTER[exp.disaster]
      return `### ${m.emoji} ${exp.disaster}
- 猶予時間: ${m.leadTime}
- 避難の型: ${m.evacuationStyle}
- 基本行動: ${m.primaryAction}
- ペットリスク: ${m.petRisks[0]}
- ペット対策: ${m.petActions.slice(0, 2).join(' / ')}
- 必須備蓄: ${m.keySupplies.slice(0, 2).join('、')}
- この地域での該当度: ${exp.exposure}/100`
    })
    .join('\n\n')

  return `地域の災害リスク を考慮したペット同行避難アドバイスAIとして、以下の情報をもとに防災レポートをJSON形式のみで出力してください（コードブロック不要、説明文不要）。簡潔に、日本語で。

## 地域情報
- 郵便番号: ${formData.postalCode}
- 都道府県: ${location.prefecture}
- 市区町村: ${location.city ?? '（未登録・都道府県レベル推定）'}
- 判定精度: ${location.matchLevel === 'city' ? '市区町村レベル' : '都道府県レベル（フォールバック）'}

## ペット情報
- ペット種: ${petType}
- 避難所受け入れ: ${petMaster.shelterStatus}
- ストレス感受性: ${petMaster.stressSensitivity}
- 最低備蓄日数: ${petMaster.minStockDays}日

## 地域の災害傾向
- 地震: ${prefHazard.earthquakeTendency}
- 台風: ${prefHazard.typhoonFrequency}
- 豪雪: ${prefHazard.heavySnowArea ? 'あり' : 'なし'}
- 活火山: ${prefHazard.hasActiveVolcano ? 'あり' : 'なし'}

## 想定される災害ごとの対策
${disasterBrief}

## スコア
- 地域リスクレベル: ${scores.regionalRiskLevel}/100
- ペット同行避難の困難度: ${scores.petEvacuationDifficulty}/100
- 総合: ${scores.overall}/100 (${scores.rating})

## 出力要件（厳格に従う）
- JSON形式のみで出力（説明文・コードブロック不要）
- topDisasters: 上位3災害、各100字以内で
- petSpecificAdvice: 2行（この地域・このペット種に特化した一言ずつ）
- essentialSupplies: 3〜4品（理由は短く、20字以内）
- finalAdvice: 100〜120字の励まし
- すべて日本語、簡潔さを優先

以下のJSONスキーマに完全に従って出力してください：
{
  "summary": {
    "catchCopy": "string（20字以内のキャッチコピー。地域+ペット種の特性反映）",
    "overallMessage": "string（この地域・このペットの同行避難についての総評、100〜150字）"
  },
  "topDisasters": [
    {
      "disaster": "string（災害名）",
      "firstAction": "string（この地域での最初の行動、30〜40字以内）",
      "petAction": "string（ペット側のアクション、30〜40字以内・このペット種を反映）",
      "caution": "string（この地域・このペット種に固有の注意点、25〜35字以内）"
    }
  ],
  "petSpecificAdvice": ["string", "string"],
  "essentialSupplies": [
    {"item": "string（品名）", "reason": "string（理由・概算コスト、20字以内）", "priority": 1}
  ],
  "finalAdvice": "string（100〜120字の最後の励まし）"
}`
}
