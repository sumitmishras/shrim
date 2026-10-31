import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { Locale } from '@/i18n/config'
import { getPage } from '@/lib/data'
import { pageMeta } from '@/lib/meta'
import { getSiteSettings } from '@/lib/site'
import { LeadCta } from './LeadCta'
import { Prose } from './Prose'
import { PageHero, Section } from './Section'
import { Crumbs, JsonLd } from '@/components/JsonLd'

type Slug = 'commercial' | 'privacy-policy' | 'terms'

export async function legalMetadata(locale: Locale, slug: Slug): Promise<Metadata> {
  const p = await getPage(slug, locale)
  return pageMeta({ locale, path: `/${slug}`, title: p?.title ?? slug, description: p?.metaDescription || undefined })
}

/** Shared by commercial, privacy-policy and terms. Content comes from the Pages collection. */
export async function TextPage({ locale, slug, cta }: { locale: Locale; slug: Slug; cta?: { title: string; sub: string } }) {
  const p = await getPage(slug, locale)
  if (!p) notFound()
  const s = await getSiteSettings(locale)
  return (
    <>
      <Crumbs locale={locale} trail={[{ name: p.title, path: `/${slug}` }]} />
      <PageHero title={p.title} sub={slug === 'commercial' ? p.intro ?? undefined : undefined} />
      <Section>
        {slug !== 'commercial' && p.intro && <p className="mb-8 max-w-2xl text-muted">{p.intro}</p>}
        <Prose data={p.body} />
      </Section>
      {cta && <LeadCta locale={locale} s={s} title={cta.title} sub={cta.sub} context="Commercial" />}
    </>
  )
}
