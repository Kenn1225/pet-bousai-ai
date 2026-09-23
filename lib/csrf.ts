export function generateCSRFToken(): string {
  if (typeof window === 'undefined') return ''

  let token = sessionStorage.getItem('_csrf_token')
  if (!token) {
    token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    sessionStorage.setItem('_csrf_token', token)
  }
  return token
}

export function getCSRFToken(): string {
  if (typeof window === 'undefined') return ''
  return sessionStorage.getItem('_csrf_token') || generateCSRFToken()
}

export function verifyCSRFToken(token: string): boolean {
  if (typeof window === 'undefined') return false
  const stored = sessionStorage.getItem('_csrf_token')
  return stored === token
}
