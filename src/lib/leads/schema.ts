import { z } from 'zod'
import { BUDGET_BANDS, CALC_EXTRAS, CALC_LIMITS, CALC_SERVICES, CALC_TIERS, FLOORS, LEAD_SERVICES, PLOT_STATUS, SHORT_SOURCES, TIMELINES, VISIT_SLOTS } from './options'

import { isIndianMobile, normalizePhone } from './phone'
export { isIndianMobile, normalizePhone }

const text = (max: number) => z.string().trim().max(max).optional().transform((v) => v || undefined)
const optEnum = <T extends readonly [string, ...string[]]>(vals: T) =>
  z.union([z.enum(vals), z.literal('')]).optional().transform((v) => v || undefined)

const base = z.object({
  locale: z.enum(['en', 'hi']).default('en'),
  name: z.string('name').trim().min(2, 'name').max(80, 'name'),
  phone: z.string('phone').transform(normalizePhone).refine(isIndianMobile, 'phone'),
  email: z.string().trim().max(120, 'email').optional().transform((v) => v || undefined).refine((v) => !v || z.email().safeParse(v).success, 'email'),
  consent: z.boolean('consent').refine((v) => v === true, 'consent'),
})

const todayIST = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })

export const siteVisitSchema = base.extend({
  service: z.enum(LEAD_SERVICES, 'service'),
  areaSize: text(20),
  floors: optEnum(FLOORS),
  locality: text(80),
  plotStatus: optEnum(PLOT_STATUS),
  budgetBand: optEnum(BUDGET_BANDS),
  timeline: optEnum(TIMELINES),
  visitDate: z.string().optional().transform((v) => v || undefined).refine((v) => !v || (/^\d{4}-\d{2}-\d{2}$/.test(v) && v >= todayIST()), 'date'),
  visitSlot: optEnum(VISIT_SLOTS),
  message: text(1000),
})

export const shortLeadSchema = base.extend({
  service: z.enum(LEAD_SERVICES, 'service'),
  message: text(1000),
  source: z.enum(SHORT_SOURCES),
  sourceDetail: text(60),
})

export const calculatorLeadSchema = base.extend({
  calcService: z.enum(CALC_SERVICES, 'service'),
  area: z.coerce.number('area').int('area').min(CALC_LIMITS.minArea, 'area').max(CALC_LIMITS.maxArea, 'area'),
  floors: z.coerce.number('floors').int('floors').min(CALC_LIMITS.minFloors, 'floors').max(CALC_LIMITS.maxFloors, 'floors'),
  tier: z.enum(CALC_TIERS, 'tier'),
  extras: z.array(z.enum(CALC_EXTRAS)).max(3).default([]),
  locality: text(80),
})

export type FieldErrors = Record<string, string>

/** Runs a schema and turns zod issues into { field: code } (the message of each rule is its error code). */
export function check<S extends z.ZodType>(schema: S, input: unknown): { ok: true; data: z.output<S> } | { ok: false; errors: FieldErrors } {
  const r = schema.safeParse(input)
  if (r.success) return { ok: true, data: r.data }
  const errors: FieldErrors = {}
  for (const i of r.error.issues) {
    const field = String(i.path[0] ?? 'form')
    if (!errors[field]) errors[field] = ['name', 'phone', 'email', 'consent', 'service', 'date', 'area', 'floors', 'tier'].includes(i.message) ? i.message : 'invalid'
  }
  return { ok: false, errors }
}
