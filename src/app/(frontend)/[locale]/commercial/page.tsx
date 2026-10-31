import { getDictionary } from '@/i18n/dictionary'
import { getLocale } from '@/lib/locale'
import { legalMetadata, TextPage } from '@/components/LegalPage'

type P = { params: Promise<{ locale: string }> }
export async function generateMetadata({ params }: P) { return legalMetadata(await getLocale(params), 'commercial') }
export default async function Commercial({ params }: P) {
  const locale = await getLocale(params)
  const t = getDictionary(locale).home_
  return <TextPage locale={locale} slug="commercial" cta={{ title: t.ctaTitle, sub: t.ctaSub }} />
}
