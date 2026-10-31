import type { Testimonial } from '@/payload-types'
import { file } from '@/lib/media'
import { Reveal } from './Reveal'

/** Video testimonials first, then text. Renders nothing when there are none. */
export function Testimonials({ items }: { items: Testimonial[] }) {
  if (!items.length) return null
  const sorted = [...items].sort((a, b) => Number(!!file(b.video)) - Number(!!file(a.video)))
  return (
    <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {sorted.map((t, i) => {
        const v = file(t.video)
        return (
          <li key={t.id}>
            <Reveal delay={(i % 3) * 0.06} className="h-full">
              <figure className="card flex h-full flex-col overflow-hidden">
                {v && <video controls preload="none" playsInline className="aspect-video w-full bg-black"><source src={v.src} type={v.mime || 'video/mp4'} /></video>}
                <div className="flex flex-1 flex-col p-6">
                  {t.text && <blockquote className="flex-1 text-[15px] leading-relaxed">“{t.text}”</blockquote>}
                  <figcaption className="mt-4 text-sm">
                    <span className="font-semibold">{t.clientName}</span>
                    {t.area && <span className="text-muted"> · {t.area}</span>}
                    {t.rating ? <span className="ml-2 text-accent" aria-label={`${t.rating} / 5`}>{'★'.repeat(Math.round(t.rating))}</span> : null}
                  </figcaption>
                </div>
              </figure>
            </Reveal>
          </li>
        )
      })}
    </ul>
  )
}
