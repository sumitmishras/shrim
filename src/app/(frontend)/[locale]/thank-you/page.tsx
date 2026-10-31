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
  return pageMeta({ locale, path: '/thank-you', title: getDictionary(locale).quick.thanksTitle, noindex: true })
}

/** Placeholder until milestone 4 (reference number, promise text, featured projects). */
export default async function ThankYouPage({ params }: P) {
  const locale = await getLocale(params)
  const q = getDictionary(locale).quick
  const s = await getSiteSettings(locale)
  return (
    <>
      <PageHero title={q.thanksTitle} sub={`${q.thanksSub} ${s.thankYouPromise}.`} />
      <Section><ContactButtons locale={locale} s={s} book={false} /></Section>
    </>
  )
}
