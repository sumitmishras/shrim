import type { Media } from '@/payload-types'

export type Img = { src: string; alt: string; width?: number; height?: number }

const isMedia = (m: unknown): m is Media => typeof m === 'object' && m !== null && 'filename' in m

/**
 * Local-disk media is served by Payload at /api/media/file/<name>.
 * We build the URL from the filename so cache-busting query strings never reach next/image.
 */
export function img(m: unknown, size?: 'card' | 'hero'): Img | null {
  if (!isMedia(m) || !m.filename) return null
  const sized = size ? m.sizes?.[size] : undefined
  const file = sized?.filename ?? m.filename
  return { src: `/api/media/file/${encodeURIComponent(file)}`, alt: m.alt || '', width: (sized?.width ?? m.width) || undefined, height: (sized?.height ?? m.height) || undefined }
}

export function file(m: unknown): { src: string; mime: string } | null {
  if (!isMedia(m) || !m.filename) return null
  return { src: `/api/media/file/${encodeURIComponent(m.filename)}`, mime: m.mimeType || '' }
}

export const rows = <T extends { image?: unknown }>(arr?: T[] | null) =>
  (arr ?? []).map((r) => img(r.image)).filter((x): x is Img => !!x)

export function youtubeId(url?: string | null) {
  if (!url) return null
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/)
  return m ? m[1] : null
}
