import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { Inter, Noto_Sans_Devanagari, Space_Grotesk } from 'next/font/google'
import { isLocale } from '@/i18n/config'
import { getSiteSettings, SITE_URL } from '@/lib/site'
import { getGtmId } from '@/lib/tracking'
import { organizationLd } from '@/lib/jsonld'
import { TrackingNoscript, TrackingScripts } from '@/components/Tracking'
import { ConsentBanner } from '@/components/ConsentBanner'
import { JsonLd } from '@/components/JsonLd'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { StickyContactBar } from '@/components/StickyContactBar'
import { ClientBoot } from '@/components/ClientBoot'
import './globals.css'

const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display', display: 'swap' })
const body = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' })
const deva = Noto_Sans_Devanagari({ subsets: ['devanagari'], variable: '--font-deva', display: 'swap' })

export const viewport: Viewport = {
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#f6f3ee' }, { media: '(prefers-color-scheme: dark)', color: '#12110f' }],
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'SHRIM – Construction • Interiors • Fabrication in Lucknow', template: '%s | SHRIM' },
  description: 'House construction, interiors, renovation and fabrication in Lucknow. One accountable team from plan to handover. Book a free site visit.',
}

// Content is edited in the admin and must show immediately. Revisit caching in the performance milestone.
export const dynamic = 'force-dynamic'

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const [s, gtmId] = await Promise.all([getSiteSettings(locale), getGtmId()])
  return (
    <html lang={locale} className={`${display.variable} ${body.variable} ${deva.variable}`}>
      <body className="min-h-dvh font-sans">
        {gtmId && <TrackingNoscript gtmId={gtmId} />}
        <JsonLd data={organizationLd(s, locale)} />
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink">Skip to content</a>
        <Header locale={locale} />
        <main id="main">{children}</main>
        <Footer locale={locale} s={s} cookieSettings={!!gtmId} />
        <StickyContactBar locale={locale} s={s} />
        <ClientBoot />
        {gtmId && <ConsentBanner locale={locale} />}
        {gtmId && <TrackingScripts gtmId={gtmId} />}
      </body>
    </html>
  )
}
