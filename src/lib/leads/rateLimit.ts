/**
 * Sliding-window rate limit, in memory (one app container). Resets when the app restarts.
 * Behind Caddy the first X-Forwarded-For value is the real client IP.
 */
const store: Map<string, number[]> = ((globalThis as { __shrimRL?: Map<string, number[]> }).__shrimRL ??= new Map())

export function consume(key: string, limit: number, windowMs: number): { ok: boolean; retryAfterSec: number } {
  const now = Date.now()
  const hits = (store.get(key) ?? []).filter((t) => now - t < windowMs)
  if (hits.length >= limit) {
    store.set(key, hits)
    return { ok: false, retryAfterSec: Math.ceil((hits[0] + windowMs - now) / 1000) }
  }
  hits.push(now)
  store.set(key, hits)
  if (store.size > 5000) for (const [k, v] of store) if (!v.some((t) => now - t < windowMs)) store.delete(k)
  return { ok: true, retryAfterSec: 0 }
}

export function clientIp(h: Headers) {
  return h.get('x-forwarded-for')?.split(',')[0].trim() || h.get('x-real-ip') || 'local'
}
