import { SITE_URL } from './site'
import { L } from './leads/labels'

type LeadLike = {
  id: number | string; reference?: string | null; name: string; phone: string; service?: string | null; locality?: string | null
  areaSize?: string | null; floors?: string | null; budgetBand?: string | null; timeline?: string | null; source?: string | null
  score?: number | null; scoreBand?: string | null; attribution?: { channel?: string | null } | null
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function leadAlertText(l: LeadLike) {
  const lines = [
    `🔔 <b>New lead ${esc(l.reference ?? '')}</b>  ${L.band[l.scoreBand ?? ''] ?? ''} (${l.score ?? '–'})`,
    `👤 ${esc(l.name)}`,
    `📞 +91 ${esc(l.phone)}`,
    l.service && `🛠 ${esc(L.service[l.service] ?? l.service)}`,
    [l.locality, l.areaSize, l.floors && `${l.floors} floor(s)`].filter(Boolean).length && `📍 ${esc([l.locality, l.areaSize, l.floors && `${l.floors} floor(s)`].filter(Boolean).join(' · '))}`,
    (l.budgetBand || l.timeline) && `💰 ${esc(L.budget[l.budgetBand ?? ''] ?? '–')} · ⏱ ${esc(L.timeline[l.timeline ?? ''] ?? '–')}`,
    `🔗 ${esc(L.source[l.source ?? ''] ?? l.source ?? '–')}${l.attribution?.channel ? ` · ${esc(l.attribution.channel)}` : ''}`,
    `👉 ${SITE_URL}/admin/collections/leads/${l.id}`,
  ]
  return lines.filter(Boolean).join('\n')
}

/**
 * Sends the owner alert. Never throws: with no token/chat id it logs the alert to the console,
 * and any failure is logged, so a Telegram problem can never lose or block a lead.
 */
export async function sendLeadAlert(lead: LeadLike) {
  const text = leadAlertText(lead)
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chat = process.env.TELEGRAM_CHAT_ID
  if (!token || !chat) {
    console.log(`[telegram] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set. Alert would have been:\n${text}`)
    return
  }
  try {
    const base = process.env.TELEGRAM_API_BASE || 'https://api.telegram.org'
    const res = await fetch(`${base}/bot${token}/sendMessage`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text, parse_mode: 'HTML', disable_web_page_preview: true }),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) console.error(`[telegram] send failed: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`)
  } catch (e) {
    console.error('[telegram] send failed:', e instanceof Error ? e.message : e)
  }
}
