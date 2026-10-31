import type { Metadata } from 'next'
import { localePath, type Locale } from '@/i18n/config'
import { SITE_URL } from './site'

export function pageMeta(o: { locale: Locale; path: string; title: string; description?: string; absoluteTitle?: boolean; noindex?: boolean; image?: string }): Metadata {
  const url = (l: Locale) => `${SITE_URL}${localePath(l, o.path)}`
  return {
    title: o.absoluteTitle ? { absolute: o.title } : o.title,
    description: o.description,
    alternates: { canonical: url(o.locale), languages: { en: url('en'), hi: url('hi'), 'x-default': url('en') } },
    openGraph: {
      title: o.title, description: o.description, url: url(o.locale), siteName: 'SHRIM', type: 'website',
      locale: o.locale === 'hi' ? 'hi_IN' : 'en_IN', images: o.image ? [{ url: o.image }] : undefined,
    },
    robots: o.noindex ? { index: false, follow: false } : undefined,
  }
}
