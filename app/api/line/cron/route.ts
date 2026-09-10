import { NextRequest, NextResponse } from 'next/server'
import { deliverPendingSteps } from '@/lib/lineApi'

// Vercel Cron Job から毎朝9時（JST）に呼ばれる
// Authorization ヘッダーで CRON_SECRET を検証

export async function GET(req: NextRequest): Promise<NextResponse> {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await deliverPendingSteps()
    return NextResponse.json({ ok: true, ...result })
  } catch (e) {
    console.error('Cron step delivery error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
