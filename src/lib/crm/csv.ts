/** CSV helpers. Cells starting with = + - @ are prefixed so Excel/Sheets never run them as formulas. */
export const cell = (v: unknown): string => {
  let s = v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v)
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
export const toCsv = (rows: unknown[][]) => '﻿' + rows.map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n'

export const LEAD_COLUMNS = [
  'Reference', 'Created (IST)', 'Name', 'Phone', 'Email', 'Locality', 'Service', 'Area', 'Floors', 'Plot status', 'Budget', 'Timeline',
  'Visit date', 'Visit slot', 'Message', 'Source', 'Source detail', 'Channel', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'gclid', 'fbclid', 'Landing page', 'Referrer', 'Device', 'Score', 'Score label', 'Status', 'Lost reason', 'Assigned to', 'Next follow-up',
  'Quotation (₹)', 'Won amount (₹)', 'Won date', 'Consent', 'Consent time', 'Consent version', 'Estimate low', 'Estimate high',
]

type L = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
const ist = (d?: string | null) => (d ? new Date(d).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) : '')
const day = (d?: string | null) => (d ? new Date(d).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }) : '')

export function leadRow(l: L): unknown[] {
  const a = l.attribution ?? {}, c = l.consent ?? {}, e = l.calculator?.estimate
  return [
    l.reference, ist(l.createdAt), l.name, l.phone, l.email, l.locality, l.service, l.areaSize, l.floors, l.plotStatus, l.budgetBand, l.timeline,
    day(l.preferredVisitDate), l.preferredVisitSlot, l.message, l.source, l.sourceDetail, a.channel, a.utm_source, a.utm_medium, a.utm_campaign, a.utm_term, a.utm_content,
    a.gclid, a.fbclid, a.landingPage, a.referrer, a.device, l.scoreOverride ?? l.score, l.scoreBand, l.status, l.lostReason,
    typeof l.assignedTo === 'object' && l.assignedTo ? l.assignedTo.email : '', day(l.nextFollowUp), l.quotationAmount, l.wonAmount, day(l.wonDate),
    c.given ? 'yes' : 'no', ist(c.at), c.textVersion, e?.low, e?.high,
  ]
}
