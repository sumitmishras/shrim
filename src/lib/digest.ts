import type { Payload } from 'payload'
import { L } from './leads/labels'
import { addDaysIST, istParts, todayIST } from './crm/dates'
import { getFollowUps, getNewLeadsOn, STATUS_LABEL, type LeadRow } from './crm/stats'
import { SITE_URL } from './site'
import { sendTelegram, telegramConfigured } from './telegram'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const MAX = 10

const line = (l: LeadRow, extra?: string) =>
  `• ${esc(l.name)} – +91 ${esc(l.phone)} · ${esc(L.service[l.service ?? ''] ?? '–')}${extra ? ` · ${extra}` : ''} · ${esc(l.reference ?? '')}`

function block(title: string, rows: string[]) {
  if (!rows.length) return null
  const shown = rows.slice(0, MAX)
  return [`<b>${title} (${rows.length})</b>`, ...shown, rows.length > MAX ? `…and ${rows.length - MAX} more` : null].filter(Boolean).join('\n')
}

/** Text of today's digest, or null when there is nothing to report. */
export async function buildDigest(payload: Payload): Promise<string | null> {
  const today = todayIST()
  const [{ dueToday, overdue }, yesterday] = await Promise.all([getFollowUps(payload, today), getNewLeadsOn(payload, addDaysIST(today, -1))])
  const parts = [
    block('📞 Follow-ups today', dueToday.map((l) => line(l, STATUS_LABEL[l.status]))),
    block('🔴 Overdue follow-ups', overdue.map((l) => line(l, `${l.daysLate} day${l.daysLate > 1 ? 's' : ''} late`))),
    block('🆕 New leads yesterday', yesterday.map((l) => line(l, L.band[l.scoreBand ?? ''] ?? undefined))),
  ].filter(Boolean)
  if (!parts.length) return null
  const date = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short' })
  return [`☀️ <b>SHRIM daily digest</b> – ${date}`, ...parts, `👉 ${SITE_URL}/admin/collections/leads`].join('\n\n')
}

export async function sendDigest(payload: Payload): Promise<'sent' | 'nothing-to-report' | 'not-configured' | 'failed'> {
  if (!telegramConfigured()) return 'not-configured'
  const text = await buildDigest(payload)
  if (!text) return 'nothing-to-report'
  return sendTelegram(text) as Promise<'sent' | 'failed'>
}

/** The digest goes out once a day between 9:00 and 11:59 IST (a late start still sends it). */
export function shouldSendDigest(now: Date, lastSent: string | null) {
  const { hour } = istParts(now)
  return hour >= 9 && hour < 12 && lastSent !== todayIST()
}
