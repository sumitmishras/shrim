import type { Metadata } from 'next'
import Link from 'next/link'
import { localePath } from '@/i18n/config'
import { areaName, getDictionary } from '@/i18n/dictionary'
import { getProjectAreas, getProjects, getServices } from '@/lib/data'
import { cardGrid } from '@/lib/grid'
import { getLocale } from '@/lib/locale'
import { pageMeta } from '@/lib/meta'
import { getSiteSettings } from '@/lib/site'
import { LeadCta } from '@/components/LeadCta'
import { ProjectCard } from '@/components/ProjectCard'
import { PageHero, Section } from '@/components/Section'
import { Crumbs, JsonLd } from '@/components/JsonLd'

// Reads the URL's query string (filters, prefill, reference), so it is rendered fresh for each visit instead of cached.
export const dynamic = 'force-dynamic'

type P = { params: Promise<{ locale: string }>; searchParams: Promise<{ service?: string; area?: string; page?: string }> }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const locale = await getLocale(params)
  const t = getDictionary(locale).projectsPage
  return pageMeta({ locale, path: '/projects', title: t.title, description: t.sub })
}

export default async function ProjectsPage({ params, searchParams }: P) {
  const locale = await getLocale(params)
  const q = await searchParams
  const t = getDictionary(locale)
  const pt = t.projectsPage
  const [s, services, areas] = await Promise.all([getSiteSettings(locale), getServices(locale), getProjectAreas()])
  const service = services.find((x) => x.slug === q.service)
  const area = areas.includes(q.area ?? '') ? q.area : undefined
  const page = Math.max(1, parseInt(q.page ?? '1', 10) || 1)
  const res = await getProjects(locale, { serviceId: service?.id, area, page, limit: 9 })
  const filtered = Boolean(service || area)

  const pageHref = (n: number) => {
    const sp = new URLSearchParams()
    if (service) sp.set('service', service.slug)
    if (area) sp.set('area', area)
    if (n > 1) sp.set('page', String(n))
    const qs = sp.toString()
    return localePath(locale, '/projects') + (qs ? `?${qs}` : '')
  }
  const field = 'mt-1 block min-h-[48px] w-full rounded-xl border border-line bg-bg px-3 text-base'

  return (
    <>
      <Crumbs locale={locale} trail={[{ name: t.nav.projects, path: '/projects' }]} />
      <PageHero title={pt.title} sub={pt.sub} />
      <Section>
        {(areas.length > 0 || res.totalDocs > 0 || filtered) && (
          <form action={localePath(locale, '/projects')} method="get" className="mb-10 grid gap-4 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
            <label className="text-sm font-medium">{pt.service}
              <select name="service" defaultValue={service?.slug ?? ''} className={field}>
                <option value="">{pt.allServices}</option>
                {services.map((x) => <option key={x.id} value={x.slug}>{x.title}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium">{pt.area}
              <select name="area" defaultValue={area ?? ''} className={field}>
                <option value="">{pt.allAreas}</option>
                {areas.map((a) => <option key={a} value={a}>{areaName(locale, a)}</option>)}
              </select>
            </label>
            <button type="submit" className="btn btn-primary">{pt.filter}</button>
            {filtered && <Link href={localePath(locale, '/projects')} className="btn btn-ghost">{pt.reset}</Link>}
          </form>
        )}
        {res.docs.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">{filtered ? pt.emptyFiltered : pt.empty}</p>
        ) : (
          <div className={cardGrid(res.docs.length)}>
            {res.docs.map((p, i) => <ProjectCard key={p.id} project={p} locale={locale} index={i} level={2} />)}
          </div>
        )}
        {res.totalPages > 1 && (
          <nav className="mt-10 flex justify-center gap-3" aria-label="Pagination">
            {res.hasPrevPage && <Link href={pageHref(page - 1)} className="btn btn-ghost">← {pt.prev}</Link>}
            {res.hasNextPage && <Link href={pageHref(page + 1)} className="btn btn-ghost">{pt.next} →</Link>}
          </nav>
        )}
      </Section>
      <LeadCta locale={locale} s={s} title={t.home_.ctaTitle} sub={t.home_.ctaSub} />
    </>
  )
}
