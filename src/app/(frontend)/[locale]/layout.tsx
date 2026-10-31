import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { Inter, Space_Grotesk } from 'next/font/google'
import devaFile from '../../../fonts/NotoSansDevanagari-subset.woff2'
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
import { MotionProvider } from '@/components/MotionProvider'
import './globals.css'

const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display', display: 'swap' })
const body = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' })
// Noto Sans Devanagari, trimmed to the Devanagari block and weights 400-700 (68 KB instead of 117 KB; see src/fonts/LICENSE.txt).
// Declared by hand (not next/font) so Hindi pages can preload it. unicode-range means English pages never download it.
const devaUrl = typeof devaFile === 'string' ? (devaFile as string) : devaFile.src
const devaFace = `@font-face{font-family:'Noto Sans Devanagari';src:url(${devaUrl}) format('woff2');font-weight:400 700;font-style:normal;font-display:swap;unicode-range:U+0900-097F,U+0964-0965,U+200C-200D,U+25CC}:root{--font-deva:'Noto Sans Devanagari'}`

export const viewport: Viewport = {
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#f6f3ee' }, { media: '(prefers-color-scheme: dark)', color: '#12110f' }],
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'SHRIM – Construction • Interiors • Fabrication in Lucknow', template: '%s | SHRIM' },
  description: 'House construction, interiors, renovation and fabrication in Lucknow. One accountable team from plan to handover. Book a free site visit.',
}

// Pages are cached. Saving content in the admin clears the cache at once (src/lib/revalidate.ts);
// this hourly refresh is only a safety net.
export const revalidate = 3600

// Nothing is built in advance (the build needs no database). Each page is generated on its first visit, then cached.
export function generateStaticParams() {
  return []
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const [s, gtmId] = await Promise.all([getSiteSettings(locale), getGtmId()])
  return (
    <html lang={locale} className={`${display.variable} ${body.variable}`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: devaFace }} />
        {locale === 'hi' && <link rel="preload" href={devaUrl} as="font" type="font/woff2" crossOrigin="anonymous" />}
      </head>
      <body className="min-h-dvh font-sans">
        {gtmId && <TrackingNoscript gtmId={gtmId} />}
        <JsonLd data={organizationLd(s, locale)} />
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink">Skip to content</a>
        <MotionProvider>
          <Header locale={locale} />
          <main id="main">{children}</main>
          <Footer locale={locale} s={s} cookieSettings={!!gtmId} />
        </MotionProvider>
        <StickyContactBar locale={locale} s={s} />
        <ClientBoot />
        {gtmId && <ConsentBanner locale={locale} />}
        {gtmId && <TrackingScripts gtmId={gtmId} />}
      </body>
    </html>
  )
}
