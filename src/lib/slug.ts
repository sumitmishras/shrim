import type { FieldHook } from 'payload'

export const slugify = (s: string) =>
  s.toLowerCase().replace(/\[.*?\]/g, '').normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

/** Fills slug from title when left empty. Slugs are not localized. */
export const slugFromTitle: FieldHook = ({ value, data, originalDoc }) => {
  if (value) return slugify(String(value))
  const title = data?.title ?? originalDoc?.title
  return title ? slugify(String(title)) : value
}
