/** Free Google Maps embed (no API key). Loads lazily, only on pages that include it. */
export function MapEmbed({ title }: { title: string }) {
  const q = encodeURIComponent('Amity University Lucknow, Mallhaur Road, Chinhat, Lucknow')
  return (
    <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-line bg-line">
      <iframe title={title} src={`https://www.google.com/maps?q=${q}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="size-full" />
    </div>
  )
}
