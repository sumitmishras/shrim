'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { localePath, type Locale } from '@/i18n/config'
import { getDictionary, serviceSlugs } from '@/i18n/dictionary'

export default function NotFound() {
  const locale: Locale = (usePathname() || '').startsWith('/hi') ? 'hi' : 'en'
  const t = getDictionary(locale)
  return (
    <section className="container-x py-24">
      <p className="font-display text-7xl font-bold text-accent">404</p>
      <h1 className="mt-4 max-w-2xl font-display text-3xl font-bold md:text-4xl">{t.notFound.title}</h1>
      <p className="mt-3 max-w-xl text-muted">{t.notFound.sub}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={localePath(locale)} className="btn btn-ghost">{t.notFound.home}</Link>
        <Link href={localePath(locale, '/site-visit')} className="btn btn-primary">{t.bookVisit}</Link>
        <Link href={localePath(locale, '/cost-calculator')} className="btn btn-ghost">{t.calculateCost}</Link>
      </div>
      <ul className="mt-10 flex flex-wrap gap-x-6">
        {serviceSlugs.map((s) => <li key={s}><Link href={localePath(locale, `/services/${s}`)} className="inline-flex min-h-[44px] items-center text-muted hover:text-accent">{t.svc[s]}</Link></li>)}
      </ul>
    </section>
  )
}
