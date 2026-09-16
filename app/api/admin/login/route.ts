import { NextResponse } from 'next/server'
import { createSessionToken, verifyCredentials, SESSION_COOKIE, SESSION_COOKIE_MAX_AGE } from '@/lib/auth'
import { rateLimit, resetRateLimit, clientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const LOGIN_LIMIT = 10
const LOGIN_WINDOW_MS = 10 * 60 * 1000 // 10 minutos

export async function POST(request: Request) {
  const ip = clientIp(request)
  const check = rateLimit(`login:${ip}`, LOGIN_LIMIT, LOGIN_WINDOW_MS)
  if (!check.ok) {
    const response = NextResponse.json(
      { error: `Muitas tentativas. Tente novamente em ${check.retryAfterSec}s.` },
      { status: 429 }
    )
    response.headers.set('Retry-After', String(check.retryAfterSec))
    return response
  }

  let body: { username?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 })
  }

  const { username, password } = body
  if (!username || !password || !verifyCredentials(username, password)) {
    return NextResponse.json({ error: 'Usuário ou senha inválidos.' }, { status: 401 })
  }

  resetRateLimit(`login:${ip}`)
  const token = await createSessionToken(username)
  const response = NextResponse.json({ ok: true })
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_COOKIE_MAX_AGE,
  })
  return response
}
