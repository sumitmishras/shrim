import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { areaName, getDictionary } from '@/i18n/dictionary'
import { getProject, serviceOf } from '@/lib/data'
import { getLocale } from '@/lib/locale'
import { file, img, rows, youtubeId } from '@/lib/media'
import { pageMeta } from '@/lib/meta'
import { getSiteSettings } from '@/lib/site'
import type { Testimonial } from '@/payload-types'
import { BeforeAfter } from '@/components/BeforeAfter'
import { LeadCta } from '@/components/LeadCta'
import { Lightbox } from '@/components/Lightbox'
import { Section, SectionHead } from '@/components/Section'
import { Testimonials } from '@/components/Testimonials'

type P = { params: Promise<{ locale: string; slug: string }> }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const locale = await getLocale(params)
  const { slug } = await params
  const p = await getProject(slug, locale)
  if (!p) return {}
  const cover = rows(p.afterImages)[0] ?? rows(p.gallery)[0]
  return pageMeta({ locale, path: `/projects/${slug}`, title: p.title, description: (p.challenge || p.solution || p.result || '').slice(0, 160) || undefined, image: cover?.src })
}

export default async function ProjectPage({ params }: P) {
  const locale = await getLocale(params)
  const { slug } = await params
  const p = await getProject(slug, locale)
  if (!p) notFound()
  const t = getDictionary(locale)
  const pt = t.project
  const s = await getSiteSettings(locale)
  const svc = serviceOf(p)
  const before = rows(p.beforeImages)
  const after = rows(p.afterImages)
  const pairs = before.slice(0, after.length).map((b, i) => ({ b, a: after[i] }))
  const gallery = rows(p.gallery)
  const yt = youtubeId(p.videoUrl)
  const vid = file(p.video)
  const tm = typeof p.testimonial === 'object' && p.testimonial && p.testimonial.status === 'published' && p.testimonial.consentToPublish ? (p.testimonial as Testimonial) : null

  const facts = [
    [pt.area, p.area ? areaName(locale, p.area) : null], [pt.service, svc?.title], [pt.plot, p.plotSize], [pt.builtUp, p.builtUpArea], [pt.duration, p.duration],
    [pt.budget, p.showBudgetPublicly ? p.budgetRange : null],
  ].filter((f): f is [string, string] => !!f[1])
  const story = [[pt.challenge, p.challenge], [pt.solution, p.solution], [pt.result, p.result]].filter((x): x is [string, string] => !!x[1])
  const label = { open: pt.openPhoto, close: pt.closePhoto, prev: pt.prevPhoto, next: pt.nextPhoto }

  return (
    <>
      <section className="border-b border-line">
        <div className="container-x py-12 md:py-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">{svc?.title}</p>
          <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight md:text-5xl">{p.title}</h1>
          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-3 lg:grid-cols-6">
            {facts.map(([k, v]) => (
              <div key={k}><dt className="text-xs uppercase tracking-wider text-muted">{k}</dt><dd className="mt-1 font-medium">{v}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      {pairs.length > 0 && (
        <Section>
          <div className="grid gap-6 md:grid-cols-2">
            {pairs.map(({ b, a }, i) => <BeforeAfter key={i} priority={i === 0} before={b} after={a} beforeLabel={t.home_.before} afterLabel={t.home_.after} />)}
          </div>
        </Section>
      )}

      {story.length > 0 && (
        <Section tone="surface">
          <div className="grid gap-8 md:grid-cols-3">
            {story.map(([k, v]) => (
              <div key={k}><h2 className="font-display text-xl font-semibold">{k}</h2><p className="mt-3 text-muted">{v}</p></div>
            ))}
          </div>
        </Section>
      )}

      {gallery.length > 0 && (
        <Section>
          <SectionHead title={pt.gallery} />
          <Lightbox images={gallery} labels={label} />
        </Section>
      )}

      {(yt || vid) && (
        <Section tone="surface">
          <SectionHead title={pt.video} />
          <div className="mx-auto aspect-video max-w-3xl overflow-hidden rounded-3xl border border-line bg-black">
            {yt ? (
              <iframe src={`https://www.youtube-nocookie.com/embed/${yt}`} title={p.title} loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen className="size-full" />
            ) : (
              <video controls preload="none" playsInline poster={img(after[0] ?? null)?.src} className="size-full"><source src={vid!.src} type={vid!.mime || 'video/mp4'} /></video>
            )}
          </div>
        </Section>
      )}

      {tm && (
        <Section>
          <SectionHead title={pt.testimonial} />
          <div className="max-w-xl"><Testimonials items={[tm]} /></div>
        </Section>
      )}

      <LeadCta locale={locale} s={s} context={svc?.slug} title={pt.ctaTitle} sub={pt.ctaSub} />
    </>
  )
}
