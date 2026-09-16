interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

function cleanup(now: number) {
  if (buckets.size < 2000) return
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

export interface RateLimitResult {
  ok: boolean
  /** Segundos até a janela resetar (para o header Retry-After). */
  retryAfterSec: number
}

/** Rate limit em memória (janela deslizante fixa) por chave (ex: `login:<ip>`). */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  const current = buckets.get(key)

  if (!current || now >= current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    cleanup(now)
    return { ok: true, retryAfterSec: 0 }
  }

  current.count += 1
  if (current.count > limit) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) }
  }
  return { ok: true, retryAfterSec: 0 }
}

/** Zera a contagem (ex: após login bem-sucedido). */
export function resetRateLimit(key: string): void {
  buckets.delete(key)
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}
