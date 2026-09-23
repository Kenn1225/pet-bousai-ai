import { NextRequest, NextResponse } from 'next/server'
import { isValidKvCode } from '@/lib/lineApi'
import { isValidRangeCode } from '@/lib/accessCode'

export async function POST(req: NextRequest) {
  const { code } = await req.json()

  // 環境変数の固定コード
  const validCodes = (process.env.VALID_CODES ?? '')
    .split(',')
    .map(c => c.trim())
    .filter(Boolean)

  // KV に保存されたLINE経由の動的コードも検証
  const isEnvCode = validCodes.includes(code?.trim() ?? '')
  const isRangeCode = isValidRangeCode(code ?? '')
  const isKvCode = (!isEnvCode && !isRangeCode) ? await isValidKvCode(code ?? '') : false

  if (!code || (!isEnvCode && !isRangeCode && !isKvCode)) {
    return NextResponse.json(
      { error: 'アクセスコードが正しくありません。事務局にご確認ください。' },
      { status: 401 }
    )
  }

  const res = NextResponse.json({ success: true })
  const MAX_AGE = 60 * 60 * 24 // 24時間有効
  res.cookies.set('pet_auth', code.trim(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  })
  // セッション開始時刻を記録
  res.cookies.set('pet_auth_time', Date.now().toString(), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  })
  return res
}
