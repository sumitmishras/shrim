import type { Payload } from 'payload'
import { addDaysIST, daysBetween, istDate, istDayStart, todayIST } from './dates'

export const STATUSES = ['new', 'contacted', 'qualified', 'site-visit', 'quotation-sent', 'negotiation', 'won', 'lost'] as const
export const STATUS_LABEL: Record<string, string> = {
  new: 'New', contacted: 'Contacted', qualified: 'Qualified', 'site-visit': 'Site Visit', 'quotation-sent': 'Quotation Sent', negotiation: 'Negotiation', won: 'Won', lost: 'Lost',
}
export const CHANNELS = ['google-ads', 'meta-ads', 'organic', 'gbp', 'direct', 'whatsapp', 'other'] as const
export const CHANNEL_LABEL: Record<string, string> = { 'google-ads': 'Google Ads', 'meta-ads': 'Meta Ads', organic: 'Organic', gbp: 'Google Business', direct: 'Direct', whatsapp: 'WhatsApp', other: 'Other' }

export type LeadRow = { id: number | string; reference?: string | null; name: string; phone: string; status: string; scoreBand?: string | null; service?: string | null; nextFollowUp?: string | null; createdAt: string }

const OPEN = { status: { not_in: ['won', 'lost'] } }
const SELECT = { reference: true, name: true, phone: true, status: true, scoreBand: true, service: true, nextFollowUp: true, createdAt: true } as const

/** Follow-up lists: due today, overdue (with days late). Pure so it can be unit-tested. */
export function splitFollowUps(rows: LeadRow[], today: string) {
  const dueToday: LeadRow[] = []
  const overdue: (LeadRow & { daysLate: number })[] = []
  for (const r of rows) {
    if (!r.nextFollowUp) continue
    const d = istDate(r.nextFollowUp)
    if (d === today) dueToday.push(r)
    else if (d < today) overdue.push({ ...r, daysLate: daysBetween(d, today) })
  }
  overdue.sort((a, b) => b.daysLate - a.daysLate)
  return { dueToday, overdue }
}

export async function getFollowUps(payload: Payload, today = todayIST()) {
  const res = await payload.find({
    collection: 'leads', where: { and: [OPEN, { nextFollowUp: { exists: true } }] }, sort: 'nextFollowUp', limit: 500, pagination: false, depth: 0, select: SELECT,
  })
  return splitFollowUps(res.docs as unknown as LeadRow[], today)
}

export async function getNewLeadsOn(payload: Payload, ymd: string) {
  const res = await payload.find({
    collection: 'leads', limit: 200, pagination: false, depth: 0, sort: '-createdAt', select: SELECT,
    where: { and: [{ createdAt: { greater_than_equal: istDayStart(ymd).toISOString() } }, { createdAt: { less_than: istDayStart(addDaysIST(ymd, 1)).toISOString() } }] },
  })
  return res.docs as unknown as LeadRow[]
}

export async function getDashboardStats(payload: Payload) {
  const today = todayIST()
  const since = istDayStart(addDaysIST(today, -89)).toISOString()

  const [followUps, newToday, waiting, recent, counts, wonRes] = await Promise.all([
    getFollowUps(payload, today),
    getNewLeadsOn(payload, today),
    payload.find({ collection: 'leads', where: { status: { equals: 'new' } }, sort: '-createdAt', limit: 10, depth: 0, select: SELECT }),
    payload.find({ collection: 'leads', where: { createdAt: { greater_than_equal: since } }, limit: 0, pagination: false, depth: 0, select: { createdAt: true, attribution: { channel: true } } }),
    Promise.all(STATUSES.map((s) => payload.count({ collection: 'leads', where: { status: { equals: s } } }))),
    payload.find({ collection: 'leads', where: { status: { equals: 'won' } }, limit: 0, pagination: false, depth: 0, select: { wonAmount: true, wonDate: true, statusHistory: true } }),
  ])

  const pipeline = STATUSES.map((s, i) => ({ status: s, count: counts[i].totalDocs }))

  const bySource: Record<string, Record<7 | 30 | 90, number>> = {}
  for (const c of CHANNELS) bySource[c] = { 7: 0, 30: 0, 90: 0 }
  for (const l of recent.docs as unknown as { createdAt: string; attribution?: { channel?: string | null } }[]) {
    const ch = (CHANNELS as readonly string[]).includes(l.attribution?.channel ?? '') ? l.attribution!.channel! : 'other'
    const age = daysBetween(istDate(l.createdAt), today)
    for (const w of [7, 30, 90] as const) if (age < w) bySource[ch][w]++
  }

  const month = today.slice(0, 7)
  let wonValue = 0, wonCount = 0
  for (const l of wonRes.docs as unknown as { wonAmount?: number | null; wonDate?: string | null; statusHistory?: { to?: string; at?: string }[] }[]) {
    const wonAt = l.wonDate ?? [...(l.statusHistory ?? [])].reverse().find((h) => h.to === 'won')?.at
    if (wonAt && istDate(wonAt).startsWith(month)) { wonCount++; wonValue += l.wonAmount ?? 0 }
  }

  return {
    today, newToday, dueToday: followUps.dueToday, overdue: followUps.overdue, waiting: waiting.docs as unknown as LeadRow[],
    pipeline, bySource, wonValue, wonCount,
  }
}
