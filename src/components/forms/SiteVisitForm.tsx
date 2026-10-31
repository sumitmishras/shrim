'use client'
import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { localePath, type Locale } from '@/i18n/config'
import { areaName, getDictionary, priorityAreas, secondaryAreas, serviceSlugs } from '@/i18n/dictionary'
import { submitSiteVisit } from '@/lib/leads/actions'
import { BUDGET_BANDS, FLOORS, PLOT_STATUS, TIMELINES, VISIT_SLOTS } from '@/lib/leads/options'
import { isIndianMobile, normalizePhone } from '@/lib/leads/schema'
import { track } from '@/lib/track'
import { ConsentField, errText, FormMessage, Honeypot, OptionCards, SelectField, ServiceIcon, TextField } from './ui'

type S = {
  service: string; areaSize: string; floors: string; locality: string; localityOther: string; plotStatus: string
  budgetBand: string; timeline: string; name: string; phone: string; email: string; visitDate: string; visitSlot: string; consent: boolean; website: string
}
const TOTAL = 4
const needsArea = (s: string) => ['house-construction', 'interior', 'renovation', 'turnkey'].includes(s)
const needsFloors = (s: string) => ['house-construction', 'renovation', 'turnkey'].includes(s)
const stepOfField: Record<string, number> = { service: 1, areaSize: 2, floors: 2, locality: 2, plotStatus: 2, budgetBand: 3, timeline: 3 }
const today = () => new Date().toLocaleDateString('en-CA')

export function SiteVisitForm({ locale, initialService = '' }: { locale: Locale; initialService?: string }) {
  const t = getDictionary(locale)
  const f = t.forms
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [pending, start] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string>()
  const [s, setS] = useState<S>({
    service: (serviceSlugs as readonly string[]).includes(initialService) ? initialService : '', areaSize: '', floors: '', locality: '', localityOther: '',
    plotStatus: '', budgetBand: '', timeline: '', name: '', phone: '', email: '', visitDate: '', visitSlot: '', consent: false, website: '',
  })
  const set = <K extends keyof S>(k: K, v: S[K]) => { setS((p) => ({ ...p, [k]: v })); if (errors[k]) setErrors((e) => { const { [k]: _, ...rest } = e; return rest }) }
  const heading = useRef<HTMLHeadingElement>(null)
  const prevStep = useRef(step)
  useEffect(() => { if (prevStep.current !== step) heading.current?.focus(); prevStep.current = step }, [step])

  const validate = (n: number) => {
    const e: Record<string, string> = {}
    if (n === 1 && !s.service) e.service = 'service'
    if (n === 2) {
      if (needsArea(s.service) && !(parseInt(s.areaSize, 10) > 0)) e.areaSize = 'area'
      if (!s.locality || (s.locality === '__other' && s.localityOther.trim().length < 2)) e.locality = 'required'
      if (!s.plotStatus) e.plotStatus = 'required'
    }
    if (n === 3 && !s.timeline) e.timeline = 'required'
    if (n === 4) {
      if (s.name.trim().length < 2) e.name = 'name'
      if (!isIndianMobile(normalizePhone(s.phone))) e.phone = 'phone'
      if (s.email.trim() && !/^\S+@\S+\.\S+$/.test(s.email.trim())) e.email = 'email'
      if (s.visitDate && s.visitDate < today()) e.visitDate = 'date'
      if (!s.consent) e.consent = 'consent'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => { if (validate(step)) setStep(step + 1) }
  const submit = (ev: React.FormEvent) => {
    ev.preventDefault()
    setFormError(undefined)
    if (!validate(4)) return
    start(async () => {
      const res = await submitSiteVisit({
        locale, service: s.service, areaSize: s.areaSize.replace(/\D/g, '') && `${s.areaSize.replace(/\D/g, '')} sq ft`, floors: needsFloors(s.service) ? s.floors : '',
        locality: s.locality === '__other' ? s.localityOther.trim() : s.locality, plotStatus: s.plotStatus, budgetBand: s.budgetBand, timeline: s.timeline,
        name: s.name, phone: s.phone, email: s.email, visitDate: s.visitDate, visitSlot: s.visitSlot, consent: s.consent, website: s.website,
      })
      if (res.ok) {
        const p = { service: s.service, source_page: location.pathname, lead_score_band: res.band }
        track('generate_lead', { form_name: 'site_visit', ...p })
        track('site_visit_booked', p)
        router.push(localePath(locale, res.reference ? `/thank-you?ref=${res.reference}` : '/thank-you'))
      } else if (res.code === 'invalid' && res.errors) {
        setErrors(res.errors)
        setStep(Math.min(...Object.keys(res.errors).map((k) => stepOfField[k] ?? 4)))
        setFormError(f.err.fix)
      } else {
        setFormError(res.code === 'rate_limited' ? f.err.rate_limited : f.err.server)
      }
    })
  }
  const e = (k: string) => errText(locale, errors[k])
  const areas = [...priorityAreas, ...secondaryAreas]

  return (
    <form onSubmit={submit} noValidate className="relative mx-auto max-w-2xl" aria-busy={pending}>
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-sm text-muted"><span>{f.stepOf(step, TOTAL)}</span></div>
        <div role="progressbar" aria-valuemin={1} aria-valuemax={TOTAL} aria-valuenow={step} aria-label={f.stepOf(step, TOTAL)} className="h-2 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-accent transition-all duration-300" style={{ width: `${(step / TOTAL) * 100}%` }} />
        </div>
      </div>
      <h2 ref={heading} tabIndex={-1} className="mb-6 font-display text-2xl font-bold outline-none">{f.sv.steps[step - 1]}</h2>

      <div className="space-y-5">
        {step === 1 && (
          <OptionCards
            legend={f.service} value={s.service} onChange={(v) => set('service', v)} error={e('service')}
            options={[...serviceSlugs.map((slug) => ({ value: slug, label: t.svc[slug], icon: <ServiceIcon slug={slug} /> })), { value: 'not-sure', label: f.notSure, icon: <ServiceIcon slug="not-sure" /> }]}
          />
        )}

        {step === 2 && (
          <>
            {needsArea(s.service) && (
              <TextField label={f.sv.area} inputMode="numeric" value={s.areaSize} onChange={(ev) => set('areaSize', ev.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="1800" error={e('areaSize')} />
            )}
            {needsFloors(s.service) && (
              <SelectField label={f.sv.floors} value={s.floors} onChange={(ev) => set('floors', ev.target.value)}>
                <option value="">–</option>
                {FLOORS.map((v) => <option key={v} value={v}>{f.sv.floorOpts[v]}</option>)}
              </SelectField>
            )}
            <SelectField label={f.sv.locality} value={s.locality} onChange={(ev) => set('locality', ev.target.value)} error={e('locality')}>
              <option value="">{f.sv.localityPick}</option>
              {areas.map((a) => <option key={a} value={a}>{areaName(locale, a)}</option>)}
              <option value="__other">{f.sv.localityOther}</option>
            </SelectField>
            {s.locality === '__other' && <TextField label={f.sv.localityOtherLabel} value={s.localityOther} onChange={(ev) => set('localityOther', ev.target.value)} maxLength={80} error={e('locality')} />}
            <OptionCards legend={f.sv.plot} cols="grid-cols-1 sm:grid-cols-3" value={s.plotStatus} onChange={(v) => set('plotStatus', v)} error={e('plotStatus')} options={PLOT_STATUS.map((v) => ({ value: v, label: f.sv.plotOpts[v] }))} />
          </>
        )}

        {step === 3 && (
          <>
            <SelectField label={f.sv.budget} value={s.budgetBand} onChange={(ev) => set('budgetBand', ev.target.value)}>
              <option value="">{f.sv.budgetPick}</option>
              {BUDGET_BANDS.map((v) => <option key={v} value={v}>{f.sv.budgetOpts[v]}</option>)}
            </SelectField>
            <OptionCards legend={f.sv.timeline} cols="grid-cols-1 sm:grid-cols-2" value={s.timeline} onChange={(v) => set('timeline', v)} error={e('timeline')} options={TIMELINES.map((v) => ({ value: v, label: f.sv.timelineOpts[v] }))} />
          </>
        )}

        {step === 4 && (
          <>
            <TextField label={f.name} autoComplete="name" value={s.name} onChange={(ev) => set('name', ev.target.value)} maxLength={80} error={e('name')} />
            <TextField label={f.phone} hint={f.phoneHint} type="tel" inputMode="numeric" autoComplete="tel-national" value={s.phone} onChange={(ev) => set('phone', ev.target.value)} maxLength={17} error={e('phone')} />
            <TextField label={f.email} type="email" autoComplete="email" value={s.email} onChange={(ev) => set('email', ev.target.value)} maxLength={120} error={e('email')} />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label={f.sv.visitDate} type="date" min={today()} value={s.visitDate} onChange={(ev) => set('visitDate', ev.target.value)} error={e('visitDate')} />
              <SelectField label={f.sv.visitSlot} value={s.visitSlot} onChange={(ev) => set('visitSlot', ev.target.value)}>
                <option value="">{f.sv.slotPick}</option>
                {VISIT_SLOTS.map((v) => <option key={v} value={v}>{f.sv.slots[v]}</option>)}
              </SelectField>
            </div>
            <ConsentField locale={locale} checked={s.consent} onChange={(v) => set('consent', v)} error={e('consent')} />
            <Honeypot value={s.website} onChange={(v) => set('website', v)} />
          </>
        )}
        <FormMessage text={formError} />
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        {step > 1 ? <button type="button" onClick={() => setStep(step - 1)} className="btn btn-ghost">← {f.back}</button> : <span />}
        {step < TOTAL
          ? <button type="button" onClick={next} className="btn btn-primary">{f.next} →</button>
          : <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">{pending ? f.sending : f.submit}</button>}
      </div>
    </form>
  )
}
