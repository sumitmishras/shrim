'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Locale } from '@/i18n/config'

export function LangSwitch({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname() || '/'
  const bare = pathname.replace(/^\/hi(?=\/|$)/, '') || '/'
  const href = locale === 'en' ? (bare === '/' ? '/hi' : `/hi${bare}`) : bare
  return (
    <Link href={href} hrefLang={locale === 'en' ? 'hi' : 'en'} className="inline-flex min-h-[44px] items-center px-2 text-sm font-medium text-muted hover:text-ink">
      {label}
    </Link>
  )
}
