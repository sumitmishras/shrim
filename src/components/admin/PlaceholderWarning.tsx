import type { ServerProps } from 'payload'

const PATTERN = /PLACEHOLDER|\[SAMPLE|\[PROJECT COUNT\]|UPDATE BEFORE LAUNCH/

/** Dashboard banner: lists published content that still holds placeholder text. Admin only. */
export default async function PlaceholderWarning({ payload, user }: ServerProps) {
  if (user?.role !== 'admin') return null
  const hits: string[] = []
  const check = (label: string, doc: unknown) => PATTERN.test(JSON.stringify(doc)) && hits.push(label)

  for (const slug of ['services', 'projects', 'testimonials', 'guides', 'faqs', 'pages'] as const) {
    const res = await payload.find({
      collection: slug, limit: 500, depth: 0, locale: 'all', pagination: false,
      where: slug === 'services' || slug === 'faqs' || slug === 'pages' ? undefined : { status: { equals: 'published' } },
    })
    for (const d of res.docs) check(`${slug}: ${(d as { title?: unknown; question?: unknown }).title ?? (d as { question?: unknown }).question ? 'entry #' + d.id : d.id}`, d)
  }
  for (const slug of ['siteSettings', 'rates', 'aboutPage'] as const) {
    check(`Globals → ${slug}`, await payload.findGlobal({ slug, depth: 0, locale: 'all' }))
  }
  if (hits.length === 0) return null

  const unique = [...new Set(hits)]
  return (
    <div role="alert" style={{ border: '1px solid #c8792b', background: 'rgba(200,121,43,.12)', borderRadius: 8, padding: '14px 18px', marginBottom: 24 }}>
      <strong>⚠ Not ready to launch – placeholder content found</strong>
      <p style={{ margin: '6px 0' }}>These still contain PLACEHOLDER, [SAMPLE or UPDATE BEFORE LAUNCH text:</p>
      <ul style={{ margin: 0, paddingLeft: 20 }}>{unique.slice(0, 15).map((h) => <li key={h}>{h}</li>)}</ul>
      {unique.length > 15 && <p>…and {unique.length - 15} more.</p>}
    </div>
  )
}
