import { NextRequest, NextResponse } from 'next/server'
import { isValidRangeCode } from '@/lib/accessCode'

// /diagnosis/line, /diagnosis/senior, /diagnosis/mansion は認証不要の公開ページ
// /diagnosis, /diagnosis/result, /diagnosis/pro, /diagnosis/pro/result は認証必須
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/diagnosis/line')
    || pathname.startsWith('/diagnosis/senior')
    || pathname.startsWith('/diagnosis/mansion')
  ) {
    return NextResponse.next()
  }

  const protectedPrefixes = [
    '/diagnosis/pro',
    '/diagnosis/result',
    '/diagnosis',
  ]
  const isProtected = protectedPrefixes.some(
    p => pathname === p || pathname.startsWith(p + '/')
  )

  if (isProtected) {
    const authCookie = request.cookies.get('pet_auth')
    const validCodes = (process.env.VALID_CODES ?? '')
      .split(',')
      .map(c => c.trim())
      .filter(Boolean)

    const isAuthorized = !!authCookie?.value &&
      (validCodes.includes(authCookie.value) || isValidRangeCode(authCookie.value))

    if (!isAuthorized) {
      const url = new URL('/auth', request.url)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/diagnosis', '/diagnosis/:path*'],
}
