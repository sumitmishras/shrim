import type { Locale } from '@/i18n/config'
import type { SiteSettings } from '@/lib/site'
import { ShortLeadForm } from './forms/ShortLeadForm'
import { ContactButtons } from './ContactButtons'

export type CtaForm = { source: 'home' | 'service-page' | 'contact'; detail?: string; service?: string }

/** Call-to-action block. With `form`, the short lead form is shown; otherwise call / WhatsApp / book buttons. */
export function LeadCta({ locale, s, title, sub, context, variant = 'band', form }: { locale: Locale; s: SiteSettings; title: string; sub?: string; context?: string; variant?: 'band' | 'card'; form?: CtaForm }) {
  const lead = form && <ShortLeadForm locale={locale} source={form.source} sourceDetail={form.detail} defaultService={form.service} />
  if (variant === 'card') {
    return (
      <div className="card p-6 shadow-sm">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        {sub && <p className="mt-2 text-sm text-muted">{sub}</p>}
        {lead ? <div className="mt-5">{lead}</div> : <ContactButtons locale={locale} s={s} context={context} className="mt-5 [&>*]:w-full" />}
      </div>
    )
  }
  return (
    <section className="py-14 md:py-20">
      <div className="container-x">
        <div className={`rounded-[2rem] bg-[#1c1a17] p-8 text-[#f1ece4] md:p-14 ${lead ? 'grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center' : ''}`}>
          <div>
            <h2 className="max-w-2xl font-display text-3xl font-bold leading-tight md:text-4xl">{title}</h2>
            {sub && <p className="mt-3 max-w-xl text-[#c9c1b5]">{sub}</p>}
            <ContactButtons locale={locale} s={s} context={context} book={!lead} className="mt-7 [&_.btn-ghost]:border-[#4a443b] [&_.btn-ghost]:text-[#f1ece4]" />
          </div>
          {lead && <div className="card p-6 text-ink shadow-xl md:p-8">{lead}</div>}
        </div>
      </div>
    </section>
  )
}
