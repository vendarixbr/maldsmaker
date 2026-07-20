import { SignJWT, jwtVerify } from 'jose'

export const SESSION_COOKIE = 'malds_admin_session'
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7 // 7 days

function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET is not set')
  return new TextEncoder().encode(secret)
}

function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder()
  const aBytes = enc.encode(a)
  const bBytes = enc.encode(b)
  // Hash both to a fixed length first so the comparison itself never
  // leaks the real length of the secret via early-exit timing.
  const aPadded = new Uint8Array(64)
  const bPadded = new Uint8Array(64)
  aPadded.set(aBytes.slice(0, 64))
  bPadded.set(bBytes.slice(0, 64))

  let diff = aBytes.length ^ bBytes.length
  for (let i = 0; i < 64; i++) {
    diff |= aPadded[i] ^ bPadded[i]
  }
  return diff === 0
}

export function verifyCredentials(username: string, password: string): boolean {
  const validUsername = process.env.ADMIN_USERNAME
  const validPassword = process.env.ADMIN_PASSWORD
  if (!validUsername || !validPassword) return false
  return timingSafeEqual(username, validUsername) && timingSafeEqual(password, validPassword)
}

export async function createSessionToken(username: string): Promise<string> {
  return new SignJWT({ sub: username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getAuthSecret())
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getAuthSecret())
    return true
  } catch {
    return false
  }
}

export const SESSION_COOKIE_MAX_AGE = SESSION_TTL_SECONDS
