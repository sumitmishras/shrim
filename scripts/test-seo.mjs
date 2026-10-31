// SEO checks against the running site: robots, sitemap, meta tags, JSON-LD (syntax + required fields), escaping.
//   node scripts/test-seo.mjs      (dev or production server on :3000, seeded admin)
import fs from 'fs'

const BASE = process.env.BASE_URL || 'http://localhost:3000'
const env = Object.fromEntries(fs.readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n').filter((l) => l.includes('=') && !l.startsWith('#')).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]))
let fails = 0
const ok = (c, m) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${m}`); if (!c) fails++ }
const get = async (p) => { const r = await fetch(BASE + p, { redirect: 'manual' }); return { status: r.status, type: r.headers.get('content-type') || '', text: await r.text() } }
const ld = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]))
const meta = (html, key) => (html.match(new RegExp(`<meta (?:property|name)="${key}" content="([^"]*)"`)) || [])[1]
const tok = (await (await fetch(`${BASE}/api/users/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: env.SEED_ADMIN_EMAIL, password: env.SEED_ADMIN_PASSWORD }) })).json()).token
const A = (p, init = {}) => fetch(`${BASE}/api${p}`, { ...init, headers: { Authorization: `JWT ${tok}`, 'content-type': 'application/json' } }).then((r) => r.json())

// a published guide with a hostile title, to test Article markup and escaping
const lex = (t) => ({ root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children: [{ type: 'paragraph', version: 1, direction: 'ltr', format: '', indent: 0, textFormat: 0, children: [{ type: 'text', version: 1, text: t, detail: 0, format: 0, mode: 'normal', style: '' }] }] } })
const g = (await A('/guides', { method: 'POST', body: JSON.stringify({ title: 'SEO TEST </script><script>alert(1)</script>', slug: 'seo-test-guide', status: 'published', publishedAt: new Date().toISOString(), content: lex('Hello.') }) })).doc
try {
  // robots + sitemap
  const robots = (await get('/robots.txt')).text
  ok(/Disallow: \/admin/.test(robots) && /Disallow: \/thank-you/.test(robots) && /Disallow: \/hi\/thank-you/.test(robots) && /Sitemap: .*\/sitemap\.xml/.test(robots), 'robots.txt blocks /admin and /thank-you (both languages) and points to the sitemap')
  const sm = await get('/sitemap.xml')
  const locs = [...sm.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  const path = (u) => new URL(u).pathname
  const paths = locs.map(path)
  ok(sm.status === 200 && /xml/.test(sm.type) && locs.length >= 26, `sitemap.xml: ${locs.length} URLs`)
  ok(paths.includes('/') && paths.includes('/hi') && paths.includes('/services/house-construction') && paths.includes('/hi/services/interior') && paths.includes('/privacy-policy') && paths.includes('/hi/terms'), 'sitemap has both languages for pages and services')
  ok(paths.includes('/projects/sample-project-1') && paths.includes('/seo-test-guide'.replace('/', '/guides/')), 'sitemap has published projects and guides')
  ok(!paths.some((p) => p.includes('thank-you')) && !paths.some((p) => p.startsWith('/admin')), 'sitemap leaves out /thank-you and /admin')
  ok((sm.text.match(/hreflang="hi"/g) || []).length === locs.length && (sm.text.match(/hreflang="en"/g) || []).length === locs.length, 'every sitemap URL has hreflang alternates')
  ok(!paths.includes('/guides/' + 'draft-one'), 'draft content is not in the sitemap')

  // meta tags
  const home = (await get('/')).text
  ok(meta(home, 'og:image')?.startsWith('http') && meta(home, 'og:image').endsWith('/og-default.jpg') && meta(home, 'twitter:card') === 'summary_large_image', 'home: absolute Open Graph image + Twitter card')
  ok(meta(home, 'og:locale') === 'en_IN' && meta((await get('/hi')).text, 'og:locale') === 'hi_IN', 'og:locale per language')
  const og = await fetch(BASE + '/og-default.jpg')
  ok(og.status === 200 && og.headers.get('content-type') === 'image/jpeg', 'default OG image is served')
  const proj = (await get('/projects/sample-project-1')).text
  ok(/og:image" content="http[^"]*\/api\/media\/file\/[^"]*after/.test(proj), 'project page uses its own photo as the Open Graph image')
  ok((await get('/thank-you')).text.includes('noindex'), '/thank-you is noindex')
  ok((await fetch(BASE + '/icon.svg')).status === 200 && (await fetch(BASE + '/apple-icon.png')).status === 200 && (await fetch(BASE + '/logo.svg')).status === 200, 'favicon, apple icon and logo are served')

  // JSON-LD
  const pages = ['/', '/hi', '/services', '/services/interior', '/hi/services/interior', '/projects', '/projects/sample-project-1', '/about', '/contact', '/commercial', '/privacy-policy', '/guides', '/guides/seo-test-guide', '/hi/guides/seo-test-guide', '/cost-calculator', '/site-visit']
  let allValid = true
  const byPage = {}
  for (const p of pages) {
    const html = (await get(p)).text
    try { byPage[p] = ld(html) } catch (e) { allValid = false; console.log('   invalid JSON-LD on', p, e.message) }
  }
  ok(allValid, `JSON-LD parses as valid JSON on ${pages.length} pages`)
  const types = (p) => (byPage[p] || []).map((x) => x['@type'])
  ok(pages.every((p) => (byPage[p] || []).every((x) => x['@context'] === 'https://schema.org')), 'every block has @context schema.org')
  const orgs = pages.map((p) => (byPage[p] || []).find((x) => x['@type'] === 'GeneralContractor'))
  ok(orgs.every(Boolean), 'GeneralContractor on every page')
  const o = orgs[0]
  ok(o.name === 'SHRIM Enterprises' && o.taxID === '09BAYPT7371Q2Z3' && o.address.postalCode === '226028' && o.address.addressRegion === 'Uttar Pradesh' && o.address.addressCountry === 'IN' && o.areaServed.length >= 8 && o.url && o.logo, 'organisation: name, GSTIN, GST address, areas served, url, logo')
  ok(types('/').includes('FAQPage') && byPage['/'].find((x) => x['@type'] === 'FAQPage').mainEntity.length === 10, 'home: FAQPage with the 10 general questions')
  ok(types('/services/interior').includes('Service') && types('/services/interior').includes('FAQPage') && types('/services/interior').includes('BreadcrumbList'), 'service page: Service + FAQPage + BreadcrumbList')
  const sv = byPage['/services/interior'].find((x) => x['@type'] === 'Service')
  ok(sv.provider['@id'] === o['@id'] && sv.areaServed.name === 'Lucknow' && byPage['/services/interior'].find((x) => x['@type'] === 'FAQPage').mainEntity.length === 4, 'Service provider is the organisation; 4 service FAQs')
  const hs = byPage['/hi/services/interior'].find((x) => x['@type'] === 'Service')
  ok(hs.url.includes('/hi/services/interior') && /[\u0900-\u097F]/.test(hs.name) && byPage['/hi/services/interior'].find((x) => x['@type'] === 'BreadcrumbList').itemListElement[1].item.includes('/hi/services'), 'Hindi page: Hindi name and /hi URLs in markup')
  const bc = byPage['/projects/sample-project-1'].find((x) => x['@type'] === 'BreadcrumbList')
  ok(bc.itemListElement.length === 3 && bc.itemListElement.map((i) => i.position).join() === '1,2,3', 'project page: 3-level BreadcrumbList')
  ok(pages.filter((p) => p !== '/' && p !== '/hi').every((p) => types(p).includes('BreadcrumbList')), 'BreadcrumbList on every inner page')
  const art = byPage['/guides/seo-test-guide'].find((x) => x['@type'] === 'Article')
  ok(art && art.author.name === 'Rahul Tripathi' && art.publisher['@id'] === o['@id'] && !!art.datePublished && !!art.dateModified && art.mainEntityOfPage.includes('/guides/seo-test-guide') && !!art.image, 'guide: Article with author, publisher, dates, image')
  const raw = (await get('/guides/seo-test-guide')).text
  ok(!/<script type="application\/ld\+json">[^<]*<\/script><script>alert/.test(raw) && raw.includes('\\u003c/script>'), 'JSON-LD escapes "<" so content cannot break out of the script tag')
  ok(!/telephone/.test(JSON.stringify(o)) || /\+91\d{10}/.test(o.telephone), 'no placeholder phone in the markup')
} catch (e) {
  console.log('FAIL  test crashed:', String(e.message || e).split('\n')[0]); fails++
} finally {
  await A('/guides?where[slug][equals]=seo-test-guide', { method: 'DELETE' })
}
console.log(fails ? `\n${fails} FAILED` : '\nAll SEO checks passed.')
process.exit(fails ? 1 : 0)
