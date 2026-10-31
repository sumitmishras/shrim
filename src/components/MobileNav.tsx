'use client'
import Link from 'next/link'
import { useState } from 'react'

export function MobileNav({ links, cta }: { links: { href: string; label: string }[]; cta: { href: string; label: string } }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="lg:hidden">
      <button type="button" aria-expanded={open} aria-controls="mobile-menu" aria-label="Menu" onClick={() => setOpen((o) => !o)} className="inline-flex size-11 items-center justify-center rounded-full border border-line">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          {open ? <path d="M4 4l12 12M16 4L4 16" /> : <path d="M3 6h14M3 10h14M3 14h14" />}
        </svg>
      </button>
      {open && (
        <nav id="mobile-menu" aria-label="Mobile" className="absolute inset-x-0 top-16 border-b border-line bg-bg p-4 shadow-lg">
          <ul className="flex flex-col">
            {links.map((l) => (
              <li key={l.href}><Link href={l.href} onClick={() => setOpen(false)} className="block min-h-[44px] py-3 text-lg">{l.label}</Link></li>
            ))}
          </ul>
          <Link href={cta.href} data-track="cta_click" onClick={() => setOpen(false)} className="btn btn-primary mt-3 w-full">{cta.label}</Link>
        </nav>
      )}
    </div>
  )
}
