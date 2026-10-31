export const locales = ['en', 'hi'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'
export const isLocale = (v: string): v is Locale => (locales as readonly string[]).includes(v)

/** Build a locale-aware path. English lives at `/`, Hindi at `/hi`. */
export const localePath = (locale: Locale, path = '/') => {
  const p = path.startsWith('/') ? path : `/${path}`
  if (locale === defaultLocale) return p
  return p === '/' ? '/hi' : `/hi${p}`
}
