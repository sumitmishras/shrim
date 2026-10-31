import type { Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { isPlaceholder, type SiteSettings } from '@/lib/site'
import { Counter } from './Counter'

/** Shows only stats that have real values. An empty or placeholder project count is hidden. */
export function TrustStrip({ locale, s }: { locale: Locale; s: SiteSettings }) {
  const t = getDictionary(locale).home_.trust
  const items: { value: string; label: string; sub?: string; count?: boolean }[] = []
  if (!isPlaceholder(s.stats.yearsExperience)) items.push({ value: s.stats.yearsExperience, label: t.years, count: true })
  if (!isPlaceholder(s.stats.projectCount)) items.push({ value: s.stats.projectCount, label: t.projects, count: true })
  items.push({ value: 'GST', label: t.gst, sub: t.gstSub })
  items.push({ value: 'Chinhat', label: t.area, sub: t.areaSub })
  return (
    <section aria-label="Trust" className="border-b border-line bg-surface">
      <dl className="container-x grid grid-cols-2 gap-x-6 gap-y-6 py-8 md:grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] [&>*:last-child:nth-child(odd)]:max-md:col-span-2">
        {items.map((it) => (
          <div key={it.label} className="flex flex-col">
            <dt className="order-2 mt-1 text-sm text-muted">{it.label}</dt>
            <dd className="font-display text-3xl font-bold text-ink md:text-4xl">{it.count ? <Counter value={it.value} /> : it.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
