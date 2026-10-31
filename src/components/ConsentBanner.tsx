'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { localePath, type Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { track } from '@/lib/track'

const KEY = 'shrim_consent'
const OPEN_EVENT = 'shrim:open-consent'
type Stored = { v: 1; analytics: boolean; ads: boolean; at: string }
declare global { interface Window { gtag?: (...a: unknown[]) => void } }

const read = (): Stored | null => { try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); return s?.v === 1 ? s : null } catch { return null } }

function save(analytics: boolean, ads: boolean) {
  const v = (b: boolean) => (b ? 'granted' : 'denied')
  try { localStorage.setItem(KEY, JSON.stringify({ v: 1, analytics, ads, at: new Date().toISOString() } satisfies Stored)) } catch {}
  // The server reads this cookie to decide whether it may send the Meta Conversions API event (ads consent only).
  document.cookie = `shrim_ads_consent=${ads ? 1 : 0}; Max-Age=${180 * 86400}; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`
  window.gtag?.('consent', 'update', { analytics_storage: v(analytics), ad_storage: v(ads), ad_user_data: v(ads), ad_personalization: v(ads) })
  track('consent_update', { analytics_storage: v(analytics), ad_storage: v(ads) })
}

/** Cookie banner. Only rendered when GTM is configured. Analytics and ads stay denied until the visitor accepts. */
export function ConsentBanner({ locale }: { locale: Locale }) {
  const c = getDictionary(locale).consent
  const [open, setOpen] = useState(false)
  const [custom, setCustom] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [ads, setAds] = useState(false)

  useEffect(() => {
    const s = read()
    if (!s) setOpen(true)
    const reopen = () => { const cur = read(); setAnalytics(!!cur?.analytics); setAds(!!cur?.ads); setCustom(true); setOpen(true) }
    window.addEventListener(OPEN_EVENT, reopen)
    return () => window.removeEventListener(OPEN_EVENT, reopen)
  }, [])

  if (!open) return null
  const done = (a: boolean, m: boolean) => { save(a, m); setOpen(false); setCustom(false) }
  const box = 'flex min-h-[44px] cursor-pointer items-start gap-3 py-1'
  return (
    <div role="dialog" aria-label={c.title} className="fixed inset-x-0 bottom-[57px] z-50 p-3 lg:bottom-0 lg:p-5">
      <div className="mx-auto max-w-3xl rounded-3xl border border-line bg-surface p-5 shadow-2xl">
        <p className="font-display text-lg font-semibold">{c.title}</p>
        <p className="mt-1 text-sm text-muted">
          {c.text}{' '}
          <Link href={localePath(locale, '/privacy-policy')} className="text-accent-text underline underline-offset-2">{getDictionary(locale).footer.privacy}</Link>
        </p>
        {custom && (
          <div className="mt-3 space-y-1 border-t border-line pt-3">
            <label className={box}><input type="checkbox" checked disabled className="mt-1 size-6 accent-[var(--accent)]" /><span className="text-sm"><b>{locale === 'hi' ? 'ज़रूरी कुकीज़' : 'Essential cookies'}</b><br /><span className="text-muted">{locale === 'hi' ? 'हमेशा चालू' : 'Always on'}</span></span></label>
            <label className={box}><input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} className="mt-1 size-6 accent-[var(--accent)]" /><span className="text-sm"><b>{c.analytics}</b><br /><span className="text-muted">{c.analyticsHelp}</span></span></label>
            <label className={box}><input type="checkbox" checked={ads} onChange={(e) => setAds(e.target.checked)} className="mt-1 size-6 accent-[var(--accent)]" /><span className="text-sm"><b>{c.ads}</b><br /><span className="text-muted">{c.adsHelp}</span></span></label>
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => done(true, true)} className="btn btn-primary">{c.acceptAll}</button>
          <button type="button" onClick={() => done(false, false)} className="btn btn-ghost">{c.rejectAll}</button>
          {custom
            ? <button type="button" onClick={() => done(analytics, ads)} className="btn btn-ghost">{c.save}</button>
            : <button type="button" onClick={() => setCustom(true)} className="btn btn-ghost">{c.customise}</button>}
        </div>
      </div>
    </div>
  )
}

/** Footer link that reopens the banner so visitors can change their mind. */
export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))} className="inline-flex min-h-[44px] items-center text-sm text-muted hover:text-ink">{label}</button>
  )
}
