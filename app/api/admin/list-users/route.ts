import { NextRequest, NextResponse } from 'next/server'
import { getAllUserIds, getUser } from '@/lib/lineApi'

// 顧客サポート用：LINE経由で登録された全ユーザーのアクセスコード等を一覧表示
// Authorization ヘッダーで CRON_SECRET を検証（cron route と同じ運用）

export async function GET(req: NextRequest): Promise<NextResponse> {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const userIds = await getAllUserIds()
    const users = await Promise.all(userIds.map(getUser))
    const rows = users
      .filter((u): u is NonNullable<typeof u> => u !== null)
      .sort((a, b) => a.addedAt.localeCompare(b.addedAt))

    const validCodes = (process.env.VALID_CODES ?? '')
      .split(',')
      .map(c => c.trim())
      .filter(Boolean)

    return NextResponse.json({ ok: true, count: rows.length, users: rows, validCodes })
  } catch (e) {
    console.error('Admin list-users error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
