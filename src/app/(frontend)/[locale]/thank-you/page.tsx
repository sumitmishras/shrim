import type { Metadata } from 'next'
import { getDictionary } from '@/i18n/dictionary'
import { getProjects } from '@/lib/data'
import { getLocale } from '@/lib/locale'
import { pageMeta } from '@/lib/meta'
import { getSiteSettings, isPlaceholder, waHref } from '@/lib/site'
import { ContactButtons } from '@/components/ContactButtons'
import { ProjectCard } from '@/components/ProjectCard'
import { Section, SectionHead } from '@/components/Section'

type P = { params: Promise<{ locale: string }>; searchParams: Promise<{ ref?: string }> }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const locale = await getLocale(params)
  return pageMeta({ locale, path: '/thank-you', title: getDictionary(locale).quick.thanksTitle, noindex: true })
}

/** Conversion page for Google Ads and Meta. The ?ref= value is only shown if it looks like a real reference. */
export default async function ThankYouPage({ params, searchParams }: P) {
  const locale = await getLocale(params)
  const t = getDictionary(locale)
  const th = t.forms.thanks
  const q = await searchParams
  const ref = /^SHR-\d{4}-\d{4}$/.test(q.ref ?? '') ? q.ref! : undefined
  const [s, projects] = await Promise.all([getSiteSettings(locale), getProjects(locale, { featured: true, limit: 2 })])
  const hasWa = !isPlaceholder(s.whatsapp)
  return (
    <>
      <section className="border-b border-line">
        <div className="container-x py-14 md:py-20">
          <div aria-hidden className="mb-5 flex size-14 items-center justify-center rounded-full bg-accent/15 text-2xl text-accent">✓</div>
          <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight md:text-5xl">{th.title}</h1>
          {ref && (
            <p className="mt-6">
              <span className="block text-xs uppercase tracking-wider text-muted">{th.refLabel}</span>
              <span className="font-display text-3xl font-bold tracking-wider" data-testid="lead-ref">{ref}</span>
            </p>
          )}
          <div className="mt-8 max-w-xl rounded-3xl border border-line bg-surface p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">{th.next}</p>
            <p className="mt-2 font-display text-xl font-semibold">{s.thankYouPromise}</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {hasWa && (
              <a href={waHref(s.whatsapp, ref ? th.waMsg(ref) : t.waMessage('SHRIM Construction'))} data-track="whatsapp_click" target="_blank" rel="noopener noreferrer" className="btn btn-primary">{th.wa}</a>
            )}
            {!hasWa && <ContactButtons locale={locale} s={s} book={false} />}
          </div>
        </div>
      </section>
      {projects.docs.length > 0 && (
        <Section>
          <SectionHead title={th.similar} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.docs.map((p, i) => <ProjectCard key={p.id} project={p} locale={locale} index={i} />)}
          </div>
        </Section>
      )}
    </>
  )
}
