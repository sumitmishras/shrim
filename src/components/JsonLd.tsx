import type { Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { breadcrumbLd } from '@/lib/jsonld'

/** Renders structured data. "<" is escaped so content can never close the script tag. */
export function JsonLd({ data }: { data: object | null | undefined }) {
  if (!data) return null
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
}

export function Crumbs({ locale, trail }: { locale: Locale; trail: { name: string; path: string }[] }) {
  return <JsonLd data={breadcrumbLd(locale, getDictionary(locale).nav.home, trail)} />
}
