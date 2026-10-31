import Link from 'next/link'
import { localePath, type Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { img } from '@/lib/media'
import type { Service } from '@/payload-types'
import { Photo } from './Photo'
import { Reveal } from './Reveal'

export function ServiceCard({ service, locale, index = 0 }: { service: Service; locale: Locale; index?: number }) {
  const t = getDictionary(locale)
  return (
    <Reveal delay={index * 0.06} className="h-full">
      <Link href={localePath(locale, `/services/${service.slug}`)} data-track="cta_click" className="card group flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="relative aspect-[4/3] overflow-hidden bg-line">
          <Photo image={img(service.cardImage, 'card')} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="transition-transform duration-500 group-hover:scale-105" />
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-xl font-semibold">{service.title}</h3>
          {service.summary && <p className="mt-2 flex-1 text-sm text-muted">{service.summary}</p>}
          <span className="mt-4 inline-flex min-h-[44px] items-center gap-1 text-sm font-semibold text-accent">{t.learnMore} <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span></span>
        </div>
      </Link>
    </Reveal>
  )
}
