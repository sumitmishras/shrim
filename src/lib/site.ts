import { cache } from 'react'
import type { Locale } from '@/i18n/config'
import { getPayloadClient } from './payload'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

const FALLBACK = {
  phone: 'PLACEHOLDER', whatsapp: 'PLACEHOLDER', email: 'info@shrimconstruction.in',
  addressFull: '86F/4, Khasra No 195-196, Mallhaur Road, Near Amity University, Chinhat (Nizampur Mallhaur), Lucknow, Uttar Pradesh – 226028',
  addressShort: 'Chinhat, Lucknow', showFullAddress: false, gstin: '09BAYPT7371Q2Z3',
  officeHours: 'Mon–Sat, 9:30 AM – 6:30 PM', thankYouPromise: 'Hum 30 minute ke andar call karenge',
  social: {} as Record<string, string | null | undefined>,
  seo: { openingHoursSpec: 'Mo-Sa 09:30-18:30', geoLat: null as number | null, geoLng: null as number | null },
  stats: { yearsExperience: '7+', projectCount: '[PROJECT COUNT]' },
}

export const getSiteSettings = cache(async (locale: Locale) => {
  try {
    const payload = await getPayloadClient()
    const s = await payload.findGlobal({ slug: 'siteSettings', locale })
    return { ...FALLBACK, ...(s as object) } as typeof FALLBACK
  } catch {
    return FALLBACK
  }
})
export type SiteSettings = Awaited<ReturnType<typeof getSiteSettings>>

export const isPlaceholder = (v?: string | null) => !v || v.includes('PLACEHOLDER') || v.includes('[')
export const telHref = (phone: string) => `tel:+${phone.replace(/\D/g, '').replace(/^0+/, '')}`
export const waHref = (number: string, text: string) =>
  `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`
