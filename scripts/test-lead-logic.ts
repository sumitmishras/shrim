// Unit checks for the lead logic (no server needed): npm run test:logic
import { bandFor, computeScore } from '../src/lib/leads/score'
import { deriveChannel } from '../src/lib/leads/channel'
import { estimate, type RatesData } from '../src/lib/leads/estimate'
import { calculatorLeadSchema, check, isIndianMobile, normalizePhone, shortLeadSchema, siteVisitSchema } from '../src/lib/leads/schema'
import { consume } from '../src/lib/leads/rateLimit'
import { leadAlertText } from '../src/lib/telegram'

let fails = 0
const ok = (c: boolean, m: string) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${m}`); if (!c) fails++ }
const eq = (a: unknown, b: unknown, m: string) => ok(JSON.stringify(a) === JSON.stringify(b), `${m}${JSON.stringify(a) === JSON.stringify(b) ? '' : `  (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`}`)

// --- phone
eq(normalizePhone('+91 98765 43210'), '9876543210', 'phone: +91 with spaces')
eq(normalizePhone('09876543210'), '9876543210', 'phone: leading 0')
eq(normalizePhone('919876543210'), '9876543210', 'phone: 91 prefix')
eq(normalizePhone('9123456789'), '9123456789', 'phone: valid 10 digits starting 91 is kept')
ok(isIndianMobile('9876543210') && isIndianMobile('6000000000'), 'phone: 6-9 start accepted')
ok(!isIndianMobile('5876543210') && !isIndianMobile('98765') && !isIndianMobile('98765432101') && !isIndianMobile('abcdefghij'), 'phone: bad numbers rejected')

// --- schemas
const good = { locale: 'en', name: 'Test User', phone: '98765 43210', consent: true, service: 'house-construction' }
const r = check(siteVisitSchema, good)
ok(r.ok && r.data.phone === '9876543210', 'site-visit: valid lead passes, phone normalised')
const bad = (patch: object, field: string, code: string) => { const x = check(siteVisitSchema, { ...good, ...patch }); ok(!x.ok && x.errors[field] === code, `site-visit: ${field} -> ${code}`) }
bad({ phone: '12345' }, 'phone', 'phone')
bad({ phone: '5876543210' }, 'phone', 'phone')
bad({ consent: false }, 'consent', 'consent')
bad({ consent: undefined }, 'consent', 'consent')
bad({ name: 'A' }, 'name', 'name')
bad({ email: 'nope' }, 'email', 'email')
bad({ service: 'plumbing' }, 'service', 'service')
bad({ visitDate: '2020-01-01' }, 'date' === 'date' ? 'visitDate' : '', 'date')
ok(check(siteVisitSchema, { ...good, email: '', floors: '', budgetBand: '', visitDate: '' }).ok, 'site-visit: empty optional fields are fine')
ok(!check(siteVisitSchema, { ...good, budgetBand: 'free' }).ok, 'site-visit: unknown budget band rejected')
ok(!check(shortLeadSchema, { ...good, source: 'hack' }).ok && check(shortLeadSchema, { ...good, source: 'contact' }).ok, 'short: source must be known')
const calc = { locale: 'en', name: 'Test User', phone: '9876543210', consent: true, calcService: 'new-construction', area: 1800, floors: 2, tier: 'standard' }
ok(check(calculatorLeadSchema, calc).ok, 'calculator: valid passes')
ok(!check(calculatorLeadSchema, { ...calc, area: 50 }).ok && !check(calculatorLeadSchema, { ...calc, area: 99999 }).ok && !check(calculatorLeadSchema, { ...calc, floors: 9 }).ok, 'calculator: area/floors limits')

// --- score
eq(computeScore({ timeline: 'immediately', budgetBand: '25-50', locality: 'Chinhat', plotStatus: 'ready', source: 'site-visit' }), 91, 'score: best site-visit lead = 91')
eq(computeScore({}), 0, 'score: empty = 0')
eq(computeScore({ locality: 'Chinhat', source: 'calculator' }), 20, 'score: calculator + priority area = 20')
eq(computeScore({ locality: 'Indira Nagar, Lucknow' }), 8, 'score: secondary area = 8')
eq(computeScore({ locality: 'Delhi' }), 0, 'score: outside = 0')
eq(computeScore({ timeline: '1-3-months', budgetBand: 'under-10', plotStatus: 'under-purchase' }), 35, 'score: 20 + 15 = 35')
eq([bandFor(70), bandFor(69), bandFor(40), bandFor(39)], ['hot', 'warm', 'warm', 'cold'], 'score: band thresholds')

// --- channel
eq(deriveChannel({ gclid: 'x' }), 'google-ads', 'channel: gclid')
eq(deriveChannel({ utm_source: 'google', utm_medium: 'cpc' }), 'google-ads', 'channel: google cpc')
eq(deriveChannel({ fbclid: 'x' }), 'meta-ads', 'channel: fbclid')
eq(deriveChannel({ utm_source: 'facebook', utm_medium: 'paid_social' }), 'meta-ads', 'channel: facebook paid')
eq(deriveChannel({ utm_source: 'gbp', utm_medium: 'organic' }), 'gbp', 'channel: GBP')
eq(deriveChannel({ referrer: 'https://www.google.com/' }), 'organic', 'channel: google referrer')
eq(deriveChannel({}), 'direct', 'channel: nothing = direct')
eq(deriveChannel({ utm_source: 'whatsapp' }), 'whatsapp', 'channel: whatsapp')
eq(deriveChannel({ utm_source: 'newsletter', utm_medium: 'email' }), 'other', 'channel: other')

// --- estimate
const rates: RatesData = {
  rates: [{ service: 'house-construction', tier: 'standard', rate: 2100 }, { service: 'interior', tier: 'basic', rate: 1000 }, { service: 'renovation', tier: 'premium', rate: 1800 }],
  extras: [{ key: 'parking', label: 'Parking', pricing: 'fixed', value: 150000 }, { key: 'basement', label: 'Basement', pricing: 'perSqft', value: 1200 }],
  breakdown: [{ service: 'house-construction', label: 'Structure', percent: 45 }], rangePercent: 10,
}
const e1 = estimate(rates, { service: 'new-construction', area: 1800, floors: 2, tier: 'standard', extras: [] })!
eq([e1.total, e1.low, e1.high], [7560000, 6800000, 8320000], 'estimate: 1800 sq ft x 2 floors @2100 = 75.6L, range +-10%')
const e2 = estimate(rates, { service: 'new-construction', area: 1000, floors: 1, tier: 'standard', extras: ['parking', 'basement'] })!
eq(e2.total, 2100000 + 150000 + 1200000, 'estimate: fixed + per-sq-ft extras (footprint)')
eq(estimate(rates, { service: 'interior', area: 1000, floors: 4, tier: 'basic', extras: ['parking'] })!.total, 1000000, 'estimate: interior ignores floors and extras')
eq(estimate(rates, { service: 'renovation', area: 1000, floors: 2, tier: 'premium', extras: ['parking'] })!.total, 3600000, 'estimate: renovation ignores extras')
eq(estimate(rates, { service: 'renovation', area: 1000, floors: 2, tier: 'basic', extras: [] }), null, 'estimate: missing rate = null')
eq(e1.breakdown, [{ label: 'Structure', percent: 45 }], 'estimate: breakdown for the service only')

// --- rate limit
const key = 'test:' + Math.random()
const res = Array.from({ length: 6 }, () => consume(key, 5, 3600_000).ok)
eq(res, [true, true, true, true, true, false], 'rate limit: 5 per hour, 6th blocked')
ok(consume('other:' + Math.random(), 5, 3600_000).ok, 'rate limit: another IP unaffected')

// --- telegram text
const txt = leadAlertText({ id: 7, reference: 'SHR-2026-0007', name: '<b>Evil</b> & Co', phone: '9876543210', service: 'interior', locality: 'Chinhat', budgetBand: '25-50', timeline: 'immediately', source: 'site-visit', score: 91, scoreBand: 'hot', attribution: { channel: 'google-ads' } })
ok(txt.includes('&lt;b&gt;Evil&lt;/b&gt; &amp; Co') && !txt.includes('<b>Evil'), 'telegram: user text is HTML-escaped')
ok(txt.includes('+91 9876543210') && txt.includes('SHR-2026-0007') && txt.includes('/admin/collections/leads/7') && txt.includes('HOT'), 'telegram: phone, reference, admin link, band')

console.log(fails ? `\n${fails} FAILED` : '\nAll logic checks passed.')
process.exit(fails ? 1 : 0)
