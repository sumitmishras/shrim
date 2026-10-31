'use client'
import Image from 'next/image'
import { useState } from 'react'
import type { Img } from '@/lib/media'

/** Draggable before/after comparison. Built on a native range input, so it works with touch, mouse and keyboard. */
export function BeforeAfter({ before, after, beforeLabel, afterLabel, sizes = '(min-width: 768px) 50vw, 100vw', priority = false }: { before: Img; after: Img; beforeLabel: string; afterLabel: string; sizes?: string; priority?: boolean }) {
  const [pos, setPos] = useState(50)
  return (
    <div className="relative aspect-[4/3] select-none overflow-hidden rounded-3xl border border-line bg-line focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent">
      <Image src={after.src} alt={after.alt} fill sizes={sizes} priority={priority} className="object-cover" draggable={false} />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Image src={before.src} alt={before.alt} fill sizes={sizes} priority={priority} className="object-cover" draggable={false} />
      </div>
      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">{beforeLabel}</span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">{afterLabel}</span>
      <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow" style={{ left: `${pos}%` }}>
        <span className="absolute left-1/2 top-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-lg">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M7 5l-5 5 5 5M13 5l5 5-5 5" /></svg>
        </span>
      </div>
      <input
        type="range" min={0} max={100} value={pos} onChange={(e) => setPos(Number(e.target.value))}
        aria-label={`${beforeLabel} / ${afterLabel}`}
        className="absolute inset-0 size-full cursor-ew-resize opacity-0 [touch-action:pan-y]"
      />
    </div>
  )
}
