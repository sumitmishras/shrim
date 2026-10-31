// Layout audit: horizontal overflow, small tap targets, sticky-bar overlap, plus every step of the site-visit form.
// Usage: node scripts/audit-layout.mjs [baseUrl] [--only=substring]   (dev server must be running)
import { chromium } from 'playwright'

const base = process.argv.find((a) => a.startsWith('http')) || 'http://localhost:3000'
const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7)
const paths = [
  '/', '/services', '/services/house-construction', '/services/interior', '/services/renovation', '/services/fabrication', '/services/turnkey',
  '/commercial', '/projects', '/projects/sample-project-1', '/about', '/contact', '/guides', '/privacy-policy', '/terms',
  '/site-visit', '/site-visit?service=interior', '/cost-calculator', '/cost-calculator?area=1800&floors=2', '/thank-you?ref=SHR-2026-0001', '/this-page-does-not-exist',
].filter((p) => !only || p.includes(only))
const widths = [360, 768, 1280]

// Runs inside the page.
const measure = () => {
  const vw = document.documentElement.clientWidth
  const out = { overflow: [], small: [] }
  if (document.documentElement.scrollWidth > vw + 1) {
    for (const el of document.querySelectorAll('body *')) {
      const b = el.getBoundingClientRect()
      if (b.width && b.right > vw + 1 && getComputedStyle(el).position !== 'fixed') { out.overflow.push(el.tagName.toLowerCase() + '.' + String(el.className).slice(0, 50) + ' right=' + Math.round(b.right)); if (out.overflow.length > 4) break }
    }
    if (!out.overflow.length) out.overflow.push('scrollWidth ' + document.documentElement.scrollWidth + ' > ' + vw)
  }
  const sel = 'a[href], button, summary, select, input:not([type=hidden]):not([type=range]), textarea'
  for (const el of document.querySelectorAll(sel)) {
    if (el.closest('[aria-hidden="true"]')) continue // honeypot
    // Checkboxes / radios are tapped through their label.
    let t = el
    if (el.tagName === 'INPUT' && ['checkbox', 'radio'].includes(el.type)) t = el.labels?.[0] || el.closest('label') || el
    const cs = getComputedStyle(t)
    const b = t.getBoundingClientRect()
    if (!b.width || !b.height || cs.visibility === 'hidden' || cs.display === 'none') continue
    if (b.width <= 2 && b.height <= 2) continue // sr-only skip link
    const inText = el.tagName === 'A' && cs.display === 'inline' && el.closest('p, li, dd, blockquote, h1, h2, h3, label') && el.parentElement && el.parentElement.textContent.trim() !== el.textContent.trim()
    if (inText) continue
    if (b.height < 43.5 || b.width < 43.5) out.small.push(`${el.tagName.toLowerCase()} "${(t.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}" ${Math.round(b.width)}x${Math.round(b.height)}`)
  }
  return out
}

const problems = []
const report = (tag, r) => {
  if (r.overflow.length) problems.push(`${tag}: OVERFLOW ${r.overflow.join(' | ')}`)
  for (const s of [...new Set(r.small)].slice(0, 6)) problems.push(`${tag}: SMALL TAP ${s}`)
}

const browser = await chromium.launch()
for (const lang of ['', '/hi']) {
  for (const w of widths) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 800 }, hasTouch: w < 1024 })
    const page = await ctx.newPage()
    for (const p of paths) {
      const tag = `${w}px ${lang || '/en'}${p}`
      const res = await page.goto(base + lang + (p === '/' ? '' : p), { waitUntil: 'load' }).catch((e) => ({ status: () => 'ERR ' + e.message }))
      const status = res.status()
      if (status !== 200 && !(p.includes('does-not-exist') && status === 404)) problems.push(`${tag}: HTTP ${status}`)
      await page.waitForTimeout(250)
      report(tag, await page.evaluate(measure))

      if (w < 1024) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        await page.waitForTimeout(150)
        const o = await page.evaluate(() => {
          const bar = document.querySelector('nav[aria-label="Quick contact"]')
          const last = document.querySelector('footer > div:last-child')
          if (!bar || !last) return null
          return { barTop: Math.round(bar.getBoundingClientRect().top), contentBottom: Math.round(last.getBoundingClientRect().bottom) }
        })
        if (o && o.contentBottom > o.barTop + 1) problems.push(`${tag}: STICKY BAR covers footer end (content bottom ${o.contentBottom} > bar top ${o.barTop})`)
      }
    }

    // Site-visit form: every step, plus the error state of step 1, plus calculator result with the lead form.
    if (!only || 'site-visit'.includes(only) || only === 'form') {
      await page.goto(`${base}${lang}/site-visit`, { waitUntil: 'load' })
      await page.waitForTimeout(300)
      const next = page.locator('form button[type=button]').filter({ hasText: /→/ }).last()
      await next.click() // nothing chosen yet: shows the error state
      await page.waitForTimeout(150)
      report(`${w}px ${lang || '/en'}/site-visit [step 1 errors]`, await page.evaluate(measure))
      await page.locator('#main fieldset label').first().click()
      await next.click(); await page.waitForTimeout(150)
      report(`${w}px ${lang || '/en'}/site-visit [step 2]`, await page.evaluate(measure))
      await page.locator('select').nth(1).selectOption({ index: 1 })
      await page.locator('#main fieldset label').first().click()
      await page.locator('input[inputmode=numeric]').first().fill('1800')
      await next.click(); await page.waitForTimeout(150)
      report(`${w}px ${lang || '/en'}/site-visit [step 3]`, await page.evaluate(measure))
      await page.locator('#main fieldset label').first().click()
      await next.click(); await page.waitForTimeout(150)
      report(`${w}px ${lang || '/en'}/site-visit [step 4]`, await page.evaluate(measure))
      await page.locator('form button[type=submit]').click() // empty submit: error state of step 4
      await page.waitForTimeout(200)
      report(`${w}px ${lang || '/en'}/site-visit [step 4 errors]`, await page.evaluate(measure))
    }
    await ctx.close()
  }
}
await browser.close()

// Group identical problems across pages so the report stays readable.
const groups = new Map()
for (const line of new Set(problems)) {
  const [tag, ...rest] = line.split(': ')
  const key = rest.join(': ')
  const g = groups.get(key) || { n: 0, ex: [] }
  g.n++; if (g.ex.length < 3) g.ex.push(tag)
  groups.set(key, g)
}
for (const [k, g] of groups) console.log(`${g.n}x  ${k}\n      e.g. ${g.ex.join(', ')}`)
console.log(groups.size ? `\n${groups.size} distinct problem(s), ${new Set(problems).size} total.` : 'No layout problems found.')
process.exit(groups.size ? 1 : 0)
