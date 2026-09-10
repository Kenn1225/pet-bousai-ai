import type { DiagnosisFormData, RiskScores } from './types'
import { PET_MASTER } from './petMaster'
import type { PetType } from './petMaster'
import { DISASTER_MASTER } from './disasterMaster'
import { calcDisasterScores, resolveDisasters } from './scoring'

export function buildDiagnosisPrompt(d: DiagnosisFormData, scores: RiskScores): string {
  const petsText = (d.pets ?? []).map(p => `${p.type} ${p.count}匹`).join('、')
  const totalCount = (d.pets ?? []).reduce((s, p) => s + p.count, 0)
  const primaryType = (d.pets?.[0]?.type ?? 'その他') as PetType
  const hasDog = d.pets?.some(p => p.type === '犬')
  const master = PET_MASTER[primaryType]

  const dogInfo = hasDog
    ? `犬種: ${d.dogBreed ?? '不明'}, サイズ: ${d.dogSize ?? '不明'}, 体重: ${d.dogWeight ? d.dogWeight + 'kg' : '不明'}, 1日運動: ${d.exercise?.dailyMinutes ?? '?'}分（${d.exercise?.exerciseType ?? '散歩'}）`
    : ''

  const b = d.behavior
  const behaviorText = b
    ? `知らない人への反応: ${b.strangerReaction}/10, 動物への反応: ${b.animalReaction}/10, クレート慣れ: ${b.crateComfort}/10, 騒音耐性: ${b.noiseReaction}/10, 留守番: ${b.aloneAbility}/10, ストレス耐性: ${b.stressTolerance}/10`
    : '未回答'

  const healthUrgency = scores.healthRisk >= 60
    ? '※ 持病・投薬あり。避難先での医療継続が最重要課題。薬の備蓄量を具体的に提示すること。'
    : ''
  const evacuationNote = scores.evacuationDifficulty >= 60
    ? '※ 避難難易度が高い。同行避難の具体手順・車中泊・ペットホテル等の代替案を優先提案すること。'
    : ''
  const supplyNote = scores.supplyLevel < 40
    ? '※ 備蓄が著しく不足。72時間緊急リストを最優先で提示すること。'
    : ''
  const multiPetNote = totalCount >= 3
    ? `※ ${totalCount}匹の多頭避難。家族内の役割分担・優先順位・避難の順序を具体的に提案すること。`
    : ''
  const cannotBringNote = master?.shelterStatus === '× 不可'
    ? `※ ${primaryType}は多くの避難所で受け入れ不可。代替避難先（車中泊・ペットホテル・知人宅等）の具体的確保方法を提案すること。`
    : ''

  // ── 災害種別ごとの前提とスコア ──
  const disasters = resolveDisasters(d)
  const disasterScores = calcDisasterScores(d)
  const scoreOf = (t: string) => disasterScores.find(s => s.disaster === t)

  const disasterBrief = disasters.map(t => {
    const p = DISASTER_MASTER[t]
    const sc = scoreOf(t)
    return `### ${p.emoji} ${t}
- 猶予時間: ${p.leadTime}（${p.leadTimeNote}）
- 避難の型: ${p.evacuationStyle}
- 基本行動: ${p.primaryAction}
- 判断材料: ${p.warningInfo}
- ペット特有のリスク: ${p.petRisks.join(' / ')}
- 定石の行動: ${p.petActions.join(' / ')}
- 特に効く備え: ${p.keySupplies.join('、')}
- この家庭の該当度: ${sc?.exposure ?? 50}/100 ／ 備えの充足度: ${sc?.readiness ?? 50}/100`
  }).join('\n\n')

  // 該当度が高いのに備えが薄い＝この家庭の穴
  const weakest = [...disasterScores]
    .filter(s => s.exposure >= 50)
    .sort((a, b) => (a.readiness - a.exposure) - (b.readiness - b.exposure))[0]
  const weakestNote = weakest
    ? `※ 「${weakest.disaster}」は該当度${weakest.exposure}に対し備えが${weakest.readiness}と最も手薄。topRisksの1位はこの災害に関するものにすること。`
    : ''

  // leadTime / evacuationStyle / missingSupplies はマスターと回答から確定するため
  // AI には書かせない（reportDefaults.ts で後付けする）。出力トークンの削減にもなる
  const disasterPlanSchema = disasters
    .map(t => `    {"disaster": "${t}", "firstAction": "string（45字以内）", "petAction": "string（60字以内・このペットの特性を反映）", "caution": "string（45字以内・この家庭固有の落とし穴）"}`)
    .join(',\n')

  const jsonSchema = `{
  "summary": {
    "catchCopy": "string（20字以内のキャッチコピー。ペットの名前${d.petName ? `「${d.petName}」` : ''}を入れると良い）",
    "overallMessage": "string（100〜130字の総評。共感・励ましを含める）",
    "petName": "${d.petName ?? 'うちの子'}"
  },
  "riskScores": {
    "healthRisk": ${scores.healthRisk},
    "evacuationDifficulty": ${scores.evacuationDifficulty},
    "supplyLevel": ${scores.supplyLevel},
    "behaviorScore": ${scores.behaviorScore},
    "disasterReadiness": ${scores.disasterReadiness},
    "overall": ${scores.overall},
    "rating": "${scores.rating}"
  },
  "disasterPlans": [
${disasterPlanSchema}
  ],
  "topRisks": [
    {"rank": 1, "category": "string", "title": "string", "urgency": "緊急|重要|推奨", "detail": "string（20字以内・核だけ）"},
    {"rank": 2, "category": "string", "title": "string", "urgency": "緊急|重要|推奨", "detail": "string（20字以内・核だけ）"},
    {"rank": 3, "category": "string", "title": "string", "urgency": "緊急|重要|推奨", "detail": "string（20字以内・核だけ）"}
  ],
  "recommendedSupplies": [
    {"item": "string", "quantity": "string", "reason": "string（省略可・コード側で埋める）", "priority": 1}
  ],
  "actionPlan": {
    "min0_10": "string（最初の10分でやること）",
    "min10_30": "string（10〜30分）",
    "min30_60": "string（30〜60分）",
    "day1_3": "string（1〜3日目にやること）"
  },
  "shelterInfo": {
    "primary": {"name": "string", "distance": "string", "walkMin": 0, "petOk": true, "note": "string"},
    "secondary": {"name": "string", "distance": "string", "walkMin": 0, "petOk": false, "note": "string"},
    "alternatives": ["車中泊（自家用車）", "ペット可ホテル事前確保を推奨"]
  },
  "shelterRisks": [
    {"risk": "string（避難所での具体的リスク）", "prevention": "string（予防・対処法）"}
  ],
  "improvementRoadmap": [
    {"priority": 1, "action": "string", "deadline": "今週中|今月中|3か月以内|6か月以内", "difficulty": "低|中|高", "estimatedCost": "string（概算費用）"}
  ],
  "petSpecificAdvice": ["string", "string", "string"],
  "exerciseAdvice": "string（60字以内・避難生活中の運動とストレス解消）",
  "checklist": [
    {"item": "string", "done": false, "category": "書類|フード|グッズ|医療|行動"}
  ]
}`

  return `ペット防災専門家AIとして、以下の情報をもとに防災レポートをJSON形式のみで出力してください（コードブロック不要、説明文不要）。各テキストは日本語で簡潔に（50〜80字以内）。

## ペット基本情報
- 名前: ${d.petName ?? '（未入力）'}
- 飼育ペット: ${petsText}（合計 ${totalCount} 匹）
- 代表ペット: ${primaryType}（避難所: ${master?.shelterStatus ?? '要確認'}）
- 年齢: ${d.age}
- 性別: ${d.gender}（${d.neutered === '済' ? '去勢・避妊済' : '未去勢・未避妊'}）
- ワクチン: ${d.vaccinationStatus ?? '不明'}
${dogInfo ? `- 犬の詳細: ${dogInfo}` : ''}

## 健康状態
- 持病: ${d.diseases.join('、')}
- 投薬: ${d.medication}
- 特別食: ${d.specialDiet}

## 行動特性スコア（1〜10点）
${behaviorText}
- 総合行動スコア: ${scores.behaviorScore}/100

## 住環境・家族
- 住居: ${d.residenceType} ${d.floor}${d.elevator && d.elevator !== '該当なし（戸建て）' ? `（EV: ${d.elevator}）` : ''}
- 同居人数: ${d.familySize}
- 自動車: ${d.hasCarOrTransport}
- 郵便番号: ${d.postalCode}

## 地域災害リスク
- 水害リスク: ${d.riverProximity}
- 土砂災害: ${d.landslideRisk}
- 津波リスク: ${d.tsunamiRisk}
- 避難所確認状況: ${d.shelterConfirmed}
- 想定する災害: ${disasters.join('、')}

## 想定災害ごとの前提（この内容を踏まえて disasterPlans を書くこと）
${disasterBrief}

## 備蓄状況
- フード: ${d.foodStock}
- 水: ${d.waterStock}
- キャリー: ${d.hasCrate}
- 迷子札: ${d.hasIdTag}
- マイクロチップ: ${d.hasMicrochip}
- 救急セット: ${d.hasFirstAid}
- 診察記録: ${d.hasMedRecord}

## 診断スコア
- 健康リスク: ${scores.healthRisk}/100
- 避難難易度: ${scores.evacuationDifficulty}/100
- 備蓄充足度: ${scores.supplyLevel}/100
- 行動スコア: ${scores.behaviorScore}/100
- 想定災害への対応力: ${scores.disasterReadiness}/100
- 総合: ${scores.overall}/100（${scores.rating}）

## ペット固有の特性・注意事項
- 避難所リスク: ${master?.shelterRisks.join('、') ?? '不明'}
- 避難所でかかりやすい病気: ${master?.commonShelterDiseases.join('、') ?? '不明'}
- 救援物資フード: ${master?.emergencyFood ?? '不明'}
- 特別フード注意: ${master?.specialFoodNote ?? 'なし'}
- 最低備蓄日数: ${master?.minStockDays ?? 7}日

## 特記事項
${healthUrgency}
${evacuationNote}
${supplyNote}
${multiPetNote}
${cannotBringNote}
${weakestNote}

## 出力要件（厳格に従う）
- JSON形式のみで出力（説明文・コードブロック不要）
- disasterPlansは ${disasters.length} 件すべて出力。firstAction/petAction/caution は**指定の字数厳守**
- topRisks：3件・category と title は短く（各5字以内）・detail は20字以内
- recommendedSupplies：理由は記載なし（コード側で自動埋め）。item/quantity/priority のみ
- petSpecificAdvice：実装側で2件に短縮（ここでは3つ書いてOK）
- 前置き・説明・繰り返し厳禁。文法的な完全性より「核だけ」を優先

以下のJSONスキーマに完全に従って出力してください（JSONのみ・コードブロック不要）：
${jsonSchema}`
}
