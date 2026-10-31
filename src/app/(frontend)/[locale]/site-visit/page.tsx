import type { Metadata } from 'next'
import { getDictionary } from '@/i18n/dictionary'
import { getLocale } from '@/lib/locale'
import { pageMeta } from '@/lib/meta'
import { getSiteSettings } from '@/lib/site'
import { ContactButtons } from '@/components/ContactButtons'
import { PageHero, Section } from '@/components/Section'

type P = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const locale = await getLocale(params)
  return pageMeta({ locale, path: '/site-visit', title: getDictionary(locale).quick.siteVisitTitle })
}

/** Placeholder until milestone 4 (multi-step form). */
export default async function SiteVisitPage({ params }: P) {
  const locale = await getLocale(params)
  const q = getDictionary(locale).quick
  const s = await getSiteSettings(locale)
  return (
    <>
      <PageHero title={q.siteVisitTitle} sub={q.siteVisitSub} />
      <Section><ContactButtons locale={locale} s={s} book={false} /></Section>
    </>
  )
}
