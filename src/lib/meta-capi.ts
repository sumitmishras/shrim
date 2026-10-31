import crypto from 'crypto'
import { getPayloadClient } from './payload'

/**
 * Meta Conversions API helper. DISABLED unless META_CAPI_ENABLED=true (plus a pixel id and access token),
 * and it only ever sends when the visitor accepted advertising cookies. Personal data is SHA-256 hashed.
 * The event_id equals the lead reference; give the browser Pixel "Lead" event the same id so Meta de-duplicates.
 */
export const sha256 = (v: string) => crypto.createHash('sha256').update(v.trim().toLowerCase()).digest('hex')
export const metaPhone = (p: string) => '91' + p.replace(/\D/g, '').slice(-10)

export type MetaLead = {
  eventId?: string; phone?: string; email?: string; name?: string; source?: string
  url?: string | null; ip?: string; ua?: string | null; fbp?: string; fbc?: string; adsConsent: boolean
}

export function buildMetaEvent(m: MetaLead, eventName: string, now = Date.now()) {
  const first = m.name?.trim().split(/\s+/)[0]
  return {
    event_name: eventName,
    event_time: Math.floor(now / 1000),
    event_id: m.eventId,
    event_source_url: m.url || undefined,
    action_source: 'website',
    user_data: {
      ph: m.phone ? [sha256(metaPhone(m.phone))] : undefined,
      em: m.email ? [sha256(m.email)] : undefined,
      fn: first ? [sha256(first)] : undefined,
      client_ip_address: m.ip && m.ip !== 'local' ? m.ip : undefined,
      client_user_agent: m.ua || undefined,
      fbp: m.fbp, fbc: m.fbc,
    },
    custom_data: { lead_source: m.source },
  }
}

export async function sendMetaLead(m: MetaLead): Promise<'disabled' | 'no-consent' | 'not-configured' | 'sent' | 'failed'> {
  if (process.env.META_CAPI_ENABLED !== 'true') return 'disabled'
  if (!m.adsConsent) return 'no-consent'
  try {
    let pixel = process.env.META_PIXEL_ID
    if (!pixel) pixel = ((await (await getPayloadClient()).findGlobal({ slug: 'tracking', depth: 0 })).metaPixelId || '').trim() || undefined
    const token = process.env.META_CAPI_TOKEN
    if (!pixel || !token) return 'not-configured'
    const events = [buildMetaEvent(m, 'Lead'), ...(m.source === 'site-visit' ? [buildMetaEvent(m, 'Schedule')] : [])]
    const base = process.env.META_CAPI_BASE || 'https://graph.facebook.com/v21.0'
    const res = await fetch(`${base}/${pixel}/events?access_token=${encodeURIComponent(token)}`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ data: events, ...(process.env.META_CAPI_TEST_CODE ? { test_event_code: process.env.META_CAPI_TEST_CODE } : {}) }),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) { console.error(`[meta-capi] HTTP ${res.status}`); return 'failed' }
    return 'sent'
  } catch (e) {
    console.error('[meta-capi] failed:', e instanceof Error ? e.message : e)
    return 'failed'
  }
}
