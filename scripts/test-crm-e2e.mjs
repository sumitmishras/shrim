// CRM end-to-end tests at phone width. Dev server on :3000 and the seeded admin are required.
//   node scripts/test-crm-e2e.mjs ui        (dev server WITHOUT Telegram settings)
//   node scripts/test-crm-e2e.mjs digest    (dev server started with TELEGRAM_BOT_TOKEN=T TELEGRAM_CHAT_ID=1 TELEGRAM_API_BASE=http://localhost:9099)
// All test leads use phones 90000000xx and are deleted at the end.
import { chromium } from 'playwright'
import fs from 'fs'
import http from 'http'

const MODE = process.argv[2] || 'ui'
const BASE = 'http://localhost:3000'
const env = Object.fromEntries(fs.readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n').filter((l) => l.includes('=') && !l.startsWith('#')).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]))
let fails = 0
const ok = (c, m) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${m}`); if (!c) fails++ }

const j = (r) => r.json()
const login = async (email, password) => (await fetch(`${BASE}/api/users/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password }) }).then(j)).token
const adminTok = await login(env.SEED_ADMIN_EMAIL, env.SEED_ADMIN_PASSWORD)
const call = (tok) => (path, init = {}) => fetch(`${BASE}/api${path}`, { ...init, headers: { Authorization: `JWT ${tok}`, 'content-type': 'application/json', ...(init.headers || {}) } })
const A = call(adminTok)
const ymd = (d = new Date()) => d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
const addDays = (n) => ymd(new Date(Date.now() + n * 86400000))
const day = (n) => `${addDays(n)}T12:00:00.000Z`
const mk = async (d) => (await A('/leads', { method: 'POST', body: JSON.stringify(d) }).then(j)).doc
const cleanup = async () => { await A('/leads?where[phone][like]=90000000', { method: 'DELETE' }); await A('/users?where[email][like]=crm-staff-test', { method: 'DELETE' }) }
await cleanup()

// ---- fake Telegram (digest mode)
const tg = []
let tgServer
if (MODE === 'digest') {
  tgServer = http.createServer((req, res) => { let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => { tg.push(JSON.parse(b)); res.writeHead(200); res.end('{"ok":true}') }) }).listen(9099)
}

try {
  // ---- test data
  const overdue = await mk({ name: 'CRM Overdue <b>', phone: '9000000001', status: 'contacted', nextFollowUp: day(-3), service: 'interior', attribution: { channel: 'google-ads' } })
  const dueToday = await mk({ name: 'CRM DueToday', phone: '9000000002', status: 'contacted', nextFollowUp: day(0), attribution: { channel: 'meta-ads' } })
  await mk({ name: 'CRM Future', phone: '9000000003', status: 'contacted', nextFollowUp: day(5) })
  const fresh = await mk({ name: 'CRM New', phone: '9000000004', status: 'new', attribution: { channel: 'google-ads' } })
  await mk({ name: 'CRM Won', phone: '9000000005', status: 'won', wonAmount: 500000, wonDate: day(0) })
  await mk({ name: 'CRM Lost', phone: '9000000006', status: 'lost', nextFollowUp: day(-9) })
  const hot = await mk({ name: 'CRM Hot', phone: '9000000007', status: 'qualified', timeline: 'immediately', budgetBand: '25-50', locality: 'Chinhat', plotStatus: 'ready', source: 'site-visit' })
  const calc = await mk({
    name: 'CRM Calc Lead', phone: '9000000008', status: 'new', source: 'calculator',
    calculator: { inputs: { service: 'new-construction', area: 1800, floors: 2, tier: 'standard', extras: [] }, estimate: { rate: 2100, builtUp: 3600, extrasTotal: 0, low: 6800000, high: 8320000, breakdown: [{ label: 'Structure', label_hi: 'स्ट्रक्चर', percent: 45 }, { label: 'Finishing', label_hi: 'फ़िनिशिंग', percent: 30 }] } },
  })
  await mk({ name: '=HYPERLINK("http://evil.example")', phone: '9000000009', status: 'contacted' })
  ok(!!overdue?.id && hot?.scoreBand === 'hot', `test leads created (CRM Hot scored ${hot?.score} ${hot?.scoreBand})`)

  if (MODE === 'ui') {
    const browser = await chromium.launch()
    const ctx = await browser.newContext({ viewport: { width: 360, height: 800 }, hasTouch: true })
    const page = await ctx.newPage()
    page.setDefaultTimeout(30000)
    const noOverflow = async (label) => ok(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), `${label}: no horizontal overflow at 360px`)
    const loginUI = async (email, password) => {
      await page.goto(`${BASE}/admin/login`)
      await page.locator('#field-email').fill(email); await page.locator('#field-password').fill(password)
      await page.locator('button[type=submit]').click(); await page.waitForURL(/\/admin(\/)?$/)
    }

    // ===== Admin dashboard
    await loginUI(env.SEED_ADMIN_EMAIL, env.SEED_ADMIN_PASSWORD)
    await page.locator('.shrim-dash').waitFor()
    const dash = await page.locator('.shrim-dash').innerText()
    ok(/Overdue follow-ups/.test(dash) && /Follow-ups today/.test(dash) && /Pipeline/.test(dash) && /Leads by source/.test(dash), 'dashboard shows overdue, today, pipeline and source sections')
    const od = page.locator('li.shrim-row.is-overdue', { hasText: 'CRM Overdue' })
    ok((await od.count()) === 1 && (await od.innerText()).includes('3 days late'), 'overdue lead is listed with "3 days late"')
    ok((await page.locator('li.shrim-row.is-overdue', { hasText: 'CRM Lost' }).count()) === 0 && (await page.locator('li.shrim-row', { hasText: 'CRM Future' }).count()) === 0, 'lost and future follow-ups are not listed as due')
    const col = await od.locator('strong').evaluate((e) => getComputedStyle(e).color.match(/\d+/g).map(Number))
    ok(col[0] > 150 && col[0] > col[1] + 60 && col[0] > col[2] + 60, `overdue text is red (rgb ${col.slice(0, 3)})`)
    ok(await page.locator('a.shrim-kpi.is-overdue').count() === 1, 'overdue counter is highlighted red')
    ok((await page.locator('li.shrim-row', { hasText: 'CRM DueToday' }).count()) >= 1, 'follow-up due today is listed')
    ok(/₹5 Lakh/.test(await page.locator('a.shrim-kpi').nth(3).innerText()), 'won value this month shown (₹5 Lakh)')
    ok(/Google Ads/.test(dash) && (await page.locator('.shrim-table tbody tr').count()) === 8, 'leads-by-source table (7 channels + total)')
    const srcRow = (await page.locator('.shrim-table tr', { hasText: 'Google Ads' }).innerText()).match(/\d+/g).map(Number)
    ok(srcRow[0] >= 2 && srcRow[1] >= 2 && srcRow[2] >= 2, `Google Ads counts for 7/30/90 days (${srcRow})`)
    ok((await page.locator('.shrim-pipeline li').count()) === 8, 'pipeline shows all 8 statuses')
    const small = await page.evaluate(() => [...document.querySelectorAll('.shrim-dash a, .shrim-dash button')].filter((e) => { const b = e.getBoundingClientRect(); return b.width && b.height && b.height < 43.5 }).map((e) => `${e.textContent.trim().slice(0, 20)} ${Math.round(e.getBoundingClientRect().height)}`))
    ok(small.length === 0, `dashboard tap targets all >= 44px${small.length ? ' (small: ' + small.slice(0, 4) + ')' : ''}`)
    await noOverflow('dashboard')
    ok(await page.locator('.shrim-digest button').isVisible(), 'admin sees the "send digest" button')
    await page.screenshot({ path: process.env.SHOTS ? `${process.env.SHOTS}/crm-dash-360.png` : '/dev/null', fullPage: true }).catch(() => {})
    await page.locator('li.shrim-row', { hasText: 'CRM Overdue' }).locator('a.shrim-row-main').click()
    await page.waitForURL(new RegExp(`/leads/${overdue.id}`))
    ok(true, 'tapping a lead opens it')

    // ===== Lead detail buttons
    await page.locator('.shrim-actions').waitFor()
    const hrefs = await page.locator('.shrim-actions a').evaluateAll((a) => a.map((x) => x.getAttribute('href')))
    ok(hrefs[0] === 'tel:+919000000001' && hrefs[1].startsWith('https://wa.me/919000000001?text='), 'lead detail: tap-to-call and WhatsApp use the lead’s number')
    ok(hrefs.length === 2, 'lead without a calculator estimate has no "send breakdown" button')
    await noOverflow('lead detail')
    ok((await page.locator('.shrim-actions a').first().boundingBox()).height >= 44, 'lead detail buttons are >= 44px tall')
    await page.goto(`${BASE}/admin/collections/leads/${calc.id}`)
    await page.locator('.shrim-actions').waitFor()
    const links = await page.locator('.shrim-actions a').evaluateAll((a) => a.map((x) => ({ t: x.textContent, h: x.getAttribute('href') })))
    const bd = links.find((l) => /breakdown/i.test(l.t))
    const text = bd ? decodeURIComponent(bd.h.split('text=')[1]) : ''
    ok(!!bd && bd.h.startsWith('https://wa.me/919000000008?text='), 'calculator lead has "Send breakdown on WhatsApp"')
    ok(text.includes('नमस्ते CRM जी') && text.includes('₹68 लाख – ₹83.2 लाख') && text.includes('• स्ट्रक्चर – 45%') && text.includes('• फ़िनिशिंग – 30%') && text.includes('नया निर्माण'), 'breakdown message: Hindi, estimate range, breakdown lines')

    // ===== Leads list
    await page.goto(`${BASE}/admin/collections/leads`)
    await page.locator('.shrim-filters').waitFor()
    await noOverflow('leads list')
    const sel = (i) => page.locator('.shrim-filters select').nth(i)
    await sel(0).selectOption('contacted')
    await page.waitForURL(/where.*status.*contacted/)
    await page.locator('.shrim-status select').first().waitFor()
    let vals = await page.locator('.shrim-status select').evaluateAll((s) => s.map((x) => x.value))
    ok(vals.length >= 4 && vals.every((v) => v === 'contacted'), `status filter: only "contacted" rows (${vals.length})`)
    await page.locator('.shrim-filter-actions button', { hasText: 'Clear filters' }).click()
    await page.waitForURL((u) => !u.search.includes('where'))
    await sel(1).selectOption('hot')
    await page.waitForURL(/scoreBand/)
    await page.locator('tbody tr', { hasText: 'CRM Hot' }).waitFor()
    await page.waitForTimeout(500)
    ok((await page.locator('tbody tr').count()) === 1, 'score filter (Hot) shows the hot lead only')
    await page.goto(`${BASE}/admin/collections/leads`)
    await sel(2).selectOption('google-ads')
    await page.waitForURL(/channel/)
    await page.locator('tbody tr', { hasText: 'CRM New' }).waitFor()
    await page.waitForTimeout(500)
    const names = await page.locator('tbody tr').allInnerTexts()
    ok(names.some((n) => n.includes('CRM New')) && names.every((n) => !n.includes('CRM DueToday')), 'source filter (Google Ads) works')
    await page.goto(`${BASE}/admin/collections/leads`)
    await sel(3).selectOption('interior')
    await page.waitForURL(/service/)
    await page.locator('tbody tr', { hasText: 'CRM Overdue' }).waitFor()
    await page.waitForTimeout(500)
    ok((await page.locator('tbody tr').count()) === 1, 'service filter (Interior) works')
    await page.goto(`${BASE}/admin/collections/leads`)
    await sel(4).selectOption('today')
    await page.waitForURL(/createdAt/)
    await page.locator('tbody tr', { hasText: 'CRM Calc Lead' }).waitFor()
    ok((await page.locator('tbody tr').count()) >= 9, 'date filter (Today) works')
    const exportHref = await page.locator('.shrim-filter-actions a', { hasText: 'Export CSV' }).getAttribute('href')
    ok(exportHref.startsWith('/api/leads/export?where') && exportHref.includes('createdAt'), 'Export CSV button carries the current filters')

    // quick status change from the list
    await page.goto(`${BASE}/admin/collections/leads`)
    const row = page.locator('tbody tr', { hasText: 'CRM New' })
    await row.locator('.shrim-status select').selectOption('contacted')
    await page.waitForTimeout(1500)
    const after = await A(`/leads/${fresh.id}?depth=0`).then(j)
    const last = after.statusHistory.at(-1)
    ok(after.status === 'contacted' && last.from === 'new' && last.to === 'contacted' && !!last.by, 'quick status change from the list saved and logged in the audit trail')

    // ===== CSV export (admin)
    const csvRes = await A('/leads/export')
    const csv = await csvRes.text()
    ok(csvRes.status === 200 && (csvRes.headers.get('content-type') || '').includes('text/csv') && /^\uFEFF?Reference,/.test(csv), 'admin CSV export: 200, text/csv, header row')
    ok(csv.includes('CRM Overdue <b>') && csv.includes('SHR-'), 'CSV has the leads')
    ok(csv.includes(`'=HYPERLINK(""http://evil.example"")`) && !csv.includes('\n"=HYPERLINK') && !csv.includes(',=HYPERLINK'), 'CSV neutralises formula injection')
    const won = await (await A('/leads/export?where[and][0][status][equals]=won')).text()
    ok(won.trim().split('\r\n').length === 2 && won.includes('CRM Won'), 'CSV honours filters (won only)')
    await ctx.close()

    // ===== Staff
    await A('/users', { method: 'POST', body: JSON.stringify({ email: 'crm-staff-test@example.com', password: 'Staff-Test-12345!', role: 'staff' }) })
    const staffTok = await login('crm-staff-test@example.com', 'Staff-Test-12345!')
    const S = call(staffTok)
    const sx = await S('/leads/export')
    ok(sx.status === 403, `staff cannot export CSV (HTTP ${sx.status})`)
    ok((await S('/leads/digest', { method: 'POST' })).status === 403, 'staff cannot trigger the digest')
    ok((await S(`/leads/${hot.id}`, { method: 'DELETE' })).status >= 400, 'staff cannot delete a lead')
    const st = await S(`/leads/${dueToday.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'qualified', name: 'HACK' }) }).then(j)
    ok(st.doc?.status === 'qualified' && st.doc?.name === 'CRM DueToday', 'staff can change status but not other fields')
    const ctx2 = await browser.newContext({ viewport: { width: 360, height: 800 }, hasTouch: true })
    const p2 = await ctx2.newPage(); p2.setDefaultTimeout(30000)
    await p2.goto(`${BASE}/admin/login`)
    await p2.locator('#field-email').fill('crm-staff-test@example.com'); await p2.locator('#field-password').fill('Staff-Test-12345!')
    await p2.locator('button[type=submit]').click(); await p2.waitForURL(/\/admin(\/)?$/)
    await p2.locator('.shrim-dash').waitFor()
    ok((await p2.locator('.shrim-digest').count()) === 0, 'staff dashboard has no admin-only buttons')
    await p2.goto(`${BASE}/admin/collections/leads`)
    await p2.locator('.shrim-filters').waitFor()
    ok((await p2.locator('.shrim-filter-actions a', { hasText: 'Export CSV' }).count()) === 0, 'staff list has no Export CSV button')
    ok(await p2.locator('.shrim-status select').first().isVisible(), 'staff can use quick status change')
    await ctx2.close()
    await browser.close()

    const dr = await A('/leads/digest', { method: 'POST' }).then(j)
    ok(dr.result === 'not-configured', `digest without Telegram settings is skipped silently (${dr.result})`)
  }

  if (MODE === 'digest') {
    const r = await A('/leads/digest', { method: 'POST' }).then(j)
    ok(r.result === 'sent' && tg.length === 1, `digest sent to (fake) Telegram (${r.result})`)
    const t = tg[0]?.text || ''
    ok(t.includes('Follow-ups today (') && t.includes('CRM DueToday') && t.includes('Overdue follow-ups (') && t.includes('3 days late'), 'digest lists today’s follow-ups and overdue ones')
    ok(t.includes('CRM Overdue &lt;b&gt;') && !t.includes('CRM Overdue <b>'), 'digest escapes names')
    ok(!t.includes('CRM Future') && !t.includes('CRM Lost'), 'digest skips future and lost leads')
    ok(tg[0]?.chat_id === '1' && tg[0]?.parse_mode === 'HTML', 'digest goes to the configured chat')
    // yesterday's new leads: set createdAt back one day through the API
    const y = await mk({ name: 'CRM Yesterday', phone: '9000000010', status: 'new', createdAt: new Date(Date.now() - 86400000).toISOString() })
    const yd = await A(`/leads/${y.id}?depth=0`).then(j)
    if (ymd(new Date(yd.createdAt)) === addDays(-1)) {
      tg.length = 0
      await A('/leads/digest', { method: 'POST' })
      ok((tg[0]?.text || '').includes('New leads yesterday (1)') && tg[0].text.includes('CRM Yesterday'), 'digest lists yesterday’s new leads')
    } else console.log('SKIP  yesterday-leads check (API ignored createdAt override)')
    // nothing to report -> nothing is sent
    await cleanup(); tg.length = 0
    const r2 = await A('/leads/digest', { method: 'POST' }).then(j)
    ok(r2.result === 'nothing-to-report' && tg.length === 0, 'digest with nothing to report sends nothing')
  }
} catch (e) {
  console.log('FAIL  test crashed:', String(e.message || e).split('\n')[0]); fails++
} finally {
  await cleanup()
  tgServer?.close()
}
console.log(fails ? `\n${fails} FAILED` : '\nAll CRM end-to-end checks passed.')
process.exit(fails ? 1 : 0)
