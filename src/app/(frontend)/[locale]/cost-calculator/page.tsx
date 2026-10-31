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
  return pageMeta({ locale, path: '/cost-calculator', title: getDictionary(locale).quick.calcTitle })
}

/** Placeholder until milestone 4. The home page teaser already sends ?area= and ?floors=. */
export default async function CalculatorPage({ params }: P) {
  const locale = await getLocale(params)
  const q = getDictionary(locale).quick
  const s = await getSiteSettings(locale)
  return (
    <>
      <PageHero title={q.calcTitle} sub={q.calcSub} />
      <Section><ContactButtons locale={locale} s={s} /></Section>
    </>
  )
}
