import { NextRequest, NextResponse } from 'next/server'
import * as crypto from 'crypto'
import {
  getUser, saveUser, generateAccessCode, deliverWelcome, type LineUser
} from '@/lib/lineApi'

function channelSecret() {
  const s = process.env.LINE_CHANNEL_SECRET
  if (!s) throw new Error('LINE_CHANNEL_SECRET is not set')
  return s
}

function verifySignature(body: string, signature: string): boolean {
  const expected = crypto
    .createHmac('sha256', channelSecret())
    .update(body)
    .digest('base64')
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawBody = await req.text()
  const signature = req.headers.get('x-line-signature') ?? ''

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const body = JSON.parse(rawBody)
  const events: LineEvent[] = body.events ?? []

  await Promise.all(events.map(handleEvent))

  return NextResponse.json({ ok: true })
}

// ──────────────────────────────────────────────
// イベントハンドラ
// ──────────────────────────────────────────────

type LineEvent = {
  type: string
  source: { userId: string }
  replyToken?: string
  message?: { type: string; text: string }
}

async function handleEvent(event: LineEvent) {
  const userId = event.source?.userId
  if (!userId) return

  if (event.type === 'follow') {
    await handleFollow(userId)
  } else if (event.type === 'unfollow') {
    await handleUnfollow(userId)
  } else if (event.type === 'message' && event.message?.type === 'text') {
    await handleMessage(userId, event.message.text, event.replyToken)
  }
}

async function handleFollow(userId: string) {
  const existing = await getUser(userId)
  if (existing && !existing.unfollowed) return // 再フォロー時は重複送信しない

  const accessCode = generateAccessCode()
  const user: LineUser = existing
    ? { ...existing, unfollowed: false, addedAt: new Date().toISOString() }
    : {
        userId,
        addedAt: new Date().toISOString(),
        accessCode,
        stepsDelivered: [0],
        diagnosisScore: null,
        diagnosisGrade: null,
        unfollowed: false,
      }

  if (!existing) {
    user.accessCode = accessCode
  }

  await saveUser(user)
  await deliverWelcome(userId, user.accessCode)
}

async function handleUnfollow(userId: string) {
  const user = await getUser(userId)
  if (!user) return
  await saveUser({ ...user, unfollowed: true })
}

async function handleMessage(userId: string, text: string, replyToken?: string) {
  // コード確認メッセージへの応答
  if (text.includes('コード') || text.includes('アクセス')) {
    const user = await getUser(userId)
    if (!user) return
    const { replyMessages } = await import('@/lib/lineApi')
    await replyMessages(replyToken!, [
      {
        type: 'text',
        text: `🔑 あなたのアクセスコードはこちらです：\n\n${user.accessCode}\n\nこのコードで完全版PRO診断をご利用いただけます。`,
      },
    ])
  }
}
