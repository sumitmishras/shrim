import type { Metadata } from 'next'
import { getDictionary } from '@/i18n/dictionary'
import { getLocale } from '@/lib/locale'
import { pageMeta } from '@/lib/meta'
import { getSiteSettings, isPlaceholder } from '@/lib/site'
import { ContactButtons } from '@/components/ContactButtons'
import { SiteVisitForm } from '@/components/forms/SiteVisitForm'
import { PageHero, Section } from '@/components/Section'
import { Crumbs, JsonLd } from '@/components/JsonLd'

type P = { params: Promise<{ locale: string }>; searchParams: Promise<{ service?: string }> }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const locale = await getLocale(params)
  const q = getDictionary(locale).quick
  return pageMeta({ locale, path: '/site-visit', title: q.siteVisitTitle, description: locale === 'hi' ? 'कुछ सवालों के जवाब दीजिए और अपनी फ्री साइट विज़िट बुक कीजिए।' : 'Answer a few quick questions and book your free site visit in Lucknow.' })
}

export default async function SiteVisitPage({ params, searchParams }: P) {
  const locale = await getLocale(params)
  const { service } = await searchParams
  const t = getDictionary(locale)
  const s = await getSiteSettings(locale)
  return (
    <>
      <Crumbs locale={locale} trail={[{ name: t.quick.siteVisitTitle, path: '/site-visit' }]} />
      <PageHero title={t.quick.siteVisitTitle} sub={locale === 'hi' ? 'चार छोटे स्टेप। कोई चार्ज नहीं, कोई मजबूरी नहीं।' : 'Four short steps. No charge, no obligation.'} />
      <Section>
        <SiteVisitForm locale={locale} initialService={service} />
        {(!isPlaceholder(s.phone) || !isPlaceholder(s.whatsapp)) && (
          <div className="mx-auto mt-12 max-w-2xl border-t border-line pt-8">
            <p className="mb-3 text-sm text-muted">{t.forms.thanks.visit}</p>
            <ContactButtons locale={locale} s={s} book={false} />
          </div>
        )}
      </Section>
    </>
  )
}
