// Unit checks for the CRM logic (no server needed).
import { cell, toCsv, leadRow, LEAD_COLUMNS } from '../src/lib/crm/csv'
import { breakdownMessage, greetingMessage, waLink } from '../src/lib/crm/whatsapp'
import { addDaysIST, daysBetween, istDate, istDayStart } from '../src/lib/crm/dates'
import { splitFollowUps, type LeadRow } from '../src/lib/crm/stats'
import { shouldSendDigest } from '../src/lib/digest'

let fails = 0
const ok = (c: boolean, m: string) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${m}`); if (!c) fails++ }
const eq = (a: unknown, b: unknown, m: string) => ok(JSON.stringify(a) === JSON.stringify(b), `${m}${JSON.stringify(a) === JSON.stringify(b) ? '' : `  (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`}`)

// CSV
eq(cell('a,b'), '"a,b"', 'csv: commas are quoted')
eq(cell('say "hi"'), '"say ""hi"""', 'csv: quotes are doubled')
eq(cell('=HYPERLINK("x")'), '"\'=HYPERLINK(""x"")"', 'csv: formula injection is neutralised (=)')
eq([cell('+91'), cell('-1'), cell('@x')], ["'+91", "'-1", "'@x"], 'csv: + - @ are neutralised')
eq(cell(null) + cell(undefined) + cell(0), '0', 'csv: empty values and zero')
ok(toCsv([['a'], ['b']]).startsWith('﻿') && toCsv([['a'], ['b']]).endsWith('\r\n'), 'csv: UTF-8 BOM (Hindi opens correctly in Excel) and CRLF')
const row = leadRow({ reference: 'SHR-2026-0001', createdAt: '2026-10-31T10:00:00Z', name: 'Test', phone: '9876543210', attribution: { channel: 'google-ads', gclid: 'g1' }, consent: { given: true, textVersion: 'v1' }, score: 50, scoreBand: 'warm', calculator: { estimate: { low: 1, high: 2 } } })
eq(row.length, LEAD_COLUMNS.length, 'csv: a row has one value per column')

// WhatsApp
const calc = { inputs: { service: 'new-construction', area: 1800, floors: 2, tier: 'standard' }, estimate: { builtUp: 3600, low: 6800000, high: 8320000, breakdown: [{ label: 'Structure', label_hi: 'स्ट्रक्चर', percent: 45 }, { label: 'Finishing', percent: 30 }] } }
const msg = breakdownMessage('Rahul Kumar', calc)!
ok(msg.includes('नमस्ते Rahul जी') && msg.includes('₹68 लाख – ₹83.2 लाख') && msg.includes('• स्ट्रक्चर – 45%') && msg.includes('• Finishing – 30%'), 'whatsapp: Hindi message has name, range and breakdown')
ok(msg.includes('1800 sq ft × 2 मंज़िल = 3600 sq ft') && msg.includes('नया निर्माण') && msg.includes('स्टैंडर्ड'), 'whatsapp: area, floors, service and tier in Hindi')
ok(!/\b(रहा|रही) हूँ\b/.test(msg), 'whatsapp: wording is gender-neutral')
eq(breakdownMessage('X', { inputs: {}, estimate: null }), null, 'whatsapp: no estimate -> no breakdown button')
ok(!breakdownMessage('X', { inputs: { service: 'interior', area: 1000, floors: 1 }, estimate: { low: 1, high: 2 } })!.includes('मंज़िल'), 'whatsapp: interior has no floors text')
const link = waLink('98765 43210', 'नमस्ते & hi')
ok(link === `https://wa.me/919876543210?text=${encodeURIComponent('नमस्ते & hi')}`, 'whatsapp: wa.me link with country code and encoded text')
ok(greetingMessage('Anita Sharma').includes('Anita जी'), 'whatsapp: greeting uses first name')

// dates + follow-ups (IST)
eq(istDate('2026-10-31T20:00:00Z'), '2026-11-01', 'dates: 20:00 UTC is already the next day in IST')
eq(addDaysIST('2026-10-31', 1), '2026-11-01', 'dates: add a day')
eq(daysBetween('2026-10-28', '2026-10-31'), 3, 'dates: days between')
eq(istDayStart('2026-11-01').toISOString(), '2026-10-31T18:30:00.000Z', 'dates: IST midnight in UTC')
const mk = (id: number, d: string): LeadRow => ({ id, name: 'n' + id, phone: '9', status: 'contacted', nextFollowUp: d, createdAt: '2026-10-01T00:00:00Z' })
const f = splitFollowUps([mk(1, '2026-10-28T12:00:00Z'), mk(2, '2026-10-31T12:00:00Z'), mk(3, '2026-11-02T12:00:00Z'), mk(4, '2026-10-30T12:00:00Z'), { ...mk(5, ''), nextFollowUp: null }], '2026-10-31')
eq([f.dueToday.map((x) => x.id), f.overdue.map((x) => [x.id, x.daysLate])], [[2], [[1, 3], [4, 1]]], 'follow-ups: today / overdue (oldest first, days late) / future ignored')

// digest schedule
const t = (iso: string) => new Date(iso)
ok(shouldSendDigest(t('2026-10-31T03:30:00Z'), null), 'digest: due at 9:00 IST')
ok(!shouldSendDigest(t('2026-10-31T03:29:00Z'), null), 'digest: not before 9:00 IST')
ok(shouldSendDigest(t('2026-10-31T05:00:00Z'), '2026-10-30'), 'digest: late start (10:30 IST) still sends')
ok(!shouldSendDigest(t('2026-10-31T03:40:00Z'), '2026-10-31'), 'digest: not twice on the same day')
ok(!shouldSendDigest(t('2026-10-31T09:00:00Z'), null), 'digest: not in the evening (14:30 IST)')

console.log(fails ? `\n${fails} FAILED` : '\nAll CRM logic checks passed.')
process.exit(fails ? 1 : 0)
