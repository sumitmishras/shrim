import Link from 'next/link'
import { localePath, type Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { isPlaceholder, telHref, waHref, type SiteSettings } from '@/lib/site'

const Phone = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" /></svg>)
const Chat = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z" /></svg>)
const Cal = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>)

export function StickyContactBar({ locale, s }: { locale: Locale; s: SiteSettings }) {
  const t = getDictionary(locale)
  const hasPhone = !isPlaceholder(s.phone)
  const hasWa = !isPlaceholder(s.whatsapp)
  const wa = hasWa ? waHref(s.whatsapp, 'Namaste, mujhe SHRIM Construction ke baare mein jaankari chahiye.') : null
  const item = 'flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium'
  return (
    <>
      <nav aria-label="Quick contact" className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-bg/95 backdrop-blur lg:hidden">
        {hasPhone && <a href={telHref(s.phone)} data-track="call_click" className={item}><Phone />{t.call}</a>}
        {wa && <a href={wa} data-track="whatsapp_click" target="_blank" rel="noopener noreferrer" className={item}><Chat />{t.whatsapp}</a>}
        <Link href={localePath(locale, '/site-visit')} data-track="cta_click" className={`${item} bg-accent text-accent-ink`}><Cal />{t.bookVisitShort}</Link>
      </nav>
      {wa && (
        <a href={wa} data-track="whatsapp_click" target="_blank" rel="noopener noreferrer" aria-label={t.whatsapp} className="fixed bottom-6 right-6 z-40 hidden size-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg transition-transform hover:scale-105 lg:flex">
          <Chat />
        </a>
      )}
    </>
  )
}
