import Link from 'next/link'
import { localePath, type Locale } from '@/i18n/config'
import { getDictionary, serviceNameEn, serviceSlugs } from '@/i18n/dictionary'
import { isPlaceholder, telHref, waHref, type SiteSettings } from '@/lib/site'

/** Primary + call + WhatsApp. Call/WhatsApp only render when real numbers are set in Site Settings. */
export function ContactButtons({ locale, s, context, book = true, className = '' }: { locale: Locale; s: SiteSettings; context?: string; book?: boolean; className?: string }) {
  const t = getDictionary(locale)
  const ctx = context ? (serviceNameEn[context] ?? context) : 'SHRIM Construction'
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {book && <Link href={localePath(locale, (serviceSlugs as readonly string[]).includes(context ?? '') ? `/site-visit?service=${context}` : '/site-visit')} data-track="cta_click" className="btn btn-primary">{t.bookVisit}</Link>}
      {!isPlaceholder(s.phone) && <a href={telHref(s.phone)} data-track="call_click" className="btn btn-ghost">{t.call}: {s.phone}</a>}
      {!isPlaceholder(s.whatsapp) && (
        <a href={waHref(s.whatsapp, t.waMessage(ctx))} data-track="whatsapp_click" target="_blank" rel="noopener noreferrer" className="btn btn-ghost">{t.whatsapp}</a>
      )}
    </div>
  )
}
