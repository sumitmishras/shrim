import config from '@payload-config'
import { REST_OPTIONS, REST_POST } from '@payloadcms/next/routes'
import { clientIp, isLimited, record } from '@/lib/leads/rateLimit'

/**
 * Admin login with a per-IP brake: after 10 failed attempts in 15 minutes the IP is blocked for the rest of the window.
 * (Payload also locks an account for 10 minutes after 5 wrong passwords.) Everything else is Payload's normal login.
 */
const WINDOW = 15 * 60_000
const LIMIT = 10
const login = REST_POST(config)
const slug = Promise.resolve({ slug: ['users', 'login'] })

export const POST = async (req: Request) => {
  const key = `login:${clientIp(req.headers)}`
  if (isLimited(key, LIMIT, WINDOW)) {
    return Response.json({ errors: [{ message: 'Too many failed login attempts. Please wait 15 minutes and try again.' }] }, { status: 429, headers: { 'Retry-After': String(WINDOW / 1000) } })
  }
  const res = await login(req as never, { params: slug } as never)
  if (res.status >= 400) record(key, WINDOW)
  return res
}
export const OPTIONS = (req: Request) => REST_OPTIONS(config)(req as never, { params: slug } as never)
