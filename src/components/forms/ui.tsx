'use client'
import Link from 'next/link'
import { useId } from 'react'
import { localePath, type Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'

export const inputCls = 'mt-1 block min-h-[48px] w-full rounded-xl border bg-bg px-4 text-base text-ink placeholder:text-muted/70'

export const errText = (locale: Locale, code?: string) => (code ? (getDictionary(locale).forms.err as Record<string, string>)[code] ?? getDictionary(locale).forms.err.invalid : undefined)

type Base = { label: string; error?: string; hint?: string }

function Shell({ id, label, error, hint, children }: Base & { id: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">{label}</label>
      {children}
      {hint && !error && <p id={`${id}-h`} className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p id={`${id}-e`} role="alert" className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  )
}
const describe = (id: string, error?: string, hint?: string) => (error ? `${id}-e` : hint ? `${id}-h` : undefined)
const border = (error?: string) => (error ? 'border-danger' : 'border-line')

export function TextField({ label, error, hint, className = '', ...p }: Base & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  return (
    <Shell id={id} label={label} error={error} hint={hint}>
      <input id={id} aria-invalid={!!error} aria-describedby={describe(id, error, hint)} className={`${inputCls} ${border(error)} ${className}`} {...p} />
    </Shell>
  )
}

export function SelectField({ label, error, hint, children, ...p }: Base & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId()
  return (
    <Shell id={id} label={label} error={error} hint={hint}>
      <select id={id} aria-invalid={!!error} aria-describedby={describe(id, error, hint)} className={`${inputCls} ${border(error)}`} {...p}>{children}</select>
    </Shell>
  )
}

export function TextAreaField({ label, error, hint, ...p }: Base & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId()
  return (
    <Shell id={id} label={label} error={error} hint={hint}>
      <textarea id={id} aria-invalid={!!error} aria-describedby={describe(id, error, hint)} className={`${inputCls} ${border(error)} min-h-[96px] py-3`} {...p} />
    </Shell>
  )
}

/** Unticked by default. The wording is versioned (CONSENT_VERSION) and stored with the lead. */
export function ConsentField({ locale, checked, onChange, error }: { locale: Locale; checked: boolean; onChange: (v: boolean) => void; error?: string }) {
  const t = getDictionary(locale).forms
  const id = useId()
  return (
    <div>
      <div className="flex items-start gap-3 py-1">
        <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-invalid={!!error} aria-describedby={error ? `${id}-e` : undefined} className="mt-1 size-6 shrink-0 accent-[var(--accent)]" />
        <label htmlFor={id} className="min-h-[44px] flex-1 py-1 text-sm leading-snug">
          {t.consentBefore}
          <Link href={localePath(locale, '/privacy-policy')} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2">{t.consentLink}</Link>
          {t.consentAfter}
        </label>
      </div>
      {error && <p id={`${id}-e`} role="alert" className="text-sm text-danger">{error}</p>}
    </div>
  )
}

/** Hidden trap for bots. Real visitors never see or fill it. */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const id = useId()
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] top-auto size-px overflow-hidden">
      <label htmlFor={id}>Leave this field empty</label>
      <input id={id} type="text" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

export function FormMessage({ text }: { text?: string }) {
  if (!text) return null
  return <p role="alert" className="rounded-xl border border-danger/50 bg-danger/10 px-4 py-3 text-sm text-danger">{text}</p>
}

type Opt = { value: string; label: string; icon?: React.ReactNode }
/** Big tap-friendly radio cards. */
export function OptionCards({ legend, options, value, onChange, error, cols = 'grid-cols-2 sm:grid-cols-3' }: { legend: string; options: Opt[]; value: string; onChange: (v: string) => void; error?: string; cols?: string }) {
  const name = useId()
  return (
    <fieldset aria-describedby={error ? `${name}-e` : undefined}>
      <legend className="mb-3 text-sm font-medium">{legend}</legend>
      <div className={`grid gap-3 ${cols}`}>
        {options.map((o) => (
          <label key={o.value} className="relative block cursor-pointer">
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="peer sr-only" />
            <span className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-2xl border border-line bg-surface p-3 text-center text-sm font-medium transition peer-checked:border-accent peer-checked:bg-accent/10 peer-checked:ring-2 peer-checked:ring-accent peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
              {o.icon}
              {o.label}
            </span>
          </label>
        ))}
      </div>
      {error && <p id={`${name}-e`} role="alert" className="mt-2 text-sm text-danger">{error}</p>}
    </fieldset>
  )
}

const ic = { width: 28, height: 28, viewBox: '0 0 32 32', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const
export function ServiceIcon({ slug }: { slug: string }) {
  switch (slug) {
    case 'house-construction': return <svg {...ic}><path d="M3 15L16 4l13 11M7 13v14h18V13M13 27v-8h6v8" /></svg>
    case 'interior': return <svg {...ic}><path d="M5 18v-5a3 3 0 013-3h16a3 3 0 013 3v5M3 18h26v6H3zM7 24v3M25 24v3" /></svg>
    case 'renovation': return <svg {...ic}><path d="M5 6h16v6H5zM21 9h4v7H14v3M14 19v8" /></svg>
    case 'fabrication': return <svg {...ic}><path d="M4 8v18M28 8v18M4 8h24M4 14h24M4 20h24M12 8v18M20 8v18" /></svg>
    case 'turnkey': return <svg {...ic}><circle cx="10" cy="13" r="5" /><path d="M14 16l13 11M22 22l3-3M25 25l3-3" /></svg>
    default: return <svg {...ic}><circle cx="16" cy="16" r="12" /><path d="M12.5 12.5a3.5 3.5 0 116 2c-1.5 1-2.5 1.700-2.500 3.500M16 22.500v.5" /></svg>
  }
}
