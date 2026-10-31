import type { Locale } from '@/i18n/config'
import type { Price } from './data'
import type { Dictionary } from '@/i18n/dictionary'

export const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

export function priceLabel(p: Price, t: Dictionary, _locale: Locale) {
  if (p.kind === 'quote') return { prefix: '', main: t.svcPage.quote, unit: '' }
  return { prefix: t.svcPage.startingFrom, main: inr(p.amount), unit: p.kind === 'kg' ? t.svcPage.perKg : t.svcPage.perSqft }
}

export const tag = (...parts: (string | null | undefined | false)[]) => parts.filter(Boolean).join(' • ')
