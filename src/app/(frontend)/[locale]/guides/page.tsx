import type { Metadata } from 'next'
import Link from 'next/link'
import { localePath } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { getGuides } from '@/lib/data'
import { getLocale } from '@/lib/locale'
import { img } from '@/lib/media'
import { pageMeta } from '@/lib/meta'
import { Photo } from '@/components/Photo'
import { Reveal } from '@/components/Reveal'
import { PageHero, Section } from '@/components/Section'
import { Crumbs, JsonLd } from '@/components/JsonLd'

type P = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const locale = await getLocale(params)
  const t = getDictionary(locale).guides
  return pageMeta({ locale, path: '/guides', title: t.title, description: t.sub })
}

export default async function GuidesPage({ params }: P) {
  const locale = await getLocale(params)
  const t = getDictionary(locale).guides
  const guides = await getGuides(locale)
  return (
    <>
      <Crumbs locale={locale} trail={[{ name: t.title, path: '/guides' }]} />
      <PageHero title={t.title} sub={t.sub} />
      <Section>
        {guides.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">{t.empty}</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((g, i) => (
              <Reveal key={g.id} delay={(i % 3) * 0.06} className="h-full">
                <Link href={localePath(locale, `/guides/${g.slug}`)} className="card group flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative aspect-[16/9] overflow-hidden bg-line"><Photo image={img(g.cover, 'card')} sizes="(min-width: 1024px) 33vw, 100vw" className="transition-transform duration-500 group-hover:scale-105" /></div>
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="font-display text-lg font-semibold">{g.title}</h2>
                    {g.excerpt && <p className="mt-2 flex-1 text-sm text-muted">{g.excerpt}</p>}
                    <span className="mt-4 inline-flex min-h-[44px] items-center text-sm font-semibold text-accent">{t.read} →</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </Section>
    </>
  )
}
