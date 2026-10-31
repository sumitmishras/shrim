import type { Locale } from '@/i18n/config'
import type { SiteSettings } from '@/lib/site'
import { ContactButtons } from './ContactButtons'

/**
 * Call-to-action block. In milestone 4 the short lead form replaces the buttons here
 * (the `variant="band"` and `"card"` slots are already placed on the pages).
 */
export function LeadCta({ locale, s, title, sub, context, variant = 'band' }: { locale: Locale; s: SiteSettings; title: string; sub?: string; context?: string; variant?: 'band' | 'card' }) {
  if (variant === 'card') {
    return (
      <div className="card p-6 shadow-sm">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        {sub && <p className="mt-2 text-sm text-muted">{sub}</p>}
        <ContactButtons locale={locale} s={s} context={context} className="mt-5 [&>*]:w-full" />
      </div>
    )
  }
  return (
    <section className="py-14 md:py-20">
      <div className="container-x">
        <div className="rounded-[2rem] bg-[#1c1a17] p-8 text-[#f1ece4] md:p-14">
          <h2 className="max-w-2xl font-display text-3xl font-bold leading-tight md:text-4xl">{title}</h2>
          {sub && <p className="mt-3 max-w-xl text-[#c9c1b5]">{sub}</p>}
          <ContactButtons locale={locale} s={s} context={context} className="mt-7 [&_.btn-ghost]:border-[#4a443b] [&_.btn-ghost]:text-[#f1ece4]" />
        </div>
      </div>
    </section>
  )
}
