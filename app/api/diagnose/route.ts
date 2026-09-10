import { NextRequest, NextResponse } from 'next/server'
import type { DiagnosisFormData, DiagnosisReport } from '@/lib/types'
import { calcRiskScores } from '@/lib/scoring'
import { enrichReport } from '@/lib/reportDefaults'

// 無料版: ルールベース診断（AI不使用、0円、確実に動作）
export async function POST(req: NextRequest) {
  try {
    const formData: DiagnosisFormData = await req.json()

    // スコア計算
    const scores = calcRiskScores(formData)

    // ルールベースレポート生成
    const report = generateFreeReport(formData, scores)

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[diagnose] mode=free_ruleset pet=${formData.pets?.[0]?.type ?? 'unknown'}`)
    }

    return NextResponse.json({ report, scores, formData })
  } catch (err) {
    console.error('[diagnose] error:', err)
    const errorMsg = err instanceof Error ? err.message : '診断中にエラーが発生しました'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}

function generateFreeReport(formData: DiagnosisFormData, scores: any): DiagnosisReport {
  const petType = formData.pets?.[0]?.type ?? 'ペット'
  const petName = formData.petName || petType

  // ベースレポート構造（最小限で）
  const report: DiagnosisReport = {
    summary: {
      catchCopy: `${petName}との安心な避難計画`,
      overallMessage: `このレポートをきっかけに、ご家族とペットの避難計画を今からスタートしましょう。事前の準備と心構えが、いざという時のペット同行避難の成功を左右します。`,
      petName: petName,
    },
    riskScores: scores,
    topRisks: [
      { rank: 1, category: '備蓄', title: 'ペットフードの確保', urgency: '重要', detail: '最低7日分の備蓄が必要です' },
      { rank: 2, category: '避難', title: 'ペット同行避難所の確認', urgency: '重要', detail: 'ペット可能な避難所を事前に確認してください' },
      { rank: 3, category: '準備', title: 'キャリーの用意', urgency: '推奨', detail: '避難時の運搬に必須です' },
    ],
    recommendedSupplies: [
      { item: 'ペットフード', quantity: '最低7日分', reason: 'ペットの栄養維持に必須', priority: 1 },
      { item: 'ペット用飲料水', quantity: '1日1L以上/kg', reason: '脱水症状防止', priority: 1 },
      { item: 'キャリー・クレート', quantity: '1個', reason: '避難時の運搬・避難所受け入れに必須', priority: 1 },
      { item: '迷子札', quantity: '1個', reason: '脱走・迷子防止', priority: 2 },
    ],
    actionPlan: {
      min0_10: '1. ペットの安全確保 2. 人も自分の身を守る 3. 一度落ち着く',
      min10_30: '1. ペットをキャリーに入れる 2. 必要な持ち物を確認 3. 避難経路を確認',
      min30_60: '1. 避難ルート確認 2. ペット可能な避難所へ 3. 状況確認',
      day1_3: '1. ペットの健康確認 2. 食料・水の確保 3. 情報収集',
    },
    shelterInfo: {
      primary: { name: '地元の避難所（要事前確認）', distance: '1km程度', walkMin: 15, petOk: false, note: 'ペット可否を事前に確認してください' },
      secondary: { name: '友人・親戚宅など', distance: '3km程度', walkMin: 45, petOk: true, note: 'ペット受け入れ可能な代替先を用意' },
      alternatives: ['自宅での一時シェルター準備', '地域の動物病院への相談'],
    },
    shelterRisks: [
      { risk: 'ストレスによる食欲不振', prevention: 'いつものおやつを持参' },
      { risk: 'トイレの問題', prevention: 'ペット用トイレシーツを携帯' },
      { risk: '他のペットとのトラブル', prevention: 'クレートで隔離、スタッフに相談' },
    ],
    improvementRoadmap: [
      { priority: 1, action: 'ペットフード7日分を買い足す', deadline: '1ヶ月以内', difficulty: '低', estimatedCost: '3000-5000円' },
      { priority: 2, action: 'ペット可能な避難所を3ヶ所確認', deadline: '3ヶ月以内', difficulty: '中', estimatedCost: '0円' },
      { priority: 3, action: 'ペット用キャリーを用意', deadline: '6ヶ月以内', difficulty: '低', estimatedCost: '2000-8000円' },
    ],
    petSpecificAdvice: [
      `${petName}は、ストレスに弱い可能性があります。いつもの環境に近い避難先を準備してください。`,
      '避難時はキャリーでの移動が安全です。事前に慣れさせることをお勧めします。',
      'ペット同行避難を想定した家族の話し合いを定期的に行いましょう。',
    ],
    checklist: [
      { item: 'ペットの写真と健康記録を準備', done: false, category: '準備' },
      { item: '7日分以上の備蓄を確保', done: false, category: '備蓄' },
      { item: 'ペット可能な避難先を複数確保', done: false, category: '避難' },
      { item: '健康診断を受け、健康状態を把握', done: false, category: '準備' },
      { item: 'ペット可能な避難所を事前に確認', done: false, category: '避難' },
    ],
    emergencyContacts: {
      nearestVet: '地元の動物病院（事前に確認）',
      emergencyVet: '24時間対応の動物病院（リサーチ推奨）',
      animalPoisonControl: 'お住まいの地域の動物愛護センター',
    },
    disasterPlans: [],
  }

  // 詳細情報で強化（disasterPlans を生成）
  enrichReport(report, formData)

  return report
}
