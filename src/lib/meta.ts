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
      locale: o.locale === 'hi' ? 'hi_IN' : 'en_IN', images: [{ url: o.image || '/og-default.jpg', width: o.image ? undefined : 1200, height: o.image ? undefined : 630 }],
    },
    twitter: { card: 'summary_large_image', title: o.title, description: o.description, images: [o.image || '/og-default.jpg'] },
    robots: o.noindex ? { index: false, follow: false } : undefined,
  }
}
