// Layout audit: horizontal overflow, small tap targets, sticky-bar overlap.
// Usage: node scripts/audit-layout.mjs [baseUrl] [--shots=dir]   (dev server must be running)
import { chromium } from 'playwright'
import fs from 'fs'

const base = process.argv.find((a) => a.startsWith('http')) || 'http://localhost:3000'
const shots = process.argv.find((a) => a.startsWith('--shots='))?.slice(8)
const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7)
const paths = [
  '/', '/services', '/services/house-construction', '/services/interior', '/services/renovation', '/services/fabrication', '/services/turnkey',
  '/commercial', '/projects', '/projects/sample-project-1', '/about', '/contact', '/guides', '/privacy-policy', '/terms',
  '/site-visit', '/cost-calculator', '/thank-you', '/this-page-does-not-exist',
].filter((p) => !only || p.includes(only))
const widths = [360, 768, 1280]

const browser = await chromium.launch()
const problems = []
for (const lang of ['', '/hi']) {
  for (const w of widths) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 800 }, hasTouch: w < 1024, deviceScaleFactor: 1 })
    const page = await ctx.newPage()
    for (const p of paths) {
      const url = base + (lang + p === '' ? '/' : lang + (p === '/' ? '' : p))
      const tag = `${w}px ${lang || '/en'}${p}`
      const res = await page.goto(url, { waitUntil: 'load' }).catch((e) => ({ status: () => 'ERR ' + e.message }))
      const status = res.status()
      if (status !== 200 && !(p.includes('does-not-exist') && status === 404)) problems.push(`${tag}: HTTP ${status}`)
      await page.waitForTimeout(250)
      const r = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth
        const out = { overflow: [], small: [], bar: null }
        if (document.documentElement.scrollWidth > vw + 1) {
          for (const el of document.querySelectorAll('body *')) {
            const b = el.getBoundingClientRect()
            if (b.width && b.right > vw + 1 && getComputedStyle(el).position !== 'fixed') { out.overflow.push(el.tagName.toLowerCase() + '.' + String(el.className).slice(0, 50) + ' right=' + Math.round(b.right)); if (out.overflow.length > 4) break }
          }
          if (!out.overflow.length) out.overflow.push('scrollWidth ' + document.documentElement.scrollWidth + ' > ' + vw)
        }
        const sel = 'a[href], button, summary, select, input:not([type=hidden]):not([type=range]), textarea'
        for (const el of document.querySelectorAll(sel)) {
          const cs = getComputedStyle(el)
          const b = el.getBoundingClientRect()
          if (!b.width || !b.height || cs.visibility === 'hidden' || cs.display === 'none') continue
          if (b.width <= 2 && b.height <= 2) continue // sr-only skip link
          const inText = el.tagName === 'A' && cs.display === 'inline' && el.closest('p, li, dd, blockquote, h1, h2, h3') && el.parentElement && el.parentElement.textContent.trim() !== el.textContent.trim()
          if (inText) continue
          if (b.height < 43.5 || b.width < 43.5) out.small.push(`${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}" ${Math.round(b.width)}x${Math.round(b.height)}`)
        }
        return out
      })
      if (r.overflow.length) problems.push(`${tag}: OVERFLOW ${r.overflow.join(' | ')}`)
      for (const s of [...new Set(r.small)].slice(0, 6)) problems.push(`${tag}: SMALL TAP ${s}`)

      // Sticky bar must not cover the end of the page
      if (w < 1024) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        await page.waitForTimeout(150)
        const o = await page.evaluate(() => {
          const bar = document.querySelector('nav[aria-label="Quick contact"]')
          const foot = document.querySelector('footer')
          if (!bar || !foot) return null
          const bt = bar.getBoundingClientRect().top
          const last = foot.querySelector(':scope > div:last-child')
          return { barTop: Math.round(bt), contentBottom: Math.round(last.getBoundingClientRect().bottom), barH: Math.round(bar.getBoundingClientRect().height) }
        })
        if (o && o.contentBottom > o.barTop + 1) problems.push(`${tag}: STICKY BAR covers footer end (content bottom ${o.contentBottom} > bar top ${o.barTop})`)
        if (shots && (p === '/' || p === '/services/interior' || p === '/projects/sample-project-1')) {
          fs.mkdirSync(shots, { recursive: true })
          await page.evaluate(() => window.scrollTo(0, 0))
          await page.screenshot({ path: `${shots}/${w}${lang.replace('/', '-') || '-en'}${p.replace(/\//g, '_') || '_home'}.png`, fullPage: true })
        }
      }
    }
    await ctx.close()
  }
}
await browser.close()
// Group identical problems across pages so the report stays readable.
const groups = new Map()
for (const line of new Set(problems)) {
  const [tag, ...rest] = line.split(': ')
  const key = rest.join(': ').replace(/ \d+x\d+$/, (m) => m)
  const g = groups.get(key) || { n: 0, ex: [] }
  g.n++; if (g.ex.length < 3) g.ex.push(tag)
  groups.set(key, g)
}
for (const [k, g] of groups) console.log(`${g.n}x  ${k}\n      e.g. ${g.ex.join(', ')}`)
console.log(groups.size ? `\n${groups.size} distinct problem(s), ${new Set(problems).size} total.` : 'No layout problems found.')
process.exit(groups.size ? 1 : 0)
