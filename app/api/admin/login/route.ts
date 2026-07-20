import { NextResponse } from 'next/server'
import { createSessionToken, verifyCredentials, SESSION_COOKIE, SESSION_COOKIE_MAX_AGE } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
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
