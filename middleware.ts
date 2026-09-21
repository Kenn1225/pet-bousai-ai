import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // 開発環境では認証をスキップ
  if (process.env.NODE_ENV === 'development' || process.env.SKIP_AUTH === 'true') {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl

  // /diagnosis で始まるパスを保護（本番環境のみ）
  if (pathname.startsWith('/diagnosis')) {
    const authCookie = request.cookies.get('pet_auth')?.value

    if (!authCookie) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth'
      url.searchParams.set('redirect', pathname + (request.nextUrl.search || ''))
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/diagnosis/:path*']
}
