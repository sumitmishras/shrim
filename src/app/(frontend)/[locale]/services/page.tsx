import type { Metadata } from 'next'
import { getDictionary } from '@/i18n/dictionary'
import { getServices } from '@/lib/data'
import { getLocale } from '@/lib/locale'
import { pageMeta } from '@/lib/meta'
import { getSiteSettings } from '@/lib/site'
import { LeadCta } from '@/components/LeadCta'
import { PageHero, Section } from '@/components/Section'
import { ServiceCard } from '@/components/ServiceCard'
import { Crumbs, JsonLd } from '@/components/JsonLd'

type P = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const locale = await getLocale(params)
  const t = getDictionary(locale)
  return pageMeta({ locale, path: '/services', title: t.servicesPage.title, description: t.servicesPage.sub })
}

export default async function ServicesPage({ params }: P) {
  const locale = await getLocale(params)
  const t = getDictionary(locale)
  const [s, services] = await Promise.all([getSiteSettings(locale), getServices(locale)])
  return (
    <>
      <Crumbs locale={locale} trail={[{ name: t.nav.services, path: '/services' }]} />
      <PageHero title={t.servicesPage.title} sub={t.servicesPage.sub} />
      <Section>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
          {services.map((svc, i) => <div key={svc.id} className={i < 3 ? 'lg:col-span-2' : 'lg:col-span-3'}><ServiceCard service={svc} locale={locale} index={i} wide={i >= 3} level={2} /></div>)}
        </div>
      </Section>
      <LeadCta locale={locale} s={s} title={t.home_.ctaTitle} sub={t.home_.ctaSub} />
    </>
  )
}
