import { localePath, type Locale } from '@/i18n/config'
import { areaName, priorityAreas, secondaryAreas } from '@/i18n/dictionary'
import { isPlaceholder, SITE_URL, type SiteSettings } from './site'

export const ORG_ID = `${SITE_URL}/#organization`
const abs = (locale: Locale, path: string) => `${SITE_URL}${localePath(locale, path)}`
const absUrl = (u?: string | null) => (u ? (u.startsWith('http') ? u : `${SITE_URL}${u}`) : undefined)
const CTX = 'https://schema.org'

/** GeneralContractor (LocalBusiness) with the GST-registered address and the areas we serve. */
export function organizationLd(s: SiteSettings, locale: Locale) {
  const phone = isPlaceholder(s.phone) ? undefined : `+91${s.phone.replace(/\D/g, '').slice(-10)}`
  return {
    '@context': CTX,
    '@type': 'GeneralContractor',
    '@id': ORG_ID,
    name: 'SHRIM Enterprises',
    alternateName: 'SHRIM',
    description: locale === 'hi'
      ? 'लखनऊ में घर निर्माण, इंटीरियर, रेनोवेशन और फैब्रिकेशन।'
      : 'House construction, interiors, renovation and fabrication in Lucknow.',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
    image: `${SITE_URL}/og-default.jpg`,
    taxID: s.gstin,
    founder: { '@type': 'Person', name: 'Rahul Tripathi' },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '86F/4, Khasra No 195-196, Mallhaur Road, Near Amity University, Chinhat (Nizampur Mallhaur)',
      addressLocality: 'Lucknow', addressRegion: 'Uttar Pradesh', postalCode: '226028', addressCountry: 'IN',
    },
    ...(s.seo?.geoLat != null && s.seo?.geoLng != null ? { geo: { '@type': 'GeoCoordinates', latitude: s.seo.geoLat, longitude: s.seo.geoLng } } : {}),
    ...(phone ? { telephone: phone } : {}),
    email: s.email,
    ...(s.seo?.openingHoursSpec ? { openingHours: s.seo.openingHoursSpec } : {}),
    areaServed: [
      { '@type': 'City', name: 'Lucknow' },
      ...[...priorityAreas, ...secondaryAreas].map((a) => ({ '@type': 'Place', name: `${areaName('en', a)}, Lucknow` })),
    ],
    sameAs: Object.values(s.social ?? {}).filter((v): v is string => !!v),
  }
}

export const serviceLd = (o: { locale: Locale; slug: string; name: string; description?: string | null; image?: string | null }) => ({
  '@context': CTX,
  '@type': 'Service',
  name: o.name,
  serviceType: o.name,
  description: o.description || undefined,
  url: abs(o.locale, `/services/${o.slug}`),
  image: absUrl(o.image),
  inLanguage: o.locale,
  provider: { '@id': ORG_ID },
  areaServed: { '@type': 'City', name: 'Lucknow' },
})

export const faqLd = (items: { question: string; answer: string }[]) => items.length ? ({
  '@context': CTX,
  '@type': 'FAQPage',
  mainEntity: items.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
}) : null

export const articleLd = (o: { locale: Locale; slug: string; title: string; description?: string | null; image?: string | null; author: string; published?: string | null; modified?: string | null }) => ({
  '@context': CTX,
  '@type': 'Article',
  headline: o.title,
  description: o.description || undefined,
  image: absUrl(o.image) ?? `${SITE_URL}/og-default.jpg`,
  author: { '@type': 'Person', name: o.author },
  publisher: { '@id': ORG_ID },
  datePublished: o.published || undefined,
  dateModified: o.modified || o.published || undefined,
  inLanguage: o.locale,
  mainEntityOfPage: abs(o.locale, `/guides/${o.slug}`),
})

export const breadcrumbLd = (locale: Locale, home: string, trail: { name: string; path: string }[]) => ({
  '@context': CTX,
  '@type': 'BreadcrumbList',
  itemListElement: [{ name: home, path: '/' }, ...trail].map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: abs(locale, c.path) })),
})
