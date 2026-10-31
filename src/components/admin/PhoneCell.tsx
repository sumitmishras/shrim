'use client'
import type { DefaultCellComponentProps } from 'payload'

/** Phone column in the leads list: tap to call. */
export default function PhoneCell({ cellData }: DefaultCellComponentProps) {
  const p = String(cellData ?? '')
  if (!p) return null
  return <a href={`tel:+91${p}`} className="shrim-tel">{p}</a>
}
