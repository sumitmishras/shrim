import type { Metadata } from 'next'
import { getDictionary } from '@/i18n/dictionary'
import { getLocale } from '@/lib/locale'
import { pageMeta } from '@/lib/meta'
import { getSiteSettings, isPlaceholder, telHref } from '@/lib/site'
import { ContactButtons } from '@/components/ContactButtons'
import { MapEmbed } from '@/components/MapEmbed'
import { PageHero, Section } from '@/components/Section'

type P = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const locale = await getLocale(params)
  const t = getDictionary(locale).contact
  return pageMeta({ locale, path: '/contact', title: t.title, description: t.sub })
}

export default async function ContactPage({ params }: P) {
  const locale = await getLocale(params)
  const t = getDictionary(locale)
  const c = t.contact
  const s = await getSiteSettings(locale)
  const hasPhone = !isPlaceholder(s.phone)
  const row = (k: string, v: React.ReactNode) => (
    <div className="border-b border-line py-4"><dt className="text-xs uppercase tracking-wider text-muted">{k}</dt><dd className="mt-1 text-lg">{v}</dd></div>
  )
  return (
    <>
      <PageHero title={c.title} sub={c.sub} />
      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <dl>
              {row(c.phone, hasPhone ? <a href={telHref(s.phone)} data-track="call_click" className="inline-flex min-h-[44px] items-center hover:text-accent">{s.phone}</a> : <span className="text-muted">{t.phoneSoon}</span>)}
              {row(c.email, <a href={`mailto:${s.email}`} className="inline-flex min-h-[44px] items-center break-all hover:text-accent">{s.email}</a>)}
              {row(c.address, s.showFullAddress ? s.addressFull : s.addressShort)}
              {s.officeHours && row(c.hours, s.officeHours)}
            </dl>
            <ContactButtons locale={locale} s={s} className="mt-8" />
            <p className="mt-6 text-sm text-muted">{c.formSoon}</p>
          </div>
          <div>
            <h2 className="mb-4 font-display text-2xl font-bold">{c.findUs}</h2>
            <MapEmbed title={c.findUs} />
          </div>
        </div>
      </Section>
    </>
  )
}
