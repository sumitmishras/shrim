// Tracking + consent end-to-end. Two runs:
//   on : dev server started with NEXT_PUBLIC_GTM_ID=GTM-TEST123 META_CAPI_ENABLED=true META_PIXEL_ID=1234 META_CAPI_TOKEN=tok META_CAPI_BASE=http://localhost:9098
//   off: dev server started with none of those (GTM must load nothing)
//   node scripts/test-tracking-e2e.mjs on|off
import { chromium } from 'playwright'
import crypto from 'crypto'
import fs from 'fs'
import http from 'http'

const MODE = process.argv[2] || 'on'
const BASE = 'http://localhost:3000'
const env = Object.fromEntries(fs.readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n').filter((l) => l.includes('=') && !l.startsWith('#')).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]))
let fails = 0
const ok = (c, m) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${m}`); if (!c) fails++ }
const sha = (v) => crypto.createHash('sha256').update(v).digest('hex')
const tok = (await (await fetch(`${BASE}/api/users/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: env.SEED_ADMIN_EMAIL, password: env.SEED_ADMIN_PASSWORD }) })).json()).token
const A = (p, init = {}) => fetch(`${BASE}/api${p}`, { ...init, headers: { Authorization: `JWT ${tok}`, 'content-type': 'application/json' } })

const capi = []
const server = http.createServer((req, res) => { let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => { capi.push({ url: req.url, body: b }); res.writeHead(200); res.end('{}') }) }).listen(9098)
const browser = await chromium.launch()
const gtmRequests = []
const ctx = async (opts = {}) => {
  const c = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...opts })
  await c.route(/googletagmanager\.com/, (route) => { gtmRequests.push(route.request().url()); route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }) })
  return c
}
const layer = (page) => page.evaluate(() => (window.dataLayer || []).map((x) => (x && typeof x === 'object' && !Array.isArray(x) && 'length' in x && typeof x[0] === 'string' ? Array.from(x) : x)))
const consentCalls = (l, kind) => l.filter((x) => Array.isArray(x) && x[0] === 'consent' && x[1] === kind)
const stored = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('shrim_consent') || 'null'))
const cookie = async (c, n) => (await c.cookies()).find((x) => x.name === n)?.value
const dialog = (page) => page.getByRole('dialog', { name: /Cookies on this website|इस वेबसाइट पर कुकीज़/ })

try {
  if (MODE === 'off') {
    const c = await ctx(); const page = await c.newPage()
    for (const u of ['/', '/hi', '/contact']) {
      await page.goto(BASE + u); await page.waitForTimeout(1200)
      const html = await page.content()
      ok(!html.includes('googletagmanager') && (await dialog(page).count()) === 0, `no GTM ID: ${u} loads no tag manager and shows no cookie banner`)
    }
    const l = await layer(page)
    ok(consentCalls(l, 'default').length === 0 && gtmRequests.length === 0, 'no GTM ID: no consent defaults pushed, no request to googletagmanager.com')
    ok((await page.getByRole('button', { name: 'Cookie settings' }).count()) === 0, 'no GTM ID: no "Cookie settings" link in the footer')
  } else {
    // ---- GTM + Consent Mode defaults
    const c = await ctx(); const page = await c.newPage()
    await page.goto(BASE + '/'); await page.waitForTimeout(1500)
    ok(gtmRequests.some((u) => u.includes('gtm.js?id=GTM-TEST123')), 'GTM loads with the ID from the environment')
    ok((await page.content()).includes('ns.html?id=GTM-TEST123'), 'GTM <noscript> fallback is present')
    let l = await layer(page)
    const def = consentCalls(l, 'default')[0]?.[2]
    ok(def && ['ad_storage', 'analytics_storage', 'ad_user_data', 'ad_personalization'].every((k) => def[k] === 'denied') && def.functionality_storage === 'granted', 'Consent Mode v2 default: analytics + ads (3 signals) denied')
    ok(l.findIndex((x) => Array.isArray(x) && x[1] === 'default') < l.findIndex((x) => x && x.event === 'gtm.js'), 'consent default is set before GTM starts')
    const d = dialog(page)
    ok(await d.isVisible() && (await d.innerText()).includes('analytics and advertising'), 'English cookie banner is shown by default')
    ok(consentCalls(l, 'update').length === 0 && (await stored(page)) === null, 'nothing is granted before the visitor chooses')
    await d.getByRole('button', { name: 'Accept all' }).click()
    l = await layer(page)
    const up = consentCalls(l, 'update').at(-1)?.[2]
    ok(up && ['ad_storage', 'analytics_storage', 'ad_user_data', 'ad_personalization'].every((k) => up[k] === 'granted'), 'Accept all: consent update -> granted')
    ok(l.some((x) => x && x.event === 'consent_update' && x.analytics_storage === 'granted' && x.ad_storage === 'granted'), 'consent_update event pushed')
    const s1 = await stored(page)
    ok(s1?.v === 1 && s1.analytics === true && s1.ads === true && (await cookie(c, 'shrim_ads_consent')) === '1' && (await d.count()) === 0, 'choice saved (localStorage + ads cookie) and banner closes')
    await page.reload(); await page.waitForTimeout(1000)
    l = await layer(page)
    ok((await dialog(page).count()) === 0 && l.findIndex((x) => Array.isArray(x) && x[1] === 'update') > l.findIndex((x) => Array.isArray(x) && x[1] === 'default'), 'next visit: no banner, earlier choice applied right after the defaults')
    // change my mind
    await page.getByRole('button', { name: 'Cookie settings' }).click()
    ok(await d.isVisible() && (await d.getByRole('checkbox').count()) === 3, 'footer "Cookie settings" reopens the banner with choices')
    await d.getByRole('checkbox', { name: /Advertising cookies/ }).uncheck()
    await d.getByRole('button', { name: 'Save my choice' }).click()
    l = await layer(page)
    const up2 = consentCalls(l, 'update').at(-1)?.[2]
    ok(up2?.analytics_storage === 'granted' && up2?.ad_storage === 'denied' && (await stored(page)).ads === false && (await cookie(c, 'shrim_ads_consent')) === '0', 'custom choice: analytics granted, ads denied, ads cookie 0')
    await c.close()

    // ---- reject path + Hindi + mobile layout
    const c2 = await ctx({ viewport: { width: 390, height: 800 }, hasTouch: true }); const p2 = await c2.newPage()
    await p2.goto(BASE + '/hi'); await p2.waitForTimeout(1200)
    const d2 = dialog(p2)
    ok(await d2.isVisible() && (await d2.innerText()).includes('कुकीज़') && (await d2.getByRole('button', { name: 'सब स्वीकार करें' }).isVisible()), 'Hindi cookie banner')
    const boxes = await p2.evaluate(() => {
      const dlg = document.querySelector('[role=dialog]'); const bar = document.querySelector('nav[aria-label="Quick contact"]')
      return { dlgBottom: dlg.getBoundingClientRect().bottom, barTop: bar.getBoundingClientRect().top, btns: [...dlg.querySelectorAll('button')].map((b) => b.getBoundingClientRect().height) }
    })
    ok(boxes.dlgBottom <= boxes.barTop + 1, `mobile: banner sits above the sticky bar (${Math.round(boxes.dlgBottom)} <= ${Math.round(boxes.barTop)})`)
    ok(boxes.btns.every((h) => h >= 43.5), 'mobile: banner buttons are >= 44px tall')
    await d2.getByRole('button', { name: 'ग़ैर-ज़रूरी मना करें' }).click()
    const l2 = await layer(p2)
    const dn = consentCalls(l2, 'update').at(-1)?.[2]
    ok(dn && dn.analytics_storage === 'denied' && dn.ad_storage === 'denied' && (await cookie(c2, 'shrim_ads_consent')) === '0', 'Reject: everything stays denied')
    await c2.close()

    // ---- GTM ID set in the admin overrides the environment
    await A('/globals/tracking', { method: 'POST', body: JSON.stringify({ gtmId: 'GTM-FROMADMIN1' }) })
    const html = await (await fetch(BASE + '/')).text()
    ok(html.includes('GTM-FROMADMIN1') && !html.includes('GTM-TEST123'), 'GTM ID from Admin > Tracking wins over the environment')
    await A('/globals/tracking', { method: 'POST', body: JSON.stringify({ gtmId: '' }) })

    // ---- generate_lead event_id + Meta Conversions API consent rules
    const lead = async (ip, phone, choose) => {
      const cx = await ctx({ extraHTTPHeaders: { 'x-forwarded-for': ip } }); const pg = await cx.newPage(); pg.setDefaultTimeout(30000)
      await pg.goto(BASE + '/contact'); await pg.waitForTimeout(800)
      if (choose) await dialog(pg).getByRole('button', { name: choose }).click()
      const form = pg.locator('form:has(input[type=checkbox])').last()
      await form.getByLabel('Your name', { exact: true }).fill('Tracking Tester'); await form.getByLabel('Mobile number', { exact: true }).fill(phone)
      await form.getByLabel('What do you need?', { exact: true }).selectOption('interior'); await form.getByRole('checkbox').check()
      await form.getByRole('button', { name: 'Request a call back' }).click(); await pg.waitForURL(/thank-you\?ref=/)
      const ev = (await layer(pg)).find((x) => x && x.event === 'generate_lead')
      await cx.close(); return ev
    }
    capi.length = 0
    const ev1 = await lead('10.1.1.1', '9100000001', 'Accept all')
    ok(/^SHR-\d{4}-\d{4}$/.test(ev1?.event_id || '') && ev1.form_name === 'quick_contact' && !JSON.stringify(ev1).includes('Tracking Tester') && !JSON.stringify(ev1).includes('9100000001'), `generate_lead carries event_id ${ev1?.event_id} and no personal data`)
    await new Promise((r) => setTimeout(r, 2500))
    const sent = capi.at(-1)
    const body = sent ? JSON.parse(sent.body) : null
    ok(capi.length === 1 && sent.url.startsWith('/1234/events?access_token=tok'), 'ads consent given: one Conversions API request')
    ok(body?.data?.[0]?.event_name === 'Lead' && body.data[0].event_id === ev1.event_id && body.data[0].user_data.ph[0] === sha('919100000001') && body.data[0].action_source === 'website', 'CAPI event: Lead, same event_id as the browser event, hashed phone')
    ok(!sent.body.includes('9100000001') && !sent.body.includes('Tracking Tester') && !/tester/i.test(JSON.stringify(body.data[0].user_data.fn)), 'CAPI payload has no plain-text phone or name')
    capi.length = 0
    await lead('10.1.1.2', '9100000002', 'Reject non-essential')
    await new Promise((r) => setTimeout(r, 2500))
    ok(capi.length === 0, 'ads consent refused: nothing sent to Meta')
    await lead('10.1.1.3', '9100000003', null)
    await new Promise((r) => setTimeout(r, 2000))
    ok(capi.length === 0, 'no choice made: nothing sent to Meta')
  }
} catch (e) {
  console.log('FAIL  test crashed:', String(e.message || e).split('\n')[0]); fails++
} finally {
  await A('/leads?where[phone][like]=9100000', { method: 'DELETE' })
  await A('/globals/tracking', { method: 'POST', body: JSON.stringify({ gtmId: '' }) })
  await browser.close(); server.close()
}
console.log(fails ? `\n${fails} FAILED` : '\nAll tracking end-to-end checks passed.')
process.exit(fails ? 1 : 0)
