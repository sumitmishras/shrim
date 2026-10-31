import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getDictionary, serviceSlugs } from '@/i18n/dictionary'
import { getFaqs, getProjects, getRates, getService, getTestimonials, priceFor } from '@/lib/data'
import { priceLabel } from '@/lib/format'
import { getLocale } from '@/lib/locale'
import { img } from '@/lib/media'
import { pageMeta } from '@/lib/meta'
import { getSiteSettings } from '@/lib/site'
import { ContactButtons } from '@/components/ContactButtons'
import { Faq } from '@/components/Faq'
import { LeadCta } from '@/components/LeadCta'
import { Photo } from '@/components/Photo'
import { ProcessSection } from '@/components/ProcessSection'
import { ProjectCard } from '@/components/ProjectCard'
import { Reveal } from '@/components/Reveal'
import { Section, SectionHead } from '@/components/Section'
import { Testimonials } from '@/components/Testimonials'

type P = { params: Promise<{ locale: string; slug: string }> }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const locale = await getLocale(params)
  const { slug } = await params
  const svc = await getService(slug, locale)
  if (!svc) return {}
  return pageMeta({
    locale, path: `/services/${slug}`, absoluteTitle: !!svc.metaTitle, title: svc.metaTitle || svc.title,
    description: svc.metaDescription || svc.summary || undefined, image: img(svc.heroImage, 'hero')?.src,
  })
}

export default async function ServicePage({ params }: P) {
  const locale = await getLocale(params)
  const { slug } = await params
  if (!(serviceSlugs as readonly string[]).includes(slug)) notFound()
  const svc = await getService(slug, locale)
  if (!svc) notFound()
  const t = getDictionary(locale)
  const sp = t.svcPage
  const [s, rates, projects, testimonials, faqs] = await Promise.all([
    getSiteSettings(locale), getRates(locale),
    getProjects(locale, { serviceId: svc.id, limit: 3 }), getTestimonials(locale, { serviceId: svc.id, limit: 3 }), getFaqs(locale, svc.id),
  ])
  const hero = img(svc.heroImage, 'hero')

  return (
    <>
      <section className="border-b border-line">
        <div className="container-x grid gap-10 py-12 md:py-20 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">{svc.title}</p>
            <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">{svc.heroHeadline || svc.title}</h1>
            {svc.heroSub && <p className="mt-4 max-w-2xl text-lg text-muted">{svc.heroSub}</p>}
            <ContactButtons locale={locale} s={s} context={slug} className="mt-7 lg:hidden" />
            {hero && (
              <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-3xl border border-line">
                <Photo image={hero} sizes="(min-width: 1024px) 60vw, 100vw" priority />
              </div>
            )}
          </div>
          <div className="hidden lg:sticky lg:top-24 lg:block">
            <LeadCta locale={locale} s={s} variant="card" context={slug} title={sp.formTitle} sub={sp.formSub} />
          </div>
        </div>
      </section>

      {!!svc.painPoints?.length && (
        <Section>
          <SectionHead title={sp.problems} />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {svc.painPoints.map((p, i) => (
              <Reveal key={p.id ?? i} delay={i * 0.06} className="h-full">
                <div className="card h-full p-6">
                  <h3 className="font-display text-lg font-semibold">{p.title}</h3>
                  {p.text && <p className="mt-2 text-sm text-muted">{p.text}</p>}
                </div>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {!!svc.inclusions?.length && (
        <Section tone="surface">
          <SectionHead title={sp.included} />
          <ul className="grid gap-x-10 gap-y-3 md:grid-cols-2">
            {svc.inclusions.map((it, i) => (
              <li key={it.id ?? i} className="flex gap-3 border-b border-line py-3">
                <span aria-hidden className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs text-accent">✓</span>
                {it.text}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {!!svc.tiers?.length && (
        <Section>
          <SectionHead title={sp.packages} sub={sp.packagesSub} />
          <div className="grid gap-5 md:grid-cols-3">
            {svc.tiers.map((tier, i) => {
              const pl = priceLabel(priceFor(rates, slug, tier.tier), t, locale)
              return (
                <Reveal key={tier.id ?? i} delay={i * 0.06} className="h-full">
                  <div className="card flex h-full flex-col p-6">
                    <h3 className="font-display text-xl font-semibold">{tier.label}</h3>
                    <div className="mt-4">
                      {pl.prefix && <p className="text-xs uppercase tracking-wider text-muted">{pl.prefix}</p>}
                      <p className="font-display text-3xl font-bold">{pl.main}{pl.unit && <span className="ml-1 text-base font-normal text-muted">{pl.unit}</span>}</p>
                    </div>
                    {tier.description && <p className="mt-4 text-sm text-muted">{tier.description}</p>}
                    {!!tier.highlights?.length && (
                      <ul className="mt-4 space-y-2 text-sm">{tier.highlights.map((h, j) => <li key={h.id ?? j}>✓ {h.text}</li>)}</ul>
                    )}
                  </div>
                </Reveal>
              )
            })}
          </div>
          <p className="mt-5 text-xs text-muted">{sp.rateNote}</p>
        </Section>
      )}

      {projects.docs.length > 0 && (
        <Section tone="surface">
          <SectionHead title={sp.projects} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.docs.map((p, i) => <ProjectCard key={p.id} project={p} locale={locale} index={i} />)}
          </div>
        </Section>
      )}

      <ProcessSection locale={locale} title={sp.process} />

      {testimonials.length > 0 && (
        <Section>
          <SectionHead title={sp.testimonials} />
          <Testimonials items={testimonials} />
        </Section>
      )}

      {faqs.length > 0 && (
        <Section tone="surface">
          <SectionHead title={sp.faq} center />
          <Faq items={faqs} />
        </Section>
      )}

      <LeadCta locale={locale} s={s} context={slug} title={t.home_.ctaTitle} sub={t.home_.ctaSub} />
    </>
  )
}
