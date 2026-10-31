import Link from 'next/link'
import { localePath, type Locale } from '@/i18n/config'

export function Logo({ locale, tagline, compact = false }: { locale: Locale; tagline: string; compact?: boolean }) {
  return (
    <Link href={localePath(locale)} aria-label="SHRIM – home" className="inline-flex min-h-[44px] flex-col justify-center leading-none">
      <span className="font-display text-2xl font-bold tracking-[0.35em] text-ink">SHRIM</span>
      <span className={`mt-1 text-[10px]${compact ? ' hidden sm:block' : ''} uppercase tracking-[0.18em] text-muted`}>{tagline}</span>
    </Link>
  )
}
