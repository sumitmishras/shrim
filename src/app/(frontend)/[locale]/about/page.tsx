import type { Metadata } from 'next'
import { getDictionary } from '@/i18n/dictionary'
import { getAbout } from '@/lib/data'
import { getLocale } from '@/lib/locale'
import { img, rows } from '@/lib/media'
import { pageMeta } from '@/lib/meta'
import { getSiteSettings } from '@/lib/site'
import { LeadCta } from '@/components/LeadCta'
import { MapEmbed } from '@/components/MapEmbed'
import { Photo } from '@/components/Photo'
import { ProcessSection } from '@/components/ProcessSection'
import { Reveal } from '@/components/Reveal'
import { PageHero, Section, SectionHead } from '@/components/Section'

type P = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const locale = await getLocale(params)
  const t = getDictionary(locale).about
  return pageMeta({ locale, path: '/about', title: t.title, description: t.sub })
}

export default async function AboutPage({ params }: P) {
  const locale = await getLocale(params)
  const t = getDictionary(locale)
  const [s, a] = await Promise.all([getSiteSettings(locale), getAbout(locale)])
  const paragraphs = (a.story ?? '').split(/\n\s*\n/).filter(Boolean)
  const founder = img(a.founderPhoto, 'card')
  const team = (a.teamPhotos ?? []).map((x) => ({ image: img(x.image, 'card'), caption: x.caption })).filter((x) => x.image)

  return (
    <>
      <PageHero title={a.headline || t.about.title} sub={t.about.sub} eyebrow={t.about.title} />
      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="max-w-prose space-y-5 text-lg leading-relaxed">
            {paragraphs.map((para, i) => <p key={i}>{para}</p>)}
            {a.founderName && <p className="pt-2 font-display font-semibold">{a.founderName}<span className="block text-sm font-normal text-muted">{t.about.founder}, SHRIM Enterprises</span></p>}
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-line"><Photo image={founder} sizes="(min-width: 1024px) 35vw, 100vw" /></div>
        </div>
      </Section>

      {!!a.values?.length && (
        <Section tone="surface">
          <SectionHead title={t.about.valuesTitle} />
          <div className="grid gap-5 md:grid-cols-3">
            {a.values.map((v, i) => (
              <Reveal key={v.id ?? i} delay={i * 0.06} className="h-full">
                <div className="card h-full p-6"><h3 className="font-display text-xl font-semibold">{v.title}</h3>{v.text && <p className="mt-2 text-muted">{v.text}</p>}</div>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {team.length > 0 && (
        <Section>
          <SectionHead title={t.about.teamTitle} />
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {team.map((m, i) => (
              <li key={i}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-line"><Photo image={m.image} sizes="(min-width: 768px) 25vw, 50vw" /></div>
                {m.caption && <p className="mt-2 text-sm text-muted">{m.caption}</p>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <ProcessSection locale={locale} title={t.about.processTitle} />

      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <SectionHead title={t.about.gstTitle} />
            <div className="card inline-block p-6">
              <p className="text-sm text-muted">{t.about.gstText}</p>
              <p className="mt-3 text-xs uppercase tracking-wider text-muted">{t.about.gstin}</p>
              <p className="font-display text-xl font-bold tracking-wider">{s.gstin}</p>
            </div>
            <h2 className="mb-3 mt-10 font-display text-2xl font-bold">{t.about.officeTitle}</h2>
            <p className="max-w-sm text-muted">{s.showFullAddress ? s.addressFull : s.addressShort}</p>
          </div>
          <MapEmbed title={t.about.officeTitle} />
        </div>
      </Section>
      <LeadCta locale={locale} s={s} title={t.home_.ctaTitle} sub={t.home_.ctaSub} />
    </>
  )
}
