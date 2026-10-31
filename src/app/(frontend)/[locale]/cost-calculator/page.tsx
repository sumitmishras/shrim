import type { Metadata } from 'next'
import { getDictionary } from '@/i18n/dictionary'
import { getRates, toRatesData } from '@/lib/data'
import { getLocale } from '@/lib/locale'
import { pageMeta } from '@/lib/meta'
import { CALC_LIMITS } from '@/lib/leads/options'
import { CalculatorForm } from '@/components/forms/CalculatorForm'
import { PageHero, Section } from '@/components/Section'
import { Crumbs, JsonLd } from '@/components/JsonLd'

// Reads the URL's query string (filters, prefill, reference), so it is rendered fresh for each visit instead of cached.
export const dynamic = 'force-dynamic'

type P = { params: Promise<{ locale: string }>; searchParams: Promise<{ area?: string; floors?: string }> }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const locale = await getLocale(params)
  return pageMeta({
    locale, path: '/cost-calculator', title: getDictionary(locale).quick.calcTitle,
    description: locale === 'hi' ? 'अपने प्लॉट का अनुमानित खर्चा 30 सेकंड में जानिए। फ़ोन नंबर की ज़रूरत नहीं।' : 'Get an approximate construction cost range for your plot in 30 seconds. No phone number needed.',
  })
}

export default async function CalculatorPage({ params, searchParams }: P) {
  const locale = await getLocale(params)
  const q = await searchParams
  const t = getDictionary(locale)
  const rates = await getRates(locale)
  const area = parseInt(q.area ?? '', 10)
  const floors = parseInt(q.floors ?? '', 10)
  return (
    <>
      <Crumbs locale={locale} trail={[{ name: t.nav.calculator, path: '/cost-calculator' }]} />
      <PageHero title={t.quick.calcTitle} sub={locale === 'hi' ? 'कुछ चीज़ें भरिए, तुरंत मोटा अंदाज़ा मिल जाएगा। फ़ोन नंबर की ज़रूरत नहीं।' : 'Enter a few details and get an instant range. No phone number needed.'} />
      <Section>
        <CalculatorForm
          locale={locale} rates={toRatesData(rates)} sample={!!rates.sampleData}
          initialArea={area >= CALC_LIMITS.minArea && area <= CALC_LIMITS.maxArea ? area : undefined}
          initialFloors={floors >= 1 && floors <= CALC_LIMITS.maxFloors ? floors : undefined}
        />
      </Section>
    </>
  )
}
