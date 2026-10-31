'use client'
import { useAuth, useListQuery } from '@payloadcms/ui'
import type { Where } from 'payload'

type Chip = { key: string; label: string; field: string; op: string; options: [string, string][] }

const istToday = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
const dayStartISO = (back: number) => {
  const d = new Date(`${istToday()}T00:00:00+05:30`)
  return new Date(d.getTime() - back * 86_400_000).toISOString()
}

const CHIPS: Chip[] = [
  { key: 'status', label: 'Status', field: 'status', op: 'equals', options: [['new', 'New'], ['contacted', 'Contacted'], ['qualified', 'Qualified'], ['site-visit', 'Site Visit'], ['quotation-sent', 'Quotation Sent'], ['negotiation', 'Negotiation'], ['won', 'Won'], ['lost', 'Lost']] },
  { key: 'band', label: 'Score', field: 'scoreBand', op: 'equals', options: [['hot', '🔥 Hot'], ['warm', '🌤 Warm'], ['cold', '❄️ Cold']] },
  { key: 'source', label: 'Source', field: 'attribution.channel', op: 'equals', options: [['google-ads', 'Google Ads'], ['meta-ads', 'Meta Ads'], ['organic', 'Organic'], ['gbp', 'Google Business'], ['direct', 'Direct'], ['whatsapp', 'WhatsApp'], ['other', 'Other']] },
  { key: 'service', label: 'Service', field: 'service', op: 'equals', options: [['house-construction', 'House construction'], ['interior', 'Interior'], ['renovation', 'Renovation'], ['fabrication', 'Fabrication'], ['turnkey', 'Turnkey'], ['commercial', 'Commercial'], ['not-sure', 'Not sure']] },
]
const DATES: [string, string, number][] = [['today', 'Today', 0], ['7d', 'Last 7 days', 6], ['30d', 'Last 30 days', 29], ['90d', 'Last 90 days', 89]]

type Cond = Record<string, Record<string, string>>
/** Flattens Payload's where object ({and:[...]} or one {or:[{and:[...]}]} group) into simple field/op/value rows. */
function flatten(w: unknown): Record<string, string> {
  const out: Record<string, string> = {}
  const walk = (n: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!n || typeof n !== 'object') return
    if (Array.isArray(n.and)) n.and.forEach(walk)
    else if (Array.isArray(n.or) && n.or.length === 1) walk(n.or[0])
    else for (const [f, ops] of Object.entries(n)) if (ops && typeof ops === 'object') for (const [op, v] of Object.entries(ops as object)) out[`${f}|${op}`] = String(v)
  }
  walk(w)
  return out
}
const toWhere = (m: Record<string, string>): Where => {
  const and = Object.entries(m).map(([k, v]) => { const [f, o] = k.split('|'); return { [f]: { [o]: v } } as Cond })
  return and.length ? ({ and } as Where) : {}
}

/** Filter bar + CSV export above the leads list. Uses Payload's own list query, so paging, sorting and filters stay in sync. */
export default function LeadsListTools() {
  const { user } = useAuth()
  const { query, refineListData } = useListQuery()
  const where = flatten(query?.where)

  const apply = (m: Record<string, string>) => refineListData({ where: toWhere(m), page: 1 })
  const set = (k: string, v: string) => { const n = { ...where }; if (v) n[k] = v; else delete n[k]; apply(n) }
  const dateVal = (() => {
    const cur = where['createdAt|greater_than_equal']
    return cur ? DATES.find(([, , back]) => dayStartISO(back) === cur)?.[0] ?? 'custom' : ''
  })()

  const exportQs = new URLSearchParams()
  Object.entries(where).forEach(([k, v], i) => { const [f, o] = k.split('|'); exportQs.set(`where[and][${i}][${f}][${o}]`, v) })
  const active = Object.keys(where).length > 0

  return (
    <div className="shrim-filters">
      {CHIPS.map((c) => (
        <label key={c.key}>
          <span>{c.label}</span>
          <select value={where[`${c.field}|${c.op}`] ?? ''} onChange={(e) => set(`${c.field}|${c.op}`, e.target.value)}>
            <option value="">All</option>
            {c.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
      ))}
      <label>
        <span>Date</span>
        <select value={dateVal} onChange={(e) => { const d = DATES.find(([k]) => k === e.target.value); set('createdAt|greater_than_equal', d ? dayStartISO(d[2]) : '') }}>
          <option value="">All time</option>
          {DATES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          {dateVal === 'custom' && <option value="custom">Custom</option>}
        </select>
      </label>
      <div className="shrim-filter-actions">
        {active && <button type="button" onClick={() => apply({})}>Clear filters</button>}
        {user?.role === 'admin' && <a href={`/api/leads/export${exportQs.toString() ? `?${exportQs}` : ''}`} download>⬇ Export CSV</a>}
      </div>
    </div>
  )
}
