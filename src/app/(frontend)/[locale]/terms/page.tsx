import { getLocale } from '@/lib/locale'
import { legalMetadata, TextPage } from '@/components/LegalPage'

type P = { params: Promise<{ locale: string }> }
export async function generateMetadata({ params }: P) { return legalMetadata(await getLocale(params), 'terms') }
export default async function Terms({ params }: P) {
  return <TextPage locale={await getLocale(params)} slug="terms" />
}
