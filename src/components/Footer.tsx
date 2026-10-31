import Link from 'next/link'
import { localePath, type Locale } from '@/i18n/config'
import { areaName, getDictionary, priorityAreas, serviceSlugs } from '@/i18n/dictionary'
import { isPlaceholder, type SiteSettings } from '@/lib/site'
import { Logo } from './Logo'
import { CookieSettingsButton } from './ConsentBanner'

export function Footer({ locale, s, cookieSettings = false }: { locale: Locale; s: SiteSettings; cookieSettings?: boolean }) {
  const t = getDictionary(locale)
  const social = Object.entries(s.social || {}).filter(([, v]) => v)
  return (
    <footer className="mt-24 border-t border-line pb-24 lg:pb-0">
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div className="space-y-4">
          <Logo locale={locale} tagline={t.tagline} />
          <p className="text-sm text-muted">{t.promise}</p>
          {social.length > 0 && (
            <ul className="flex flex-wrap gap-3 text-sm">
              {social.map(([k, v]) => (<li key={k}><a href={v!} rel="noopener noreferrer" target="_blank" className="inline-flex min-h-[44px] items-center capitalize text-muted hover:text-ink">{k}</a></li>))}
            </ul>
          )}
        </div>
        <FooterCol title={t.footer.services}>
          {serviceSlugs.map((slug) => (<Link key={slug} href={localePath(locale, `/services/${slug}`)}>{t.svc[slug]}</Link>))}
        </FooterCol>
        <FooterCol title={t.footer.areas}>
          {priorityAreas.map((a) => (<span key={a}>{areaName(locale, a)}</span>))}
        </FooterCol>
        <FooterCol title={t.footer.contact}>
          {!isPlaceholder(s.phone) && <a href={`tel:${s.phone}`}>{s.phone}</a>}
          <a href={`mailto:${s.email}`}>{s.email}</a>
          <span>{s.showFullAddress ? s.addressFull : s.addressShort}</span>
          <Link href={localePath(locale, '/privacy-policy')}>{t.footer.privacy}</Link>
          <Link href={localePath(locale, '/terms')}>{t.footer.terms}</Link>
          {cookieSettings && <CookieSettingsButton label={t.consent.settings} />}
        </FooterCol>
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-muted">
        <div className="container-x">SHRIM Enterprises | GSTIN: {s.gstin} | Mallhaur Road, Chinhat, Lucknow – 226028</div>
      </div>
    </footer>
  )
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider">{title}</h2>
      <div className="flex flex-col text-sm text-muted [&>a]:inline-flex [&>a]:min-h-[44px] [&>a]:items-center [&>a:hover]:text-ink [&>span]:py-1.5">{children}</div>
    </div>
  )
}
