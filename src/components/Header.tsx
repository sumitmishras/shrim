import Link from 'next/link'
import { localePath, type Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { Logo } from './Logo'
import { MobileNav } from './MobileNav'
import { LangSwitch } from './LangSwitch'

export function Header({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const links = [
    { href: '/services', label: t.nav.services },
    { href: '/projects', label: t.nav.projects },
    { href: '/commercial', label: t.nav.commercial },
    { href: '/cost-calculator', label: t.nav.calculator },
    { href: '/guides', label: t.nav.guides },
    { href: '/about', label: t.nav.about },
    { href: '/contact', label: t.nav.contact },
  ].map((l) => ({ ...l, href: localePath(locale, l.href) }))

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Logo locale={locale} tagline={t.tagline} />
        <nav aria-label="Main" className="hidden items-center gap-6 text-sm lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-muted transition-colors hover:text-ink">{l.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LangSwitch locale={locale} label={t.switchTo} />
          <Link href={localePath(locale, '/site-visit')} className="btn btn-primary hidden sm:inline-flex">{t.bookVisit}</Link>
          <MobileNav links={links} cta={{ href: localePath(locale, '/site-visit'), label: t.bookVisit }} />
        </div>
      </div>
    </header>
  )
}
