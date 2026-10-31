import { cache } from 'react'
import { getPayloadClient } from './payload'

/** GTM container id: Admin > Tracking wins, then the NEXT_PUBLIC_GTM_ID environment variable. Empty = load nothing. */
export const getGtmId = cache(async (): Promise<string | null> => {
  let id = ''
  try {
    const t = await (await getPayloadClient()).findGlobal({ slug: 'tracking', depth: 0 })
    id = (t.gtmId || '').trim()
  } catch { /* database not reachable: fall back to env */ }
  id = id || (process.env.NEXT_PUBLIC_GTM_ID || '').trim()
  return /^GTM-[A-Z0-9]{4,}$/.test(id) ? id : null
})
