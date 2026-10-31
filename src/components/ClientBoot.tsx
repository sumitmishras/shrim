'use client'
import { useEffect } from 'react'
import { ATTR_COOKIE, ATTR_DAYS } from '@/lib/leads/options'
import { track } from '@/lib/track'

const KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'] as const

const readCookie = (): Record<string, string> | null => {
  try {
    const m = document.cookie.split('; ').find((c) => c.startsWith(ATTR_COOKIE + '='))
    return m ? JSON.parse(decodeURIComponent(m.slice(ATTR_COOKIE.length + 1))) : null
  } catch { return null }
}

/**
 * First-party attribution cookie (30 days): campaign tags, landing page, referrer, device.
 * Used only to tell the owner where a lead came from. No fingerprinting, no personal data.
 * A visit with new campaign tags replaces older ones; the first-visit time is kept.
 */
function captureAttribution() {
  try {
    const url = new URL(location.href)
    const fresh = KEYS.filter((k) => url.searchParams.get(k))
    const existing = readCookie()
    if (existing && fresh.length === 0) return
    let referrer = ''
    try { if (document.referrer && new URL(document.referrer).host !== location.host) referrer = document.referrer } catch {}
    const w = window.innerWidth
    const data: Record<string, string> = {
      ...Object.fromEntries(fresh.map((k) => [k, url.searchParams.get(k)!.slice(0, 100)])),
      landingPage: (url.pathname + url.search).slice(0, 200),
      ...(referrer ? { referrer: referrer.slice(0, 200) } : existing?.referrer ? { referrer: existing.referrer } : {}),
      firstVisitAt: existing?.firstVisitAt ?? new Date().toISOString(),
      device: w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop',
    }
    document.cookie = `${ATTR_COOKIE}=${encodeURIComponent(JSON.stringify(data))}; Max-Age=${ATTR_DAYS * 86400}; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`
  } catch { /* cookies blocked: leads still work, just without attribution */ }
}

/** Mounted once in the layout: saves attribution and reports button clicks to the dataLayer. */
export function ClientBoot() {
  useEffect(() => {
    captureAttribution()
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-track]')
      if (!el) return
      const event = el.dataset.track!
      const params: Record<string, unknown> = { page_path: location.pathname }
      // Button labels can contain phone numbers, so only plain CTA clicks send their label.
      if (event === 'cta_click') params.button_label = (el.textContent || '').trim().slice(0, 60)
      track(event, params)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
  return null
}
