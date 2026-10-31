// End-to-end lead tests in a real browser. Needs the dev server on :3000 and the seeded admin.
//   npm run test:e2e
// Every test lead is named "E2E ..." and deleted at the end. Run it on a fresh server: the 5-per-hour limit is in memory.
import { chromium } from 'playwright'
import fs from 'fs'

const BASE = process.env.BASE_URL || 'http://localhost:3000'
const env = Object.fromEntries(fs.readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n').filter((l) => l.includes('=') && !l.startsWith('#')).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]))
let fails = 0
const ok = (c, m) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${m}`); if (!c) fails++ }

// ---- admin API helpers
const login = await (await fetch(`${BASE}/api/users/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: env.SEED_ADMIN_EMAIL, password: env.SEED_ADMIN_PASSWORD }) })).json()
const auth = { Authorization: `JWT ${login.token}`, 'content-type': 'application/json' }
const api = (path, init = {}) => fetch(`${BASE}/api${path}`, { ...init, headers: { ...auth, ...(init.headers || {}) } }).then((r) => r.json())
const leads = async () => (await api('/leads?where[name][like]=E2E&limit=100&sort=createdAt&depth=0')).docs
const byName = async (n) => (await leads()).find((l) => l.name === n)
const setSettings = (d) => api('/globals/siteSettings', { method: 'POST', body: JSON.stringify(d) })

await setSettings({ whatsapp: '919999999999', phone: '+91 99999 99999' })
await api('/leads?where[name][like]=E2E', { method: 'DELETE' })

const browser = await chromium.launch()
const newPage = async (ip, viewport = { width: 1280, height: 900 }, extra = {}) => {
  const ctx = await browser.newContext({ viewport, extraHTTPHeaders: { 'x-forwarded-for': ip }, ...extra })
  const page = await ctx.newPage()
  page.setDefaultTimeout(30000)
  return { ctx, page }
}
const dl = (page) => page.evaluate(() => window.dataLayer || [])

async function siteVisit(page, { prefix = '', name, phone = '9876543210', consent = true, lang = 'en', stopBeforeSubmit = false } = {}) {
  const T = lang === 'hi'
    ? { svc: 'घर निर्माण', area: 'प्लॉट या बिल्ट-अप एरिया (sq ft)', loc: 'इलाक़ा', plot: 'प्लॉट तैयार है', next: 'आगे →', budget: 'बजट', timeline: 'अभी तुरंत', name: 'आपका नाम', phone: 'मोबाइल नंबर', submit: 'मेरी फ्री साइट विज़िट बुक करें', floors: 'मंज़िलें' }
    : { svc: 'House Construction', area: 'Plot or built-up area (sq ft)', loc: 'Locality', plot: 'Plot is ready', next: 'Next →', budget: 'Budget range', timeline: 'Immediately', name: 'Your name', phone: 'Mobile number', submit: 'Book my free site visit', floors: 'Floors' }
  await page.goto(`${BASE}${prefix}/site-visit`)
  await page.locator('#main').getByText(T.svc, { exact: true }).click()
  await page.getByRole('button', { name: T.next }).click()
  await page.getByLabel(T.area, { exact: true }).fill('1800')
  await page.getByLabel(T.floors, { exact: true }).selectOption('2')
  await page.getByLabel(T.loc, { exact: true }).selectOption({ label: lang === 'hi' ? 'चिनहट' : 'Chinhat' })
  await page.locator('#main').getByText(T.plot, { exact: true }).click()
  await page.getByRole('button', { name: T.next }).click()
  await page.getByLabel(T.budget, { exact: true }).selectOption('25-50')
  await page.locator('#main').getByText(T.timeline, { exact: true }).click()
  await page.getByRole('button', { name: T.next }).click()
  await page.getByLabel(T.name, { exact: true }).fill(name)
  await page.getByLabel(T.phone, { exact: true }).fill(phone)
  if (consent) await page.getByRole('checkbox').check()
  if (!stopBeforeSubmit) await page.getByRole('button', { name: T.submit }).click()
  return T
}
const quick = async (page, { name, phone = '9812345678', service = 'interior', consent = true, hp = '' }) => {
  const form = page.locator('form:has(input[type=checkbox])').last()
  await form.getByLabel('Your name', { exact: true }).fill(name)
  await form.getByLabel('Mobile number', { exact: true }).fill(phone)
  await form.getByLabel('What do you need?', { exact: true }).selectOption(service)
  if (consent) await form.getByRole('checkbox').check()
  if (hp) await form.locator('input[tabindex="-1"]').fill(hp, { force: true })
  await form.getByRole('button', { name: 'Request a call back' }).click()
}

try {
// 1. Site-visit form, valid, with Google Ads attribution (desktop)
{
  const { ctx, page } = await newPage('10.0.0.1')
  await page.goto(`${BASE}/?utm_source=google&utm_medium=cpc&utm_campaign=e2e-campaign&utm_term=ghar&gclid=E2EGCLID`)
  await page.waitForTimeout(600)
  const cookie = (await ctx.cookies()).find((c) => c.name === 'shrim_attr')
  ok(!!cookie && cookie.sameSite === 'Lax' && cookie.expires > Date.now() / 1000 + 29 * 86400, 'attribution cookie set (first-party, Lax, ~30 days)')
  await siteVisit(page, { name: 'E2E Site Visit' })
  await page.waitForURL(/\/thank-you\?ref=SHR-\d{4}-\d{4}/)
  const ref = (await page.getByTestId('lead-ref').textContent())?.trim()
  ok(/^SHR-\d{4}-\d{4}$/.test(ref), `redirected to /thank-you showing reference ${ref}`)
  const wa = await page.getByRole('link', { name: 'Chat on WhatsApp' }).getAttribute('href')
  ok(wa?.startsWith('https://wa.me/919999999999?text=') && decodeURIComponent(wa).includes(ref), 'WhatsApp button has a pre-filled message containing the reference')
  ok((await page.textContent('body')).includes('Hum 30 minute ke andar call karenge'), 'thank-you shows the editable promise text')
  const events = await dl(page)
  const names = events.map((e) => e.event)
  ok(names.includes('generate_lead') && names.includes('site_visit_booked'), `dataLayer has generate_lead + site_visit_booked (${names.filter((n) => /lead|visit/.test(n)).join(', ')})`)
  const blob = JSON.stringify(events)
  ok(!blob.includes('9876543210') && !blob.includes('E2E Site Visit') && !/@/.test(blob), 'dataLayer contains no phone, name or email')
  const gl = events.find((e) => e.event === 'generate_lead')
  ok(gl?.form_name === 'site_visit' && gl?.service === 'house-construction' && gl?.lead_score_band === 'hot', 'generate_lead params: form_name, service, score band')
  const l = await byName('E2E Site Visit')
  ok(l?.reference === ref && l.status === 'new' && l.source === 'site-visit', 'lead saved in admin: reference, status new, source site-visit')
  ok(l?.phone === '9876543210' && l.service === 'house-construction' && l.locality === 'Chinhat' && l.areaSize === '1800 sq ft' && l.floors === '2' && l.plotStatus === 'ready' && l.budgetBand === '25-50' && l.timeline === 'immediately', 'lead fields saved correctly')
  const a = l?.attribution || {}
  ok(a.utm_source === 'google' && a.utm_medium === 'cpc' && a.utm_campaign === 'e2e-campaign' && a.utm_term === 'ghar' && a.gclid === 'E2EGCLID', 'attribution: utm_* and gclid saved')
  ok(a.landingPage?.startsWith('/?utm_source=google') && a.device === 'desktop' && !!a.firstVisitAt && a.channel === 'google-ads', `attribution: landing page, device ${a.device}, first visit, channel ${a.channel}`)
  ok(l?.consent?.given === true && !!l.consent.at && l.consent.textVersion === '2026-10-31-v1', `consent saved with timestamp and version (${l?.consent?.textVersion})`)
  ok(l?.score === 91 && l.scoreBand === 'hot', `score ${l?.score} / ${l?.scoreBand} (expected 91 hot)`)
  ok(l?.statusHistory?.length === 1 && l.statusHistory[0].to === 'new', 'status audit trail started')
  await ctx.close()
}

// 2. Client-side validation on the site-visit form
{
  const { ctx, page } = await newPage('10.0.0.2')
  await siteVisit(page, { name: 'E2E Bad Phone', phone: '12345', consent: false, stopBeforeSubmit: true })
  ok(!(await page.getByRole('checkbox').isChecked()), 'consent checkbox is unticked by default')
  await page.getByRole('button', { name: 'Book my free site visit' }).click()
  ok(await page.getByText('tick this box', { exact: false }).isVisible() && /site-visit$/.test(page.url()), 'no consent: error shown, not submitted')
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Book my free site visit' }).click()
  ok(await page.getByText('valid 10-digit mobile number', { exact: false }).isVisible() && /site-visit$/.test(page.url()), 'invalid phone: error shown, stays on form')
  await page.getByLabel('Mobile number', { exact: true }).fill('5876543210')
  await page.getByRole('button', { name: 'Book my free site visit' }).click()
  ok(await page.getByText('valid 10-digit mobile number', { exact: false }).isVisible(), 'phone starting with 5 is rejected')
  await ctx.close()
}

// 3. Server-side validation: tamper with the request after the browser's own checks
{
  const { ctx, page } = await newPage('10.0.0.3')
  await page.route('**/*', async (route) => {
    const r = route.request()
    if (r.method() === 'POST' && r.headers()['next-action']) {
      const body = (r.postData() || '').replace('"phone":"9876543210"', '"phone":"123"').replace('"consent":true', '"consent":false')
      return route.continue({ postData: body })
    }
    return route.continue()
  })
  await siteVisit(page, { name: 'E2E Tampered' })
  await page.waitForTimeout(2500)
  ok(/site-visit$/.test(page.url()) && (await page.getByText('Please fix the highlighted fields.').isVisible().catch(() => false)), 'server rejects a tampered request (bad phone, no consent) and shows errors')
  ok(!(await byName('E2E Tampered')), 'tampered request saved no lead')
  await ctx.close()
}

// 4. Honeypot
{
  const { ctx, page } = await newPage('10.0.0.4')
  await page.goto(`${BASE}/contact`)
  await quick(page, { name: 'E2E Honeypot', hp: 'http://spam.example' })
  await page.waitForURL(/\/thank-you$/)
  ok(!(await byName('E2E Honeypot')), 'honeypot filled: looks successful to the bot, but no lead saved')
  await ctx.close()
}

// 5. Cost calculator: pre-filled, instant result, then lead capture
{
  const { ctx, page } = await newPage('10.0.0.5')
  await page.goto(`${BASE}/cost-calculator?area=1800&floors=2`)
  ok((await page.getByLabel('Area of one floor (sq ft)').inputValue()) === '1800' && (await page.getByLabel('Number of floors').inputValue()) === '2', 'calculator pre-filled from ?area=&floors=')
  await page.getByText('Approximate range').waitFor()
  const range = await page.locator('p.font-display').first().textContent()
  ok(range.includes('₹68 Lakh') && range.includes('₹83.2 Lakh'), `instant result is a range, not one number (${range.trim()})`)
  ok(await page.getByText('Ye approximate estimate hai. Exact cost site visit ke baad milegi.').isVisible(), 'disclaimer shown')
  ok((await page.getByText('Structure').count()) > 0 && (await page.getByText('%').count()) > 0, 'percentage breakdown shown')
  await page.getByLabel('Quality level').selectOption('premium')
  ok((await page.locator('p.font-display').first().textContent()) !== range, 'result updates when inputs change')
  await page.getByLabel('Quality level').selectOption('standard')
  await page.getByLabel('Your name', { exact: true }).fill('E2E Calculator')
  await page.getByLabel('Mobile number', { exact: true }).fill('9822334455')
  await page.getByRole('checkbox').last().check()
  await page.getByRole('button', { name: 'Send me the breakdown' }).click()
  await page.waitForURL(/\/thank-you\?ref=/)
  const names = (await dl(page)).map((e) => e.event)
  ok(names.includes('calculator_complete') && names.includes('generate_lead'), `dataLayer has calculator_complete + generate_lead`)
  const l = await byName('E2E Calculator')
  ok(l?.source === 'calculator' && l.service === 'house-construction' && l.areaSize === '1800 sq ft' && l.floors === '2', 'calculator lead saved with source and inputs')
  ok(l?.calculator?.estimate?.low === 6800000 && l.calculator.estimate.high === 8320000 && l.calculator.inputs.tier === 'standard', 'calculator inputs + estimate attached (computed on the server)')
  ok(l?.score === 5 && l.scoreBand === 'cold', `calculator lead score ${l?.score} ${l?.scoreBand} (expected 5 cold)`)
  ok(l?.attribution?.channel === 'direct', `no campaign -> channel ${l?.attribution?.channel}`)
  await ctx.close()
}

// 6. Short forms: home (Hindi page too later) and a service page on mobile with Meta Ads attribution
{
  const { ctx, page } = await newPage('10.0.0.6', { width: 390, height: 800 }, { hasTouch: true })
  await page.goto(`${BASE}/services/interior?utm_source=facebook&utm_medium=paid_social&utm_campaign=meta-e2e&fbclid=E2EFB`)
  await page.waitForTimeout(600)
  await quick(page, { name: 'E2E Service Page', service: 'interior' })
  await page.waitForURL(/\/thank-you\?ref=/)
  const l = await byName('E2E Service Page')
  ok(l?.source === 'service-page' && l.sourceDetail === 'interior' && l.service === 'interior', 'service page form: source, detail, service')
  ok(l?.attribution?.fbclid === 'E2EFB' && l.attribution.channel === 'meta-ads' && l.attribution.device === 'mobile', `Meta Ads attribution: fbclid, channel ${l?.attribution?.channel}, device ${l?.attribution?.device}`)
  ok(l?.score === 0 && l.scoreBand === 'cold', 'short-form lead scored 0 / cold (no timeline, budget or locality)')
  await ctx.close()
  const b = await newPage('10.0.0.7')
  await b.page.goto(`${BASE}/`)
  await quick(b.page, { name: 'E2E Home', service: 'renovation' })
  await b.page.waitForURL(/\/thank-you\?ref=/)
  const h = await byName('E2E Home')
  ok(h?.source === 'home' && h.service === 'renovation', 'home CTA form: source home')
  await b.ctx.close()
}

// 7. Hindi site-visit flow
{
  const { ctx, page } = await newPage('10.0.0.8')
  await siteVisit(page, { prefix: '/hi', lang: 'hi', name: 'E2E Hindi' })
  await page.waitForURL(/\/hi\/thank-you\?ref=/)
  ok(await page.getByText('धन्यवाद').first().isVisible(), 'Hindi flow: redirected to /hi/thank-you in Hindi')
  const l = await byName('E2E Hindi')
  ok(l?.locality === 'Chinhat' && l.score === 91, 'Hindi flow: locality stored as the English area name, score 91')
  await ctx.close()
}

// 8. Rate limit: 5 per hour per IP, 6th blocked
{
  const { ctx, page } = await newPage('10.0.0.99')
  for (let i = 1; i <= 5; i++) {
    await page.goto(`${BASE}/contact`)
    await quick(page, { name: `E2E RateLimit ${i}`, phone: `98000000${10 + i}` })
    await page.waitForURL(/\/thank-you\?ref=/)
  }
  await page.goto(`${BASE}/contact`)
  await quick(page, { name: 'E2E RateLimit 6', phone: '9800000099' })
  await page.getByText('Too many requests').waitFor()
  ok(true, '6th submission from the same IP shows the rate-limit message')
  ok(!(await byName('E2E RateLimit 6')) && !!(await byName('E2E RateLimit 5')), '5 saved, 6th not saved')
  await ctx.close()
  const other = await newPage('10.0.0.100')
  await other.page.goto(`${BASE}/contact`)
  await quick(other.page, { name: 'E2E OtherIP', phone: '9800000098' })
  await other.page.waitForURL(/\/thank-you\?ref=/)
  ok(!!(await byName('E2E OtherIP')), 'a different IP is not affected')
  await other.ctx.close()
}

// 9. Click tracking
{
  const { ctx, page } = await newPage('10.0.0.50')
  await page.goto(`${BASE}/`)
  await page.getByRole('link', { name: 'Book a Free Site Visit' }).first().click({ noWaitAfter: true }).catch(() => {})
  await page.waitForTimeout(500)
  const ev = (await dl(page)).filter((e) => e.event === 'cta_click')
  ok(ev.length > 0 && typeof ev[0].button_label === 'string', 'cta_click pushed to dataLayer with button label')
  await ctx.close()
}

} catch (e) {
  console.log('FAIL  test crashed:', e.message.split('\n')[0]); fails++
} finally {
}

// ---- cleanup
const all = await leads()
await api('/leads?where[name][like]=E2E', { method: 'DELETE' })
await setSettings({ whatsapp: 'PLACEHOLDER', phone: 'PLACEHOLDER' })
await browser.close()
console.log(`\ncleaned up ${all.length} test leads`)
console.log(fails ? `${fails} FAILED` : 'All end-to-end checks passed.')
process.exit(fails ? 1 : 0)
