import type { CALC_EXTRAS, CALC_TIERS } from './options'

/** Pure, shared by the calculator UI (instant result) and the server (re-computed when the lead is saved). */
export type RatesData = {
  rates: { service: string; tier: string; rate: number }[]
  extras: { key: string; label: string; pricing: 'fixed' | 'perSqft'; value: number }[]
  breakdown: { service: string; label: string; percent: number }[]
  rangePercent: number
}
export type CalcInput = {
  service: 'new-construction' | 'renovation' | 'interior'
  area: number
  floors: number
  tier: (typeof CALC_TIERS)[number]
  extras: (typeof CALC_EXTRAS)[number][]
}
export type Estimate = {
  rate: number
  builtUp: number
  extrasTotal: number
  total: number
  low: number
  high: number
  breakdown: { label: string; percent: number }[]
}

export const rateServiceKey = { 'new-construction': 'house-construction', renovation: 'renovation', interior: 'interior' } as const

const round10k = (n: number) => Math.round(n / 10000) * 10000

/** estimate = built-up area x rate(service, tier) + extras. Always returned as a range, never one number. */
export function estimate(r: RatesData, i: CalcInput): Estimate | null {
  const key = rateServiceKey[i.service]
  const rate = r.rates.find((x) => x.service === key && x.tier === i.tier)?.rate
  if (!rate || !(i.area > 0)) return null
  const floors = i.service === 'interior' ? 1 : Math.max(1, i.floors)
  const builtUp = i.area * floors
  // Extras apply to new construction only; per-sq-ft extras use the footprint (one floor).
  const extrasTotal = i.service !== 'new-construction' ? 0 : i.extras.reduce((sum, k) => {
    const e = r.extras.find((x) => x.key === k)
    return sum + (e ? (e.pricing === 'perSqft' ? e.value * i.area : e.value) : 0)
  }, 0)
  const total = builtUp * rate + extrasTotal
  const pct = (r.rangePercent ?? 10) / 100
  return {
    rate, builtUp, extrasTotal, total,
    low: round10k(total * (1 - pct)), high: round10k(total * (1 + pct)),
    breakdown: r.breakdown.filter((b) => b.service === key).map((b) => ({ label: b.label, percent: b.percent })),
  }
}

export function formatMoney(n: number, locale: 'en' | 'hi') {
  const trim = (x: number) => String(Number(x.toFixed(2)))
  if (n >= 1e7) return `₹${trim(n / 1e7)} ${locale === 'hi' ? 'करोड़' : 'Cr'}`
  return `₹${trim(n / 1e5)} ${locale === 'hi' ? 'लाख' : 'Lakh'}`
}
