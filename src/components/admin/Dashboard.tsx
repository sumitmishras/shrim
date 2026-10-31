import Link from 'next/link'
import type { ServerProps } from 'payload'
import { CHANNELS, CHANNEL_LABEL, getDashboardStats, STATUS_LABEL, type LeadRow } from '@/lib/crm/stats'
import { istDayStart } from '@/lib/crm/dates'
import { L } from '@/lib/leads/labels'
import { formatMoney } from '@/lib/leads/estimate'
import PlaceholderWarning from './PlaceholderWarning'
import SendDigestButton from './SendDigestButton'

const LEADS = '/admin/collections/leads'
const where = (field: string, op: string, v: string) => `${LEADS}?${new URLSearchParams({ [`where[and][0][${field}][${op}]`]: v })}`

function Row({ l, note, tone }: { l: LeadRow; note?: string; tone?: 'danger' }) {
  return (
    <li className={`shrim-row${tone === 'danger' ? ' is-overdue' : ''}`}>
      <Link href={`${LEADS}/${l.id}`} className="shrim-row-main">
        <strong>{l.name}</strong>
        <span>{[l.reference, L.service[l.service ?? ''], STATUS_LABEL[l.status]].filter(Boolean).join(' · ')}</span>
      </Link>
      <span className="shrim-row-side">
        {note && <em>{note}</em>}
        {l.scoreBand && <span className={`shrim-band band-${l.scoreBand}`}>{l.scoreBand}</span>}
        <a href={`tel:+91${l.phone}`} className="shrim-tel" aria-label={`Call ${l.name}`}>📞 {l.phone}</a>
      </span>
    </li>
  )
}

function List({ title, rows, empty, children }: { title: string; rows: number; empty: string; children: React.ReactNode }) {
  return (
    <section className="shrim-card">
      <h2>{title} <span className="shrim-count">{rows}</span></h2>
      {rows ? <ul className="shrim-list">{children}</ul> : <p className="shrim-empty">{empty}</p>}
    </section>
  )
}

/** Custom admin home: what needs attention today, the pipeline, and where leads come from. */
export default async function Dashboard({ payload, user }: ServerProps) {
  const s = await getDashboardStats(payload)
  const isAdmin = user?.role === 'admin'
  const maxStage = Math.max(1, ...s.pipeline.map((p) => p.count))
  const todayIso = istDayStart(s.today).toISOString()

  return (
    <div className="shrim-dash gutter--left gutter--right">
      <h1>Today <small>{new Date(`${s.today}T12:00:00+05:30`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</small></h1>
      <PlaceholderWarning payload={payload} user={user} />

      <div className="shrim-kpis">
        <Link href={where('createdAt', 'greater_than_equal', todayIso)} className="shrim-kpi"><b>{s.newToday.length}</b><span>New leads today</span></Link>
        <a href="#followups" className="shrim-kpi"><b>{s.dueToday.length}</b><span>Follow-ups today</span></a>
        <a href="#followups" className={`shrim-kpi${s.overdue.length ? ' is-overdue' : ''}`}><b>{s.overdue.length}</b><span>Overdue follow-ups</span></a>
        <Link href={where('status', 'equals', 'won')} className="shrim-kpi"><b>{s.wonValue ? formatMoney(s.wonValue, 'en') : '₹0'}</b><span>Won this month ({s.wonCount})</span></Link>
      </div>

      <div className="shrim-grid" id="followups">
        <List title="Overdue follow-ups" rows={s.overdue.length} empty="Nothing overdue. 👍">
          {s.overdue.map((l) => <Row key={l.id} l={l} tone="danger" note={`${l.daysLate} day${l.daysLate > 1 ? 's' : ''} late`} />)}
        </List>
        <List title="Follow-ups today" rows={s.dueToday.length} empty="No follow-ups due today.">
          {s.dueToday.map((l) => <Row key={l.id} l={l} />)}
        </List>
        <List title="New leads waiting for a first call" rows={s.waiting.length} empty="All new leads have been contacted.">
          {s.waiting.map((l) => <Row key={l.id} l={l} />)}
        </List>

        <section className="shrim-card">
          <h2>Pipeline</h2>
          <ul className="shrim-pipeline">
            {s.pipeline.map((p) => (
              <li key={p.status}>
                <Link href={where('status', 'equals', p.status)}>
                  <span>{STATUS_LABEL[p.status]}</span>
                  <span className="shrim-bar"><i style={{ width: `${(p.count / maxStage) * 100}%` }} /></span>
                  <b>{p.count}</b>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="shrim-card shrim-wide">
          <h2>Leads by source</h2>
          <div className="shrim-scroll">
            <table className="shrim-table">
              <thead><tr><th>Source</th><th>7 days</th><th>30 days</th><th>90 days</th></tr></thead>
              <tbody>
                {CHANNELS.map((c) => (
                  <tr key={c}><th scope="row">{CHANNEL_LABEL[c]}</th>{([7, 30, 90] as const).map((w) => <td key={w}>{s.bySource[c][w]}</td>)}</tr>
                ))}
                <tr className="shrim-total"><th scope="row">Total</th>{([7, 30, 90] as const).map((w) => <td key={w}>{CHANNELS.reduce((n, c) => n + s.bySource[c][w], 0)}</td>)}</tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="shrim-links">
        <Link href={LEADS} className="shrim-btn shrim-btn-primary">All leads</Link>
        <Link href={`${LEADS}/create`} className="shrim-btn">+ Add a lead (phone call / walk-in)</Link>
        {isAdmin && <Link href="/admin/collections/projects/create" className="shrim-btn">+ Add a project</Link>}
      </div>
      {isAdmin && <SendDigestButton />}
    </div>
  )
}
