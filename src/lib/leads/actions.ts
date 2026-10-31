'use server'
import { after } from 'next/server'
import { headers } from 'next/headers'
import { getPayloadClient } from '../payload'
import { sendLeadAlert } from '../telegram'
import { readAttribution } from './attribution'
import { estimate, rateServiceKey, type RatesData } from './estimate'
import { CONSENT_VERSION } from './options'
import { consume, clientIp } from './rateLimit'
import { calculatorLeadSchema, check, shortLeadSchema, siteVisitSchema, type FieldErrors } from './schema'

export type LeadResult =
  | { ok: true; reference?: string; band?: string }
  | { ok: false; code: 'invalid' | 'rate_limited' | 'server'; errors?: FieldErrors }

const LIMIT = Number(process.env.LEAD_RATE_LIMIT || 5)
const WINDOW_MS = 60 * 60 * 1000

type Fields = Record<string, unknown>

/** Shared pipeline: honeypot -> validate -> rate limit -> attribution -> save -> Telegram. */
async function handle<T extends { consent: boolean }>(
  raw: unknown,
  parse: (input: Fields) => { ok: true; data: T } | { ok: false; errors: FieldErrors },
  build: (data: T) => Promise<Fields>,
): Promise<LeadResult> {
  const input = (raw && typeof raw === 'object' ? raw : {}) as Fields
  // Honeypot: real people never see this field. Pretend it worked, save nothing.
  if (typeof input.website === 'string' && input.website.trim() !== '') return { ok: true }

  const parsed = parse(input)
  if (!parsed.ok) return { ok: false, code: 'invalid', errors: parsed.errors }

  const ip = clientIp(await headers())
  if (!consume(`lead:${ip}`, LIMIT, WINDOW_MS).ok) return { ok: false, code: 'rate_limited' }

  try {
    const payload = await getPayloadClient()
    const fields = await build(parsed.data)
    const attr = await readAttribution()
    const lead = await payload.create({
      collection: 'leads',
      overrideAccess: true,
      data: {
        ...fields,
        status: 'new',
        attribution: attr,
        consent: { given: true, at: new Date().toISOString(), textVersion: CONSENT_VERSION },
      } as never,
    })
    after(() => sendLeadAlert(lead as never))
    return { ok: true, reference: lead.reference ?? undefined, band: lead.scoreBand ?? undefined }
  } catch (e) {
    console.error('[lead] save failed:', e)
    return { ok: false, code: 'server' }
  }
}

export async function submitSiteVisit(raw: unknown): Promise<LeadResult> {
  return handle(raw, (i) => check(siteVisitSchema, i), async (d) => ({
    name: d.name, phone: d.phone, email: d.email, service: d.service, locality: d.locality, areaSize: d.areaSize,
    floors: d.floors, plotStatus: d.plotStatus, budgetBand: d.budgetBand, timeline: d.timeline,
    preferredVisitDate: d.visitDate, preferredVisitSlot: d.visitSlot, message: d.message, source: 'site-visit',
  }))
}

export async function submitShortLead(raw: unknown): Promise<LeadResult> {
  return handle(raw, (i) => check(shortLeadSchema, i), async (d) => ({
    name: d.name, phone: d.phone, email: d.email, service: d.service, message: d.message, source: d.source, sourceDetail: d.sourceDetail,
  }))
}

export async function submitCalculatorLead(raw: unknown): Promise<LeadResult> {
  return handle(raw, (i) => check(calculatorLeadSchema, i), async (d) => {
    // Re-compute from the current rates so the saved estimate can't be tampered with in the browser.
    const payload = await getPayloadClient()
    const r = await payload.findGlobal({ slug: 'rates', depth: 0 })
    const rates: RatesData = {
      rates: (r.rates ?? []).map((x) => ({ service: x.service, tier: x.tier, rate: x.rate })),
      extras: (r.extras ?? []).map((x) => ({ key: x.key, label: x.label ?? '', pricing: x.pricing, value: x.value })),
      breakdown: (r.breakdown ?? []).map((x) => ({ service: x.service, label: x.label, percent: x.percent })),
      rangePercent: r.rangePercent ?? 10,
    }
    const inputs = { service: d.calcService, area: d.area, floors: d.floors, tier: d.tier, extras: d.extras }
    const est = estimate(rates, inputs)
    // Keep the breakdown (English + Hindi labels) so the owner can send it on WhatsApp later.
    const rHi = await payload.findGlobal({ slug: 'rates', depth: 0, locale: 'hi' })
    const key = rateServiceKey[d.calcService]
    const breakdown = (r.breakdown ?? []).map((x, i) => ({ service: x.service, label: x.label, label_hi: rHi.breakdown?.[i]?.label ?? x.label, percent: x.percent }))
      .filter((x) => x.service === key).map(({ label, label_hi, percent }) => ({ label, label_hi, percent }))
    return {
      name: d.name, phone: d.phone, email: d.email, source: 'calculator',
      service: rateServiceKey[d.calcService], locality: d.locality, areaSize: `${d.area} sq ft`, floors: String(d.floors),
      calculator: { inputs, estimate: est && { rate: est.rate, builtUp: est.builtUp, extrasTotal: est.extrasTotal, low: est.low, high: est.high, breakdown }, ratesAreSample: !!r.sampleData },
    }
  })
}
