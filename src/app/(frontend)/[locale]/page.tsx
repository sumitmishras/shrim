import type { Metadata } from 'next'
import Link from 'next/link'
import { localePath } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { getFaqs, getProjects, getServices, getTestimonials } from '@/lib/data'
import { getLocale } from '@/lib/locale'
import { rows } from '@/lib/media'
import { pageMeta } from '@/lib/meta'
import { getSiteSettings } from '@/lib/site'
import { AreaChips } from '@/components/AreasSection'
import { BeforeAfter } from '@/components/BeforeAfter'
import { CalcTeaser } from '@/components/CalcTeaser'
import { Faq } from '@/components/Faq'
import { Hero } from '@/components/Hero'
import { LeadCta } from '@/components/LeadCta'
import { ProcessSection } from '@/components/ProcessSection'
import { ProjectCard } from '@/components/ProjectCard'
import { Reveal } from '@/components/Reveal'
import { Section, SectionHead } from '@/components/Section'
import { ServiceCard } from '@/components/ServiceCard'
import { Testimonials } from '@/components/Testimonials'
import { TrustStrip } from '@/components/TrustStrip'
import { Crumbs, JsonLd } from '@/components/JsonLd'
import { articleLd, faqLd, serviceLd } from '@/lib/jsonld'

type P = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const locale = await getLocale(params)
  return pageMeta({
    locale, path: '/', absoluteTitle: true,
    title: locale === 'hi' ? 'SHRIM – लखनऊ में घर निर्माण, इंटीरियर और फैब्रिकेशन' : 'SHRIM – House Construction, Interiors & Fabrication in Lucknow',
    description: locale === 'hi'
      ? 'लखनऊ में घर बनवाइए नक्शे से चाबी तक, एक ही टीम से। फ्री साइट विज़िट बुक करें।'
      : 'Build, renovate or furnish your home in Lucknow with one accountable team – from naksha to chaabi. Book a free site visit.',
  })
}

export default async function Home({ params }: P) {
  const locale = await getLocale(params)
  const t = getDictionary(locale)
  const h = t.home_
  const [s, services, featured, testimonials, faqs] = await Promise.all([
    getSiteSettings(locale), getServices(locale), getProjects(locale, { featured: true, limit: 6 }), getTestimonials(locale, { limit: 6 }), getFaqs(locale),
  ])
  const pairs = featured.docs
    .map((p) => ({ p, before: rows(p.beforeImages)[0], after: rows(p.afterImages)[0] }))
    .filter((x) => x.before && x.after)
    .slice(0, 4)

  return (
    <>
      <JsonLd data={faqLd(faqs.map((f) => ({ question: f.question, answer: f.answer })))} />
      <Hero locale={locale} s={s} />
      <TrustStrip locale={locale} s={s} />

      <Section>
        <SectionHead title={h.servicesTitle} sub={h.servicesSub} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((svc, i) => <ServiceCard key={svc.id} service={svc} locale={locale} index={i} />)}
        </div>
      </Section>

      {pairs.length > 0 && (
        <Section tone="surface">
          <SectionHead title={h.beforeAfterTitle} sub={h.beforeAfterSub} />
          <div className="grid gap-6 md:grid-cols-2">
            {pairs.map(({ p, before, after }) => (
              <Reveal key={p.id}>
                <BeforeAfter before={before} after={after} beforeLabel={h.before} afterLabel={h.after} />
                <Link href={localePath(locale, `/projects/${p.slug}`)} className="mt-3 inline-flex min-h-[44px] items-center font-medium hover:text-accent">{p.title} →</Link>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      <Section>
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <SectionHead title={h.calcTitle} sub={h.calcSub} />
          <CalcTeaser locale={locale} />
        </div>
      </Section>

      <ProcessSection locale={locale} />

      {featured.docs.length > 0 && (
        <Section>
          <div className="flex items-end justify-between gap-4">
            <SectionHead title={h.featuredTitle} />
            <Link href={localePath(locale, '/projects')} className="mb-10 inline-flex min-h-[44px] shrink-0 items-center font-medium text-accent">{t.viewAll} →</Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.docs.slice(0, 3).map((p, i) => <ProjectCard key={p.id} project={p} locale={locale} index={i} />)}
          </div>
        </Section>
      )}

      {testimonials.length > 0 && (
        <Section tone="surface">
          <SectionHead title={h.testimonialsTitle} />
          <Testimonials items={testimonials} />
        </Section>
      )}

      <Section>
        <SectionHead title={h.areasTitle} sub={h.areasSub} />
        <AreaChips locale={locale} />
      </Section>

      {faqs.length > 0 && (
        <Section tone="surface">
          <SectionHead title={h.faqTitle} center />
          <Faq items={faqs} />
        </Section>
      )}

      <LeadCta locale={locale} s={s} title={h.ctaTitle} sub={h.ctaSub} form={{ source: 'home' }} />
    </>
  )
}
