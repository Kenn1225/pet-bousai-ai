// AI に生成させる必要がない項目をコード側で埋める。
//
// 出力トークンは入力の5倍の単価なので、決まりきった内容を AI に書かせないことが
// そのまま費用削減になる。あわせて表記ゆれもなくなり、結果が安定する。

import type { DiagnosisFormData, DiagnosisReport } from './types'
import { DISASTER_MASTER } from './disasterMaster'
import { PET_MASTER } from './petMaster'
import type { PetType } from './petMaster'
import { resolveDisasters, calcDisasterScores } from './scoring'

/** 全ユーザー共通の固定値。AI に毎回書かせる意味がない */
const EMERGENCY_CONTACTS: DiagnosisReport['emergencyContacts'] = {
  nearestVet: 'かかりつけ動物病院の連絡先を事前にメモしておく',
  emergencyVet: '夜間救急動物病院を調べておく',
  animalPoisonControl: '動物中毒110番（一般社団法人 日本中毒情報センター）: 072-726-9923',
}

function amazonUrl(keyword: string): string {
  return `https://www.amazon.co.jp/s?k=${encodeURIComponent(keyword)}`
}

/** 文字列を n 字以内に短縮（句読点は保護） */
function truncate(s: string, maxLen: number): string {
  if (s.length <= maxLen) return s
  let trimmed = s.substring(0, maxLen)
  // 句点の直後なら切る、なければ句点を付ける
  if (s[maxLen - 1] === '。' || s[maxLen - 1] === '、') return trimmed
  if (s[maxLen] === '。' || s[maxLen] === '、') return trimmed + s[maxLen]
  return trimmed + '。'
}

/** 備蓄品の理由テンプレート（15字以内の定型文） */
function getSupplyReason(item: string): string {
  const templates: Record<string, string> = {
    'クレート': '運搬と避難所で必須',
    'リード': '迷子防止に必須',
    'フード': '備蓄は最低1週間',
    ' 飲料水': '1日1L/kg が目安',
    'ケージ': '小動物に必須',
    'トイレ': '室内避難で必須',
    'キャリー': '持ち運びに必須',
    'シーツ': '衛生管理に重要',
    'タオル': '拭き取り・保温用',
    'ウェット': '断水時に有効',
  }
  for (const [key, reason] of Object.entries(templates)) {
    if (item.includes(key)) return reason
  }
  return '災害対策に効果的'
}


/**
 * AI のレポートに、マスターデータから決まる情報を後付けする。
 * 出力トークン削減のため、テンプレート化をとことん徹底する。
 */
export function enrichReport(report: DiagnosisReport, d: DiagnosisFormData): DiagnosisReport {
  // 緊急連絡先は固定
  report.emergencyContacts = EMERGENCY_CONTACTS

  // Amazon 検索リンクと理由テンプレートは品名から機械的に作れる
  if (Array.isArray(report.recommendedSupplies)) {
    for (const s of report.recommendedSupplies) {
      if (!s.amazonUrl && s.item) s.amazonUrl = amazonUrl(`ペット 防災 ${s.item}`)
      // 理由が空または長すぎたら、固定テンプレートで上書き（15字以内）
      if (!s.reason || s.reason.length > 15) {
        s.reason = getSupplyReason(s.item)
      }
    }
  }

  // ペット専用アドバイスは最初の2件だけ、各20字以内に短縮
  if (Array.isArray(report.petSpecificAdvice)) {
    report.petSpecificAdvice = report.petSpecificAdvice
      .slice(0, 2)
      .map(a => truncate(a, 20))
  }

  // 改善ロードマップは最初の2件だけ
  if (Array.isArray(report.improvementRoadmap)) {
    report.improvementRoadmap = report.improvementRoadmap.slice(0, 2)
  }

  // チェックリストは最初の4件だけ
  if (Array.isArray(report.checklist)) {
    report.checklist = report.checklist.slice(0, 4)
  }

  // 優先リスクの詳細を30字以内に短縮
  if (Array.isArray(report.topRisks)) {
    for (const r of report.topRisks) {
      r.detail = truncate(r.detail, 30)
    }
  }

  // 災害別プラン：猶予時間・避難の型・不足している備えはマスターと回答から確定する
  const wanted = resolveDisasters(d)
  const scores = calcDisasterScores(d)
  const fromAi = new Map(
    (report.disasterPlans ?? []).map(p => [p.disaster, p])
  )

  report.disasterPlans = wanted.map(t => {
    const m = DISASTER_MASTER[t]
    const ai = fromAi.get(t)

    return {
      disaster: t,
      // マスター由来（AI に書かせない）
      leadTime: `${m.leadTime}（${m.leadTimeNote}）`,
      evacuationStyle: m.evacuationStyle,
      // AI 由来。生成が欠けた災害はマスターの定石で埋めて穴を作らない
      firstAction: ai?.firstAction || m.primaryAction,
      petAction: ai?.petAction || m.petActions[0],
      caution: ai?.caution || m.petRisks[0],
      // 「持っていない備え」は回答から機械的に出せる
      missingSupplies: missingFor(t, d),
    }
  })
  // 該当度が高いのに備えが薄い災害を先頭に
  .sort((a, b) => {
    const sa = scores.find(s => s.disaster === a.disaster)
    const sb = scores.find(s => s.disaster === b.disaster)
    const ga = sa ? sa.exposure - sa.readiness : 0
    const gb = sb ? sb.exposure - sb.readiness : 0
    return gb - ga
  })

  return report
}

/** 回答から「持っていない備え」を機械的に洗い出す */
function missingFor(t: keyof typeof DISASTER_MASTER, d: DiagnosisFormData): string[] {
  const m = DISASTER_MASTER[t]
  const missing: string[] = []

  if (d.hasCrate !== 'ある') missing.push('クレート・キャリー')
  if (d.waterStock !== '3日分以上備蓄あり') missing.push('飲料水の備蓄')
  if (['3日未満', '3〜5日'].includes(d.foodStock)) missing.push('1週間分のフード')
  if (d.hasFirstAid !== 'ある') missing.push('ペット用救急セット')

  // 災害固有の備えのうち、まだ挙がっていないものを2つまで足す
  for (const s of m.keySupplies) {
    if (missing.length >= 4) break
    if (!missing.includes(s)) missing.push(s)
  }
  return missing.slice(0, 4)
}

/** ペット種別から避難所の受け入れ状況を返す（結果画面の注意喚起用） */
export function shelterStatusOf(d: DiagnosisFormData): string {
  const primary = (d.pets?.[0]?.type ?? 'その他') as PetType
  return PET_MASTER[primary]?.shelterStatus ?? '△ 要確認'
}
