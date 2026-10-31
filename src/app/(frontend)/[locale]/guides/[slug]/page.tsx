import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { localePath } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { getGuide } from '@/lib/data'
import { getLocale } from '@/lib/locale'
import { img } from '@/lib/media'
import { pageMeta } from '@/lib/meta'
import { getSiteSettings } from '@/lib/site'
import { headingsOf } from '@/lib/toc'
import type { Service } from '@/payload-types'
import { ContactButtons } from '@/components/ContactButtons'
import { LeadCta } from '@/components/LeadCta'
import { Photo } from '@/components/Photo'
import { Prose } from '@/components/Prose'
import { Section } from '@/components/Section'
import { Crumbs, JsonLd } from '@/components/JsonLd'
import { articleLd, faqLd, serviceLd } from '@/lib/jsonld'

type P = { params: Promise<{ locale: string; slug: string }> }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const locale = await getLocale(params)
  const { slug } = await params
  const g = await getGuide(slug, locale)
  if (!g) return {}
  return pageMeta({ locale, path: `/guides/${slug}`, title: g.metaTitle || g.title, description: g.metaDescription || g.excerpt || undefined, image: img(g.cover, 'hero')?.src })
}

type Root = { root: { children: unknown[]; [k: string]: unknown } }

export default async function GuidePage({ params }: P) {
  const locale = await getLocale(params)
  const { slug } = await params
  const g = await getGuide(slug, locale)
  if (!g) notFound()
  const t = getDictionary(locale)
  const s = await getSiteSettings(locale)
  const content = g.content as unknown as Root | null
  const toc = headingsOf(content?.root as never)
  const svc = typeof g.relatedService === 'object' && g.relatedService ? (g.relatedService as Service) : null
  const date = g.publishedAt ? new Date(g.publishedAt).toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : null

  // CTA box in the middle of the article: split the content in two halves.
  const kids = content?.root.children ?? []
  const mid = Math.ceil(kids.length / 2)
  const half = (c: unknown[]) => ({ ...content, root: { ...content!.root, children: c } })
  const cover = img(g.cover, 'hero')

  const cta = (
    <aside className="my-10 max-w-2xl rounded-3xl border border-accent/40 bg-accent/10 p-6">
      <p className="font-display text-xl font-semibold">{t.guides.ctaTitle}</p>
      <p className="mt-1 text-sm text-muted">{svc ? svc.title : t.guides.ctaSub}</p>
      <ContactButtons locale={locale} s={s} context={svc?.slug} className="mt-4" />
    </aside>
  )

  return (
    <>
      <Crumbs locale={locale} trail={[{ name: t.nav.guides, path: '/guides' }, { name: g.title, path: `/guides/${slug}` }]} />
      <JsonLd data={articleLd({ locale, slug, title: g.title, description: g.metaDescription || g.excerpt, image: cover?.src, author: g.author || 'Rahul Tripathi', published: g.publishedAt, modified: g.updatedAt })} />
      <section className="border-b border-line">
        <div className="container-x py-12 md:py-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent"><Link href={localePath(locale, '/guides')} className="hover:underline">{t.guides.title}</Link></p>
          <h1 className="max-w-3xl font-display text-3xl font-bold leading-tight md:text-5xl">{g.title}</h1>
          <p className="mt-4 text-sm text-muted">{t.guides.by} {g.author}{date && <> · <time dateTime={g.publishedAt!}>{date}</time></>}</p>
        </div>
      </section>
      <Section>
        {cover && <div className="relative mb-10 aspect-[16/9] max-w-3xl overflow-hidden rounded-3xl border border-line"><Photo image={cover} sizes="(min-width: 768px) 768px, 100vw" priority /></div>}
        {toc.length > 1 && (
          <nav aria-label={t.guides.toc} className="mb-10 max-w-2xl rounded-3xl border border-line bg-surface p-6">
            <p className="font-display font-semibold">{t.guides.toc}</p>
            <ol className="mt-3 space-y-1">
              {toc.map((h) => <li key={h.id} className={h.level === 3 ? 'pl-4' : ''}><a href={`#${h.id}`} className="inline-flex min-h-[44px] items-center text-muted hover:text-accent">{h.text}</a></li>)}
            </ol>
          </nav>
        )}
        {content && kids.length > 0 ? (
          <>
            <Prose data={half(kids.slice(0, mid))} />
            {kids.length > 3 && cta}
            <Prose data={half(kids.slice(mid))} />
          </>
        ) : null}
      </Section>
      <LeadCta locale={locale} s={s} context={svc?.slug} title={t.guides.ctaTitle} sub={t.guides.ctaSub} />
    </>
  )
}
