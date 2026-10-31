import Image from 'next/image'
import type { Img } from '@/lib/media'

/** Neutral blueprint-style stand-in for missing photos. The label only shows in development. */
export function Placeholder({ className = '', label = 'Photo placeholder – replace in admin' }: { className?: string; label?: string }) {
  return (
    <div aria-hidden className={`placeholder-art absolute inset-0 flex items-end justify-start p-3 ${className}`}>
      <svg className="absolute left-1/2 top-1/2 w-1/4 min-w-12 max-w-24 -translate-x-1/2 -translate-y-1/2 text-muted/40" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 30L32 8l26 22M12 28v28h40V28M26 56V38h12v18" /></svg>
      {process.env.NODE_ENV !== 'production' && <span className="relative rounded bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white">{label}</span>}
    </div>
  )
}

/** Fills its (relative, aspect-ratio'd) parent. */
export function Photo({ image, sizes, className = '', priority = false }: { image?: Img | null; sizes: string; className?: string; priority?: boolean }) {
  if (!image) return <Placeholder />
  return <Image src={image.src} alt={image.alt} fill sizes={sizes} priority={priority} className={`object-cover ${className}`} />
}
