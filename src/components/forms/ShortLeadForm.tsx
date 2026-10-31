'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { localePath, type Locale } from '@/i18n/config'
import { getDictionary, serviceSlugs } from '@/i18n/dictionary'
import { submitShortLead } from '@/lib/leads/actions'
import { isIndianMobile, normalizePhone } from '@/lib/leads/schema'
import { track } from '@/lib/track'
import { ConsentField, errText, FormMessage, Honeypot, SelectField, TextAreaField, TextField } from './ui'

type Source = 'home' | 'service-page' | 'contact'

/** Short lead form: name, phone, service, optional message, consent. Used on home, service pages and contact. */
export function ShortLeadForm({ locale, source, sourceDetail, defaultService = '', showMessage = true }: { locale: Locale; source: Source; sourceDetail?: string; defaultService?: string; showMessage?: boolean }) {
  const t = getDictionary(locale)
  const f = t.forms
  const router = useRouter()
  const [pending, start] = useTransition()
  const [v, setV] = useState({ name: '', phone: '', service: (serviceSlugs as readonly string[]).includes(defaultService) ? defaultService : '', message: '', consent: false, website: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string>()
  const set = <K extends keyof typeof v>(k: K, val: (typeof v)[K]) => { setV((p) => ({ ...p, [k]: val })); if (errors[k]) setErrors((e) => { const { [k]: _, ...r } = e; return r }) }

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault()
    setFormError(undefined)
    const e: Record<string, string> = {}
    if (v.name.trim().length < 2) e.name = 'name'
    if (!isIndianMobile(normalizePhone(v.phone))) e.phone = 'phone'
    if (!v.service) e.service = 'service'
    if (!v.consent) e.consent = 'consent'
    setErrors(e)
    if (Object.keys(e).length) return
    start(async () => {
      const res = await submitShortLead({ locale, ...v, source, sourceDetail })
      if (res.ok) {
        track('generate_lead', { form_name: `quick_${source}`, service: v.service, source_page: location.pathname, lead_score_band: res.band, event_id: res.reference })
        router.push(localePath(locale, res.reference ? `/thank-you?ref=${res.reference}` : '/thank-you'))
      } else if (res.code === 'invalid' && res.errors) { setErrors(res.errors); setFormError(f.err.fix) }
      else setFormError(res.code === 'rate_limited' ? f.err.rate_limited : f.err.server)
    })
  }
  const e = (k: string) => errText(locale, errors[k])

  return (
    <form onSubmit={submit} noValidate className="relative space-y-4 text-left" aria-busy={pending}>
      <TextField label={f.name} autoComplete="name" value={v.name} onChange={(x) => set('name', x.target.value)} maxLength={80} error={e('name')} />
      <TextField label={f.phone} type="tel" inputMode="numeric" autoComplete="tel-national" value={v.phone} onChange={(x) => set('phone', x.target.value)} maxLength={17} error={e('phone')} />
      <SelectField label={f.service} value={v.service} onChange={(x) => set('service', x.target.value)} error={e('service')}>
        <option value="">{f.serviceSelect}</option>
        {serviceSlugs.map((s) => <option key={s} value={s}>{t.svc[s]}</option>)}
        <option value="not-sure">{f.notSure}</option>
      </SelectField>
      {showMessage && <TextAreaField label={f.message} value={v.message} onChange={(x) => set('message', x.target.value)} maxLength={1000} rows={3} />}
      <ConsentField locale={locale} checked={v.consent} onChange={(c) => set('consent', c)} error={e('consent')} />
      <Honeypot value={v.website} onChange={(w) => set('website', w)} />
      <FormMessage text={formError} />
      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-60">{pending ? f.sending : f.quickSubmit}</button>
    </form>
  )
}
