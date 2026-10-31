import type { Endpoint, Where } from 'payload'
import { LEAD_COLUMNS, leadRow, toCsv } from '../lib/crm/csv'
import { sendDigest } from '../lib/digest'

const forbidden = () => Response.json({ error: 'Only the admin can do this.' }, { status: 403 })

/** GET /api/leads/export?where[...]  Admin only. Honours the same filters as the list screen. */
export const exportLeads: Endpoint = {
  path: '/export',
  method: 'get',
  handler: async (req) => {
    if (req.user?.role !== 'admin') return forbidden()
    const where = (req.query?.where as Where | undefined) ?? undefined
    const res = await req.payload.find({ collection: 'leads', where, sort: '-createdAt', limit: 0, pagination: false, depth: 1, overrideAccess: true })
    const csv = toCsv([LEAD_COLUMNS, ...res.docs.map(leadRow)])
    const day = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
    return new Response(csv, { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="shrim-leads-${day}.csv"`, 'cache-control': 'no-store' } })
  },
}

/** POST /api/leads/digest  Admin only. Sends today's digest to Telegram right now (for testing). */
export const sendDigestNow: Endpoint = {
  path: '/digest',
  method: 'post',
  handler: async (req) => {
    if (req.user?.role !== 'admin') return forbidden()
    return Response.json({ result: await sendDigest(req.payload) })
  },
}
