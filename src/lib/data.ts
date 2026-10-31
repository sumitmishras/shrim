import { cache } from 'react'
import type { Where } from 'payload'
import type { Locale } from '@/i18n/config'
import type { Project, Service, Testimonial } from '@/payload-types'
import { getPayloadClient } from './payload'

/**
 * Public data access. We use the local API (which bypasses collection access),
 * so every query filters on status = published explicitly.
 */
const published: Where = { status: { equals: 'published' } }

export const getServices = cache(async (locale: Locale) => {
  const payload = await getPayloadClient()
  return (await payload.find({ collection: 'services', locale, sort: 'order', limit: 20, depth: 1 })).docs
})

export const getService = cache(async (slug: string, locale: Locale) => {
  const payload = await getPayloadClient()
  return (await payload.find({ collection: 'services', locale, where: { slug: { equals: slug } }, limit: 1, depth: 1 })).docs[0] ?? null
})

type ProjectFilter = { serviceId?: number; area?: string; featured?: boolean; limit?: number; page?: number }

export async function getProjects(locale: Locale, f: ProjectFilter = {}) {
  const payload = await getPayloadClient()
  const and: Where[] = [published]
  if (f.serviceId) and.push({ service: { equals: f.serviceId } })
  if (f.area) and.push({ area: { equals: f.area } })
  if (f.featured) and.push({ featured: { equals: true } })
  return payload.find({ collection: 'projects', locale, where: { and }, sort: '-createdAt', limit: f.limit ?? 12, page: f.page ?? 1, depth: 1 })
}

export async function getProjectAreas() {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'projects', where: published, limit: 500, depth: 0, select: { area: true }, pagination: false })
  return [...new Set(res.docs.map((d) => d.area).filter(Boolean))].sort()
}

export async function getProject(slug: string, locale: Locale) {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'projects', locale, where: { and: [published, { slug: { equals: slug } }] }, limit: 1, depth: 2 })
  return res.docs[0] ?? null
}

export async function getTestimonials(locale: Locale, opts: { serviceId?: number; limit?: number } = {}) {
  const payload = await getPayloadClient()
  const and: Where[] = [published, { consentToPublish: { equals: true } }]
  if (opts.serviceId) and.push({ service: { equals: opts.serviceId } })
  return (await payload.find({ collection: 'testimonials', locale, where: { and }, limit: opts.limit ?? 6, depth: 1, sort: '-createdAt' })).docs
}

export async function getFaqs(locale: Locale, serviceId?: number) {
  const payload = await getPayloadClient()
  const where: Where = serviceId
    ? { and: [{ category: { equals: 'service' } }, { service: { equals: serviceId } }] }
    : { category: { equals: 'general' } }
  return (await payload.find({ collection: 'faqs', locale, where, sort: 'order', limit: 50, depth: 0 })).docs
}

export async function getGuides(locale: Locale) {
  const payload = await getPayloadClient()
  return (await payload.find({ collection: 'guides', locale, where: published, sort: '-publishedAt', limit: 50, depth: 1 })).docs
}

export async function getGuide(slug: string, locale: Locale) {
  const payload = await getPayloadClient()
  return (await payload.find({ collection: 'guides', locale, where: { and: [published, { slug: { equals: slug } }] }, limit: 1, depth: 1 })).docs[0] ?? null
}

export const getPage = cache(async (slug: 'commercial' | 'privacy-policy' | 'terms', locale: Locale) => {
  const payload = await getPayloadClient()
  return (await payload.find({ collection: 'pages', locale, where: { slug: { equals: slug } }, limit: 1, depth: 0 })).docs[0] ?? null
})

export const getAbout = cache(async (locale: Locale) => (await getPayloadClient()).findGlobal({ slug: 'aboutPage', locale, depth: 1 }))
export const getRates = cache(async (locale: Locale) => (await getPayloadClient()).findGlobal({ slug: 'rates', locale, depth: 0 }))

export const serviceOf = (p: Project | Testimonial): Service | null =>
  typeof p.service === 'object' && p.service ? (p.service as Service) : null

/** Starting price line for a tier, e.g. { kind: 'sqft', amount: 1800 } */
export type Price = { kind: 'sqft' | 'kg'; amount: number } | { kind: 'quote' }

export function priceFor(rates: Awaited<ReturnType<typeof getRates>>, slug: string, tier: string): Price {
  if (slug === 'fabrication') {
    const f = rates.fabrication
    return f?.display === 'per-kg' && f.perKgRate ? { kind: 'kg', amount: f.perKgRate } : { kind: 'quote' }
  }
  const row = rates.rates?.find((r) => r.service === slug && r.tier === tier)
  return row?.rate ? { kind: 'sqft', amount: row.rate } : { kind: 'quote' }
}

import type { RatesData } from './leads/estimate'
export function toRatesData(r: Awaited<ReturnType<typeof getRates>>): RatesData {
  return {
    rates: (r.rates ?? []).map((x) => ({ service: x.service, tier: x.tier, rate: x.rate })),
    extras: (r.extras ?? []).map((x) => ({ key: x.key, label: x.label ?? x.key, pricing: x.pricing, value: x.value })),
    breakdown: (r.breakdown ?? []).map((x) => ({ service: x.service, label: x.label, percent: x.percent })),
    rangePercent: r.rangePercent ?? 10,
  }
}
