import { cookies } from 'next/headers'
import { z } from 'zod'
import { ATTR_COOKIE } from './options'

const s = z.string().max(300).optional().catch(undefined)
const cookieSchema = z.object({
  utm_source: s, utm_medium: s, utm_campaign: s, utm_term: s, utm_content: s, gclid: s, fbclid: s,
  landingPage: s, referrer: s, firstVisitAt: s,
  device: z.enum(['mobile', 'tablet', 'desktop']).optional().catch(undefined),
})

export type Attribution = z.infer<typeof cookieSchema>

/** Reads the first-party attribution cookie. Anything malformed is ignored, never trusted. */
export async function readAttribution(): Promise<Attribution> {
  try {
    const raw = (await cookies()).get(ATTR_COOKIE)?.value
    if (!raw) return {} as Attribution
    const p = cookieSchema.parse(JSON.parse(decodeURIComponent(raw)))
    const t = p.firstVisitAt && !Number.isNaN(Date.parse(p.firstVisitAt)) ? new Date(p.firstVisitAt).toISOString() : undefined
    return { ...p, firstVisitAt: t }
  } catch {
    return {} as Attribution
  }
}
