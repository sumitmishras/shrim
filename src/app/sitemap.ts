import type { MetadataRoute } from 'next'
import { localePath, locales, type Locale } from '@/i18n/config'
import { getPayloadClient } from '@/lib/payload'
import { SITE_URL } from '@/lib/site'

// Content changes in the admin; always build the sitemap from the live database.
export const dynamic = 'force-dynamic'

const STATIC = ['/', '/services', '/commercial', '/projects', '/about', '/contact', '/guides', '/cost-calculator', '/site-visit', '/privacy-policy', '/terms']

/** Both languages, with hreflang alternates. /thank-you is deliberately left out. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayloadClient()
  const published = { status: { equals: 'published' } } as const
  const [services, projects, guides] = await Promise.all([
    payload.find({ collection: 'services', limit: 100, depth: 0, select: { slug: true, updatedAt: true } }),
    payload.find({ collection: 'projects', where: published, limit: 1000, depth: 0, select: { slug: true, updatedAt: true } }),
    payload.find({ collection: 'guides', where: published, limit: 1000, depth: 0, select: { slug: true, updatedAt: true } }),
  ])
  const pages: { path: string; lastModified?: Date }[] = [
    ...STATIC.map((path) => ({ path })),
    ...services.docs.map((d) => ({ path: `/services/${d.slug}`, lastModified: new Date(d.updatedAt) })),
    ...projects.docs.map((d) => ({ path: `/projects/${d.slug}`, lastModified: new Date(d.updatedAt) })),
    ...guides.docs.map((d) => ({ path: `/guides/${d.slug}`, lastModified: new Date(d.updatedAt) })),
  ]
  const url = (l: Locale, path: string) => `${SITE_URL}${localePath(l, path)}`
  return pages.flatMap((p) =>
    locales.map((l) => ({
      url: url(l, p.path),
      lastModified: p.lastModified,
      priority: p.path === '/' ? 1 : p.path.startsWith('/services') ? 0.9 : 0.7,
      alternates: { languages: { en: url('en', p.path), hi: url('hi', p.path) } },
    })),
  )
}
