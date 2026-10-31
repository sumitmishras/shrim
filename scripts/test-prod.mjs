// Production-behaviour checks. Run against `npm run build && npm start` (or any running server):
//   node scripts/test-prod.mjs
// Covers: cache clears on save, security headers + CSP in a real browser (site and admin), admin login brake,
// upload limits, and the hero video / image fallback.
import { chromium } from 'playwright'
import fs from 'fs'
import os from 'os'
import path from 'path'

const BASE = process.env.BASE_URL || 'http://localhost:3000'
const env = Object.fromEntries(fs.readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n').filter((l) => l.includes('=') && !l.startsWith('#')).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]))
let fails = 0
const ok = (c, m) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${m}`); if (!c) fails++ }
const tok = (await (await fetch(`${BASE}/api/users/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: env.SEED_ADMIN_EMAIL, password: env.SEED_ADMIN_PASSWORD }) })).json()).token
const A = (p, init = {}) => fetch(`${BASE}/api${p}`, { ...init, headers: { Authorization: `JWT ${tok}`, ...(init.body && typeof init.body === 'string' ? { 'content-type': 'application/json' } : {}), ...(init.headers || {}) } })
const J = async (p, init) => (await A(p, init)).json()
const text = async (p, init) => (await fetch(BASE + p, init)).text()
const browser = await chromium.launch()
const cleanup = []

try {
  // ===== 1. Cache + instant refresh
  const r1 = await fetch(BASE + '/services/interior'); await r1.text()
  const r2 = await fetch(BASE + '/services/interior'); await r2.text()
  ok(['HIT', 'STALE'].includes(r2.headers.get('x-nextjs-cache')), `pages are cached (x-nextjs-cache: ${r2.headers.get('x-nextjs-cache')})`)
  const svc = (await J('/services?where[slug][equals]=interior&limit=1&depth=0')).docs[0]
  const orig = svc.title
  await J(`/services/${svc.id}`, { method: 'PATCH', body: JSON.stringify({ title: 'Interior Works CACHE-TEST' }) })
  cleanup.push(() => J(`/services/${svc.id}`, { method: 'PATCH', body: JSON.stringify({ title: orig }) }))
  const t0 = Date.now()
  const h1 = await text('/services/interior')
  ok(h1.includes('Interior Works CACHE-TEST'), `editing a service shows on its page immediately (${Date.now() - t0} ms after save)`)
  ok((await text('/')).includes('Interior Works CACHE-TEST') && (await text('/services')).includes('Interior Works CACHE-TEST'), 'the new title also shows on the home page and the services list')
  await J(`/services/${svc.id}`, { method: 'PATCH', body: JSON.stringify({ title: orig }) })
  ok(!(await text('/services/interior')).includes('CACHE-TEST'), 'reverting is also immediate')
  // hiding a project
  const proj = (await J('/projects?where[slug][equals]=sample-project-1&limit=1&depth=0')).docs[0]
  if (proj) {
    await text('/projects/sample-project-1')
    await J(`/projects/${proj.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'draft' }) })
    cleanup.push(() => J(`/projects/${proj.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'published' }) }))
    ok((await fetch(BASE + '/projects/sample-project-1')).status === 404, 'unpublishing a project removes its page at once')
    await J(`/projects/${proj.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'published' }) })
    ok((await fetch(BASE + '/projects/sample-project-1')).status === 200, 'publishing brings it back at once')
  }

  // ===== 2. Security headers
  const hd = (await fetch(BASE + '/')).headers
  const csp = hd.get('content-security-policy') || ''
  ok(/default-src 'self'/.test(csp) && /frame-ancestors 'none'/.test(csp) && /object-src 'none'/.test(csp) && /upgrade-insecure-requests/.test(csp) && !/unsafe-eval/.test(csp), 'CSP present (no unsafe-eval in production)')
  ok(hd.get('x-frame-options') === 'DENY' && hd.get('x-content-type-options') === 'nosniff' && /max-age=31536000/.test(hd.get('strict-transport-security') || '') && !!hd.get('referrer-policy') && /camera=\(\)/.test(hd.get('permissions-policy') || ''), 'X-Frame-Options, nosniff, HSTS, Referrer-Policy, Permissions-Policy')
  ok(!hd.get('x-powered-by'), 'X-Powered-By is hidden')
  ok(!!(await fetch(BASE + '/admin/login')).headers.get('content-security-policy') && !!(await fetch(BASE + '/api/users/me')).headers.get('x-frame-options'), 'headers are also on /admin and /api')

  // ===== 3. CSP violations in a real browser (site + admin)
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  await ctx.addInitScript(() => { window.__csp = []; document.addEventListener('securitypolicyviolation', (e) => window.__csp.push(`${e.violatedDirective} ${e.blockedURI}`)) })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 120)))
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|ERR_|net::/.test(m.text())) errors.push(m.text().slice(0, 120)) })
  const visit = async (u) => { await page.goto(BASE + u, { waitUntil: 'load' }); await page.waitForTimeout(900); return page.evaluate(() => window.__csp) }
  const siteUrls = ['/', '/hi', '/services/interior', '/projects/sample-project-1', '/contact', '/site-visit', '/cost-calculator?area=1800&floors=2', '/about', '/privacy-policy']
  const bad = []
  for (const u of siteUrls) { const v = await visit(u); if (v.length) bad.push(`${u}: ${v.slice(0, 2)}`) }
  ok(bad.length === 0, `no CSP violations on ${siteUrls.length} public pages (incl. the Google Map)${bad.length ? ' -> ' + bad : ''}`)
  await page.goto(BASE + '/admin/login'); await page.locator('#field-email').fill(env.SEED_ADMIN_EMAIL); await page.locator('#field-password').fill(env.SEED_ADMIN_PASSWORD); await page.locator('button[type=submit]').click(); await page.waitForURL(/\/admin(\/)?$/)
  const lead = (await J('/leads', { method: 'POST', body: JSON.stringify({ name: 'PROD Lead', phone: '9000000077' }) })).doc
  cleanup.push(() => A('/leads?where[phone][like]=90000000', { method: 'DELETE' }))
  const adminBad = []
  for (const u of ['/admin', '/admin/collections/leads', `/admin/collections/leads/${lead.id}`, '/admin/collections/media', '/admin/collections/projects/create', '/admin/globals/siteSettings']) {
    const v = await visit(u); if (v.length) adminBad.push(`${u}: ${v.slice(0, 2)}`)
  }
  ok(adminBad.length === 0, `no CSP violations in the admin (dashboard, leads, lead detail, media, project editor, settings)${adminBad.length ? ' -> ' + adminBad : ''}`)
  ok((await page.locator('.shrim-dash, .shrim-filters, .shrim-actions').count()) >= 0 && errors.length === 0, `no JavaScript errors in the browser console${errors.length ? ' -> ' + errors.slice(0, 3) : ''}`)
  const dashOk = await page.goto(BASE + '/admin').then(() => page.locator('.shrim-dash').waitFor().then(() => true).catch(() => false))
  ok(dashOk, 'custom dashboard renders in the production build')
  await ctx.close()

  // ===== 4. Admin login brake
  const tryLogin = (ip, email, password) => fetch(`${BASE}/api/users/login`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': ip }, body: JSON.stringify({ email, password }) })
  const codes = []
  for (let i = 0; i < 11; i++) codes.push((await tryLogin('10.77.7.7', 'nobody@example.com', 'wrong-password')).status)
  ok(codes.slice(0, 10).every((c) => c === 401) && codes[10] === 429, `login: 10 wrong attempts -> 401, the 11th -> 429 (${codes.join(',')})`)
  const blocked = await tryLogin('10.77.7.7', env.SEED_ADMIN_EMAIL, env.SEED_ADMIN_PASSWORD)
  ok(blocked.status === 429 && blocked.headers.get('retry-after') === '900', 'login: a blocked IP stays blocked even with the right password (Retry-After 900)')
  const other = await tryLogin('10.77.7.8', env.SEED_ADMIN_EMAIL, env.SEED_ADMIN_PASSWORD)
  ok(other.status === 200 && !!(await other.json()).token, 'login: other IPs are not affected and a correct login works')

  // ===== 5. Upload limits
  const rec = await browser.newContext({ viewport: { width: 640, height: 360 }, recordVideo: { dir: os.tmpdir(), size: { width: 640, height: 360 } } })
  const rp = await rec.newPage(); await rp.setContent('<body style="margin:0;background:#c8792b"><h1 style="font:700 60px sans-serif;color:#1c1a17;padding:90px">SHRIM</h1></body>'); await rp.waitForTimeout(1800)
  const vpath = await rp.video().path(); await rec.close()
  const vbytes = fs.readFileSync(vpath)
  const up = async (name, mime, bytes, alt = 'PROD upload test') => {
    const fd = new FormData(); fd.append('_payload', JSON.stringify({ alt })); fd.append('file', new Blob([bytes], { type: mime }), name)
    return fetch(`${BASE}/api/media`, { method: 'POST', headers: { Authorization: `JWT ${tok}` }, body: fd })
  }
  const big = await up('big.webm', 'video/webm', Buffer.concat([vbytes, Buffer.alloc(11 * 1024 * 1024)]))
  const bigJ = await big.json()
  ok(big.status === 400 && /under 10 MB/.test(JSON.stringify(bigJ)), `11 MB video is refused with a clear message (${big.status})`)
  const small = await up('small.webm', 'video/webm', vbytes)
  const smallJ = await small.json()
  ok(small.status === 201, `a small video is accepted (${small.status})`)
  if (smallJ.doc?.id) await A(`/media/${smallJ.doc.id}`, { method: 'DELETE' })
  const sharp = (await import('sharp')).default
  const wide = await sharp({ create: { width: 4200, height: 2800, channels: 3, background: '#c8792b' } }).jpeg().toBuffer()
  const im = await up('wide.jpg', 'image/jpeg', wide)
  const imJ = await im.json()
  ok(im.status === 201 && imJ.doc.width <= 2400 && imJ.doc.width >= 2000, `4200px photo is stored at ${imJ.doc?.width}px wide (max 2400)`)
  if (imJ.doc?.id) await A(`/media/${imJ.doc.id}`, { method: 'DELETE' })

  // ===== 6. Hero video + image fallback
  const posterBytes = await sharp({ create: { width: 1600, height: 900, channels: 3, background: '#9c5817' } }).jpeg().toBuffer()
  const vRes = await (await up('hero.webm', 'video/webm', vbytes, 'PROD hero video')).json()
  const pRes = await (await up('poster.jpg', 'image/jpeg', posterBytes, 'PROD hero poster')).json()
  cleanup.push(async () => { for (const d of [vRes.doc, pRes.doc]) if (d?.id) await A(`/media/${d.id}`, { method: 'DELETE' }) })
  const prevHero = (await J('/globals/siteSettings?depth=0')).hero || {}
  cleanup.push(() => J('/globals/siteSettings', { method: 'POST', body: JSON.stringify({ hero: { video: prevHero.video ?? null, poster: prevHero.poster ?? null, image: prevHero.image ?? null } }) }))
  ok(!!vRes.doc?.id && !!pRes.doc?.id, `hero video (${(vbytes.length / 1024).toFixed(0)} KB webm) and poster uploaded`)
  await J('/globals/siteSettings', { method: 'POST', body: JSON.stringify({ hero: { video: vRes.doc.id, poster: pRes.doc.id, image: null } }) })
  const hp = await (await browser.newContext({ viewport: { width: 390, height: 800 } })).newPage()
  await hp.goto(BASE + '/'); await hp.waitForTimeout(2500)
  const v = await hp.evaluate(() => { const e = document.querySelector('section video'); return e && { muted: e.muted, loop: e.loop, autoplay: e.autoplay, playsInline: e.playsInline, poster: e.getAttribute('poster'), preload: e.preload, src: e.currentSrc, t: e.currentTime, paused: e.paused } })
  ok(v && v.muted && v.loop && v.autoplay && v.playsInline && /\/api\/media\/file\//.test(v.poster || '') && v.preload === 'metadata', 'hero <video>: muted, loop, autoplay, playsinline, poster, preload=metadata')
  ok(v && /hero/.test(v.src) && !v.paused, `hero video plays (currentTime ${v?.t?.toFixed(2)}s)`)
  ok(await hp.evaluate(() => !!document.querySelector('section img[src*="_next/image"]')), 'poster image is rendered underneath (shown while the video loads, and for reduced motion)')
  const rm = await (await browser.newContext({ viewport: { width: 390, height: 800 }, reducedMotion: 'reduce' })).newPage()
  await rm.goto(BASE + '/'); await rm.waitForTimeout(800)
  ok(await rm.evaluate(() => { const e = document.querySelector('section video'); return !e || getComputedStyle(e).display === 'none' }), 'reduced motion: the video is hidden and the poster image shows instead')
  // image-only fallback
  await J('/globals/siteSettings', { method: 'POST', body: JSON.stringify({ hero: { video: null, poster: null, image: pRes.doc.id } }) })
  const fb = await text('/')
  ok(!/<video/.test(fb.split('</section>')[0]) && /_next\/image[^"]*poster/.test(fb.split('</section>')[0]), 'no video set: hero falls back to the image')
  await J('/globals/siteSettings', { method: 'POST', body: JSON.stringify({ hero: { video: null, poster: null, image: null } }) })
  ok(!/<video/.test((await text('/')).split('</section>')[0]), 'nothing set: hero shows the dark gradient with no broken media')
} catch (e) {
  console.log('FAIL  test crashed:', String(e.message || e).split('\n')[0]); fails++
} finally {
  for (const c of cleanup.reverse()) { try { await c() } catch {} }
  await browser.close()
}
console.log(fails ? `\n${fails} FAILED` : '\nAll production checks passed.')
process.exit(fails ? 1 : 0)
