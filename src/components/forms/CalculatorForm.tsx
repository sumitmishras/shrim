'use client'
import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { localePath, type Locale } from '@/i18n/config'
import { areaName, getDictionary, priorityAreas, secondaryAreas } from '@/i18n/dictionary'
import { submitCalculatorLead } from '@/lib/leads/actions'
import { estimate, formatMoney, type CalcInput, type RatesData } from '@/lib/leads/estimate'
import { CALC_EXTRAS, CALC_LIMITS, CALC_SERVICES, CALC_TIERS } from '@/lib/leads/options'
import { isIndianMobile, normalizePhone } from '@/lib/leads/schema'
import { track } from '@/lib/track'
import { ConsentField, errText, FormMessage, Honeypot, SelectField, TextField } from './ui'

export function CalculatorForm({ locale, rates, initialArea, initialFloors, sample }: { locale: Locale; rates: RatesData; initialArea?: number; initialFloors?: number; sample: boolean }) {
  const t = getDictionary(locale)
  const c = t.forms.calc
  const f = t.forms
  const router = useRouter()
  const [pending, start] = useTransition()
  const [inp, setInp] = useState({
    service: 'new-construction' as CalcInput['service'], area: initialArea ? String(initialArea) : '', floors: String(initialFloors ?? 2),
    tier: 'standard' as CalcInput['tier'], locality: '', extras: [] as CalcInput['extras'],
  })
  const areaNum = parseInt(inp.area, 10)
  const areaOk = areaNum >= CALC_LIMITS.minArea && areaNum <= CALC_LIMITS.maxArea
  const [calculated, setCalculated] = useState(Boolean(initialArea && initialArea >= CALC_LIMITS.minArea && initialArea <= CALC_LIMITS.maxArea))
  const [areaErr, setAreaErr] = useState<string>()
  const result = useMemo(() => (calculated && areaOk ? estimate(rates, { service: inp.service, area: areaNum, floors: Number(inp.floors), tier: inp.tier, extras: inp.extras }) : null), [calculated, areaOk, areaNum, inp, rates])

  const [lead, setLead] = useState({ name: '', phone: '', consent: false, website: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string>()
  const resultRef = useRef<HTMLDivElement>(null)
  const fired = useRef(false)

  // Fire calculator_complete once when a result is first shown (including the pre-filled home teaser).
  useEffect(() => {
    if (result && !fired.current) { fired.current = true; track('calculator_complete', { service: inp.service, tier: inp.tier, source_page: location.pathname }) }
  }, [result, inp.service, inp.tier])

  const set = <K extends keyof typeof inp>(k: K, v: (typeof inp)[K]) => setInp((p) => ({ ...p, [k]: v }))
  const calc = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!areaOk) { setAreaErr('area'); return }
    setAreaErr(undefined)
    setCalculated(true)
    fired.current = false
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }
  const toggle = (k: CalcInput['extras'][number]) => set('extras', inp.extras.includes(k) ? inp.extras.filter((x) => x !== k) : [...inp.extras, k])

  const send = (ev: React.FormEvent) => {
    ev.preventDefault()
    setFormError(undefined)
    const e: Record<string, string> = {}
    if (lead.name.trim().length < 2) e.name = 'name'
    if (!isIndianMobile(normalizePhone(lead.phone))) e.phone = 'phone'
    if (!lead.consent) e.consent = 'consent'
    setErrors(e)
    if (Object.keys(e).length) return
    start(async () => {
      const res = await submitCalculatorLead({
        locale, name: lead.name, phone: lead.phone, consent: lead.consent, website: lead.website,
        calcService: inp.service, area: areaNum, floors: inp.service === 'interior' ? 1 : Number(inp.floors), tier: inp.tier,
        extras: inp.service === 'new-construction' ? inp.extras : [], locality: inp.locality && inp.locality !== '__other' ? inp.locality : undefined,
      })
      if (res.ok) {
        track('generate_lead', { form_name: 'calculator', service: inp.service, source_page: location.pathname, lead_score_band: res.band, event_id: res.reference })
        router.push(localePath(locale, res.reference ? `/thank-you?ref=${res.reference}` : '/thank-you'))
      } else if (res.code === 'invalid' && res.errors) { setErrors(res.errors); setFormError(f.err.fix) }
      else setFormError(res.code === 'rate_limited' ? f.err.rate_limited : f.err.server)
    })
  }
  const e = (k: string) => errText(locale, errors[k])
  const areas = [...priorityAreas, ...secondaryAreas]
  const extraLabel = (k: string) => rates.extras.find((x) => x.key === k)?.label ?? k

  return (
    <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
      <form onSubmit={calc} noValidate className="card space-y-5 p-6 md:p-8">
        <SelectField label={c.service} value={inp.service} onChange={(x) => set('service', x.target.value as CalcInput['service'])}>
          {CALC_SERVICES.map((s) => <option key={s} value={s}>{c.serviceOpts[s]}</option>)}
        </SelectField>
        <TextField label={inp.service === 'interior' ? c.areaInterior : c.area} inputMode="numeric" value={inp.area} onChange={(x) => { set('area', x.target.value.replace(/\D/g, '').slice(0, 5)); setAreaErr(undefined) }} placeholder="1800" error={areaErr && errText(locale, areaErr)} />
        {inp.service !== 'interior' && (
          <SelectField label={c.floors} value={inp.floors} onChange={(x) => set('floors', x.target.value)}>
            {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
          </SelectField>
        )}
        <SelectField label={c.tier} value={inp.tier} onChange={(x) => set('tier', x.target.value as CalcInput['tier'])}>
          {CALC_TIERS.map((s) => <option key={s} value={s}>{c.tierOpts[s]}</option>)}
        </SelectField>
        <SelectField label={c.locality} value={inp.locality} onChange={(x) => set('locality', x.target.value)}>
          <option value="">{c.localityPick}</option>
          {areas.map((a) => <option key={a} value={a}>{areaName(locale, a)}</option>)}
          <option value="__other">{t.forms.sv.localityOther}</option>
        </SelectField>
        {inp.service === 'new-construction' && rates.extras.length > 0 && (
          <fieldset>
            <legend className="mb-1 text-sm font-medium">{c.extras}</legend>
            {CALC_EXTRAS.filter((k) => rates.extras.some((x) => x.key === k)).map((k) => (
              <label key={k} className="flex min-h-[44px] cursor-pointer items-center gap-3">
                <input type="checkbox" checked={inp.extras.includes(k)} onChange={() => toggle(k)} className="size-6 accent-[var(--accent)]" />
                {extraLabel(k)}
              </label>
            ))}
          </fieldset>
        )}
        <button type="submit" data-track="cta_click" className="btn btn-primary w-full">{c.calculate}</button>
      </form>

      <div ref={resultRef} aria-live="polite" className="scroll-mt-24 space-y-6">
        {calculated && areaOk && !result && <p className="card p-6 text-muted">{c.noRate}</p>}
        {result && (
          <>
            <div className="card p-6 md:p-8">
              <p className="text-sm font-medium text-muted">{c.title}</p>
              <p className="mt-2 text-xs uppercase tracking-wider text-muted">{c.range}</p>
              <p className="font-display text-3xl font-bold leading-tight md:text-4xl">{formatMoney(result.low, locale)} – {formatMoney(result.high, locale)}</p>
              <p className="mt-2 text-sm text-muted">{c.builtUp}: {result.builtUp.toLocaleString('en-IN')} sq ft</p>
              {result.breakdown.length > 0 && (
                <div className="mt-6">
                  <p className="mb-3 text-sm font-medium">{c.breakdown}</p>
                  <ul className="space-y-3">
                    {result.breakdown.map((b) => (
                      <li key={b.label}>
                        <div className="flex justify-between text-sm"><span>{b.label}</span><span className="font-medium">{b.percent}%</span></div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-accent" style={{ width: `${b.percent}%` }} /></div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="mt-6 rounded-xl bg-accent/10 p-4 text-sm">{c.disclaimer}</p>
              {sample && process.env.NODE_ENV !== 'production' && <p className="mt-2 text-xs text-muted">{c.sampleNote}</p>}
            </div>

            <form onSubmit={send} noValidate className="card relative space-y-4 p-6 md:p-8" aria-busy={pending}>
              <h2 className="font-display text-xl font-bold">{c.leadTitle}</h2>
              <p className="text-sm text-muted">{c.leadSub}</p>
              <TextField label={f.name} autoComplete="name" value={lead.name} onChange={(x) => setLead({ ...lead, name: x.target.value })} maxLength={80} error={e('name')} />
              <TextField label={f.phone} type="tel" inputMode="numeric" autoComplete="tel-national" value={lead.phone} onChange={(x) => setLead({ ...lead, phone: x.target.value })} maxLength={17} error={e('phone')} />
              <ConsentField locale={locale} checked={lead.consent} onChange={(v) => setLead({ ...lead, consent: v })} error={e('consent')} />
              <Honeypot value={lead.website} onChange={(v) => setLead({ ...lead, website: v })} />
              <FormMessage text={formError} />
              <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-60">{pending ? f.sending : c.leadSubmit}</button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
