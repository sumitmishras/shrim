import Link from 'next/link'
import Image from 'next/image'
import { localePath, type Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { file, img } from '@/lib/media'
import type { SiteSettings } from '@/lib/site'

export function Hero({ locale, s }: { locale: Locale; s: SiteSettings }) {
  const t = getDictionary(locale)
  const hero = (s as { hero?: { video?: unknown; poster?: unknown; image?: unknown } }).hero
  const video = file(hero?.video)
  const poster = img(hero?.poster, 'hero') ?? img(hero?.image, 'hero')
  return (
    <section className="relative isolate overflow-hidden bg-[#1c1a17] text-white">
      {poster && <Image src={poster.src} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />}
      {video && (
        <video autoPlay muted loop playsInline preload="metadata" poster={poster?.src} aria-hidden className="absolute inset-0 -z-10 size-full object-cover motion-reduce:hidden">
          <source src={video.src} type={video.mime || 'video/mp4'} />
        </video>
      )}
      {!poster && !video && <div aria-hidden className="absolute inset-0 -z-20 bg-[radial-gradient(60%_80%_at_80%_20%,rgba(200,121,43,.35),transparent),linear-gradient(135deg,#1c1a17,#2a2520)]" />}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/45 to-black/30" />
      <div className="container-x flex min-h-[78svh] flex-col justify-end pb-14 pt-24 md:pb-20">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#e0954a]">{t.tagline}</p>
        <h1 className="max-w-3xl font-display text-4xl font-bold leading-[1.1] md:text-6xl">{t.home_.heroHeadline}</h1>
        <p className="mt-5 max-w-xl text-lg text-white/85">{t.home_.heroSub}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={localePath(locale, '/site-visit')} data-track="cta_click" className="btn btn-primary">{t.bookVisit}</Link>
          <Link href={localePath(locale, '/cost-calculator')} data-track="cta_click" className="btn border border-white/40 text-white hover:bg-white/10">{t.calculateCost}</Link>
        </div>
      </div>
    </section>
  )
}
