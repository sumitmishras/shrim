type Attr = { utm_source?: string | null; utm_medium?: string | null; gclid?: string | null; fbclid?: string | null; referrer?: string | null }

/** Marketing channel for the "leads by source" report. */
export function deriveChannel(a: Attr): 'google-ads' | 'meta-ads' | 'organic' | 'gbp' | 'direct' | 'whatsapp' | 'other' {
  const src = (a.utm_source ?? '').toLowerCase()
  const med = (a.utm_medium ?? '').toLowerCase()
  const ref = (a.referrer ?? '').toLowerCase()
  if (a.gclid || (src === 'google' && /cpc|ppc|paid/.test(med))) return 'google-ads'
  if (a.fbclid || /facebook|instagram|meta|fb|ig/.test(src) && /cpc|ppc|paid|social/.test(med)) return 'meta-ads'
  if (/gbp|business|maps|gmb/.test(src) || /gbp|business-profile/.test(med)) return 'gbp'
  if (/whatsapp|wa\.me/.test(src) || /wa\.me|whatsapp/.test(ref)) return 'whatsapp'
  if (!src && !med) {
    if (!ref) return 'direct'
    if (/google\.|bing\.|duckduckgo\.|yahoo\.|ecosia\./.test(ref)) return 'organic'
  }
  if (/organic|seo/.test(med) || (src === 'google' && !med)) return 'organic'
  return 'other'
}
