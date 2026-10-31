'use client'
import Image from 'next/image'
import { useState } from 'react'
import type { Img } from '@/lib/media'

type Labels = { open: string; close: string; prev: string; next: string }

/** Photo grid; clicking opens a full-screen viewer (native <dialog>: Esc closes, focus is trapped). */
export function Lightbox({ images, labels }: { images: Img[]; labels: Labels }) {
  const [i, setI] = useState<number | null>(null)
  const go = (d: number) => setI((c) => (c === null ? c : (c + d + images.length) % images.length))
  const btn = 'absolute flex size-12 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25'

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {images.map((im, n) => (
          <li key={im.src + n}>
            <button type="button" onClick={() => setI(n)} aria-label={`${labels.open} ${n + 1}`} className="relative block aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line">
              <Image src={im.src} alt={im.alt} fill sizes="(min-width: 768px) 33vw, 50vw" className="object-cover transition-transform duration-500 hover:scale-105" />
            </button>
          </li>
        ))}
      </ul>
      {i !== null && (
        <dialog
          ref={(el) => { if (el && !el.open) el.showModal() }}
          onClose={() => setI(null)}
          onClick={(e) => { if (e.target === e.currentTarget) setI(null) }}
          onKeyDown={(e) => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1) }}
          className="m-0 h-dvh max-h-none w-screen max-w-none bg-black/90 p-0 backdrop:bg-black/90"
        >
          <div className="relative size-full p-4 md:p-12">
            <Image src={images[i].src} alt={images[i].alt} fill sizes="100vw" className="object-contain" priority />
          </div>
          <button type="button" onClick={() => setI(null)} aria-label={labels.close} className={`${btn} right-4 top-4`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M4 4l12 12M16 4L4 16" /></svg>
          </button>
          {images.length > 1 && (
            <>
              <button type="button" onClick={() => go(-1)} aria-label={labels.prev} className={`${btn} left-3 top-1/2 -translate-y-1/2`}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M12 4l-6 6 6 6" /></svg>
              </button>
              <button type="button" onClick={() => go(1)} aria-label={labels.next} className={`${btn} right-3 top-1/2 -translate-y-1/2`}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M8 4l6 6-6 6" /></svg>
              </button>
            </>
          )}
        </dialog>
      )}
    </>
  )
}
