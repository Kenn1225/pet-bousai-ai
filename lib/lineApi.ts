import { kv } from '@vercel/kv'
import { STEPS, ACCESS_CODE_PLACEHOLDER, type LineMessage } from './lineScenario'

const LINE_API = 'https://api.line.me/v2/bot/message'

function channelToken() {
  const t = process.env.LINE_CHANNEL_ACCESS_TOKEN
  if (!t) throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not set')
  return t
}

// ──────────────────────────────────────────────
// KV スキーマ
// ──────────────────────────────────────────────

export type LineUser = {
  userId: string
  addedAt: string          // ISO 8601
  accessCode: string
  stepsDelivered: number[] // 配信済みステップの dayOffset 一覧
  diagnosisScore: number | null
  diagnosisGrade: 'A' | 'B' | 'C' | null
  unfollowed: boolean
}

const userKey = (uid: string) => `line:user:${uid}`

export async function getUser(userId: string): Promise<LineUser | null> {
  return await kv.get<LineUser>(userKey(userId))
}

export async function saveUser(user: LineUser): Promise<void> {
  await kv.set(userKey(user.userId), user)
}

export async function getAllUserIds(): Promise<string[]> {
  const keys = await kv.keys('line:user:*')
  return keys.map(k => k.replace('line:user:', ''))
}

// ──────────────────────────────────────────────
// アクセスコード生成
// ──────────────────────────────────────────────

export function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'PET-'
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// ──────────────────────────────────────────────
// KV 経由のアクセスコード検証（auth route から呼ぶ）
// ──────────────────────────────────────────────

export async function isValidKvCode(code: string): Promise<boolean> {
  const keys = await kv.keys('line:user:*')
  for (const key of keys) {
    const user = await kv.get<LineUser>(key)
    if (user?.accessCode === code.trim()) return true
  }
  return false
}

// ──────────────────────────────────────────────
// LINE Messaging API: メッセージ送信
// ──────────────────────────────────────────────

function buildPayload(msg: LineMessage): object {
  if (msg.type === 'text') return { type: 'text', text: msg.text }
  return {
    type: 'template',
    altText: msg.altText,
    template: msg.template,
  }
}

export async function sendMessages(userId: string, messages: LineMessage[]): Promise<void> {
  const body = {
    to: userId,
    messages: messages.map(buildPayload),
  }
  const res = await fetch(`${LINE_API}/push`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${channelToken()}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`LINE push failed: ${res.status} ${err}`)
  }
}

export async function replyMessages(replyToken: string, messages: LineMessage[]): Promise<void> {
  const body = {
    replyToken,
    messages: messages.map(buildPayload),
  }
  const res = await fetch(`${LINE_API}/reply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${channelToken()}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`LINE reply failed: ${res.status} ${err}`)
  }
}

// ──────────────────────────────────────────────
// ステップ配信: 友だち追加時の即時送信（Step 0）
// ──────────────────────────────────────────────

export async function deliverWelcome(userId: string, accessCode: string): Promise<void> {
  const step = STEPS[0] // dayOffset: 0
  const messages = step.messages.map(msg => {
    if (msg.type === 'text') {
      return { ...msg, text: msg.text.replace(ACCESS_CODE_PLACEHOLDER, accessCode) }
    }
    return msg
  })
  await sendMessages(userId, messages)
}

// ──────────────────────────────────────────────
// ステップ配信: Cron から呼ばれる定期チェック
// ──────────────────────────────────────────────

export async function deliverPendingSteps(): Promise<{ sent: number; errors: number }> {
  const userIds = await getAllUserIds()
  let sent = 0
  let errors = 0
  const now = Date.now()

  for (const userId of userIds) {
    const user = await getUser(userId)
    if (!user || user.unfollowed) continue

    const addedMs = new Date(user.addedAt).getTime()
    const daysSince = (now - addedMs) / (1000 * 60 * 60 * 24)

    // Step 0 は友だち追加時に即時送信済みなのでスキップ
    const pendingSteps = STEPS.filter(s =>
      s.dayOffset > 0 &&
      s.dayOffset <= daysSince &&
      !user.stepsDelivered.includes(s.dayOffset)
    )

    for (const step of pendingSteps) {
      try {
        await sendMessages(userId, step.messages)
        user.stepsDelivered.push(step.dayOffset)
        sent++
      } catch (e) {
        console.error(`Step ${step.dayOffset} failed for ${userId}:`, e)
        errors++
      }
    }

    if (pendingSteps.length > 0) {
      await saveUser(user)
    }
  }

  return { sent, errors }
}
