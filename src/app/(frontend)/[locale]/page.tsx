import Link from 'next/link'
import { isLocale, localePath } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { notFound } from 'next/navigation'

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)
  return (
    <section className="container-x py-24">
      <h1 className="font-display text-4xl font-bold leading-tight md:text-6xl">
        {locale === 'hi' ? 'लखनऊ में अपना घर बनवाइए – नक्शे से चाबी तक, एक ही टीम।' : 'Lucknow mein apna ghar banwaiye – naksha se chaabi tak, ek hi team.'}
      </h1>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={localePath(locale, '/site-visit')} className="btn btn-primary">{t.bookVisit}</Link>
        <Link href={localePath(locale, '/cost-calculator')} className="btn btn-ghost">{t.calculateCost}</Link>
      </div>
    </section>
  )
}
