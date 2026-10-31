import Link from 'next/link'
import { localePath, type Locale } from '@/i18n/config'

export function Logo({ locale, tagline, compact = false }: { locale: Locale; tagline: string; compact?: boolean }) {
  return (
    <Link href={localePath(locale)} className="inline-flex min-h-[44px] shrink-0 flex-col justify-center whitespace-nowrap leading-none">
      <span className="font-display text-2xl font-bold tracking-[0.35em] text-ink">SHRIM<span className="sr-only"> – home</span></span>
      <span className={`mt-1 text-[10px]${compact ? ' hidden sm:block' : ''} uppercase tracking-[0.18em] text-muted`}>{tagline}</span>
    </Link>
  )
}
