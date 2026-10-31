// Admin at phone width: horizontal overflow + small tap targets on the main admin screens.
//   node scripts/audit-admin.mjs [width]     (dev server must be running)
import { chromium } from 'playwright'
import fs from 'fs'

const W = Number(process.argv[2] || 360)
const BASE = 'http://localhost:3000'
const env = Object.fromEntries(fs.readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n').filter((l) => l.includes('=') && !l.startsWith('#')).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]))
const tok = (await (await fetch(`${BASE}/api/users/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: env.SEED_ADMIN_EMAIL, password: env.SEED_ADMIN_PASSWORD }) })).json()).token
const A = (p, init = {}) => fetch(`${BASE}/api${p}`, { ...init, headers: { Authorization: `JWT ${tok}`, 'content-type': 'application/json' } }).then((r) => r.json())
const lead = (await A('/leads', { method: 'POST', body: JSON.stringify({ name: 'AUDIT Lead', phone: '9000000099', status: 'new' }) })).doc
const svc = (await A('/services?limit=1&depth=0')).docs[0]
const proj = (await A('/projects?limit=1&depth=0')).docs[0]

const pages = ['/admin', '/admin/collections/leads', '/admin/collections/leads/create', `/admin/collections/leads/${lead.id}`, '/admin/collections/projects', proj && `/admin/collections/projects/${proj.id}`, '/admin/collections/projects/create',
  '/admin/collections/services', svc && `/admin/collections/services/${svc.id}`, '/admin/collections/media', '/admin/collections/testimonials', '/admin/collections/guides', '/admin/collections/faqs', '/admin/collections/pages', '/admin/collections/users',
  '/admin/globals/siteSettings', '/admin/globals/rates', '/admin/globals/aboutPage', '/admin/globals/tracking', '/admin/account'].filter(Boolean)

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: W, height: 800 }, hasTouch: true })
const page = await ctx.newPage(); page.setDefaultTimeout(30000)
await page.goto(`${BASE}/admin/login`)
await page.locator('#field-email').fill(env.SEED_ADMIN_EMAIL); await page.locator('#field-password').fill(env.SEED_ADMIN_PASSWORD)
await page.locator('button[type=submit]').click(); await page.waitForURL(/\/admin(\/)?$/)

let bad = 0
for (const p of pages) {
  await page.goto(BASE + p, { waitUntil: 'load' }); await page.waitForTimeout(1200)
  const r = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth
    const over = document.documentElement.scrollWidth > vw + 1
    const who = over ? [...document.querySelectorAll('body *')].filter((e) => { const b = e.getBoundingClientRect(); return b.width && b.right > vw + 1 && getComputedStyle(e).position !== 'fixed' }).slice(0, 4).map((e) => e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0] + ' →' + Math.round(e.getBoundingClientRect().right)) : []
    return { over, width: document.documentElement.scrollWidth, who }
  })
  if (r.over) { bad++; console.log(`OVERFLOW ${p}  scrollWidth ${r.width}  ${r.who.join(' | ')}`) } else console.log(`ok       ${p}`)
}
await A('/leads?where[phone][like]=90000000', { method: 'DELETE' })
await browser.close()
console.log(bad ? `\n${bad} page(s) overflow at ${W}px` : `\nNo overflow at ${W}px on ${pages.length} admin pages.`)
process.exit(bad ? 1 : 0)
