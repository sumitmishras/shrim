// Accessibility audit: axe-core (WCAG 2.1 A + AA + best practices) in light and dark mode, plus a keyboard-focus check.
//   node scripts/audit-a11y.mjs [baseUrl] [--only=substring]
import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'

const base = process.argv.find((a) => a.startsWith('http')) || 'http://localhost:3000'
const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7)
const paths = [
  '/', '/services', '/services/house-construction', '/services/fabrication', '/commercial', '/projects', '/projects/sample-project-1', '/about', '/contact', '/guides',
  '/privacy-policy', '/site-visit', '/cost-calculator?area=1800&floors=2', '/thank-you?ref=SHR-2026-0001', '/this-page-does-not-exist',
].filter((p) => !only || p.includes(only))

const browser = await chromium.launch()
const found = new Map()
let scans = 0
for (const lang of ['', '/hi']) {
  for (const scheme of ['light', 'dark']) {
    for (const width of [360, 1280]) {
      const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: scheme, hasTouch: width < 1024 })
      const page = await ctx.newPage()
      for (const p of paths) {
        if (lang === '/hi' && scheme === 'dark' && width === 360 && !['/', '/contact'].includes(p)) continue // keep the run time sensible
        await page.goto(base + lang + (p === '/' ? '' : p), { waitUntil: 'load' })
        const h = await page.evaluate(() => document.body.scrollHeight)
        for (let y = 0; y < h; y += 600) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(60) }
        await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(700)
        const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']).analyze()
        scans++
        for (const v of r.violations) {
          const k = v.id
          const g = found.get(k) || { impact: v.impact, help: v.help, n: 0, pages: new Set(), ex: [] }
          g.n += v.nodes.length; g.pages.add(`${scheme} ${width}px ${lang || '/en'}${p}`)
          if (g.ex.length < 3) g.ex.push(`${v.nodes[0].target.join(' ')}  [${scheme} ${width}px ${lang || '/en'}${p}]  ${(v.nodes[0].any[0]?.message || v.nodes[0].failureSummary || '').split('\n')[0].slice(0, 110)}`)
          found.set(k, g)
        }
      }
      await ctx.close()
    }
  }
}

// Keyboard: Tab through the home page; every stop must show a visible focus indicator.
const kctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const kp = await kctx.newPage()
await kp.goto(base + '/')
const stops = []
for (let i = 0; i < 18; i++) {
  await kp.keyboard.press('Tab')
  stops.push(await kp.evaluate(() => {
    const e = document.activeElement
    if (!e || e === document.body) return null
    const cs = getComputedStyle(e)
    const visible = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none'
    return { tag: e.tagName.toLowerCase(), label: (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 28), visible }
  }))
}
const noFocus = stops.filter((s) => s && !s.visible)
const skip = await kp.evaluate(() => { document.activeElement?.blur(); return null })
await kp.goto(base + '/'); await kp.keyboard.press('Tab')
const skipLink = await kp.evaluate(() => { const e = document.activeElement; const b = e.getBoundingClientRect(); return { text: e.textContent.trim(), onScreen: b.width > 10 && b.top >= 0 } })
await browser.close()

console.log(`${scans} axe scans (light/dark, 360/1280, EN/HI)\n`)
for (const [id, g] of found) console.log(`[${g.impact}] ${id}: ${g.help}  (${g.n} nodes, ${g.pages.size} page-views)\n      e.g. ${g.ex.join('\n           ')}`)
console.log(`\nKeyboard: ${stops.filter(Boolean).length} focus stops on the home page, ${noFocus.length} without a visible focus ring${noFocus.length ? ': ' + noFocus.map((s) => `${s.tag} "${s.label}"`).join(', ') : ''}`)
console.log(`Skip link: first Tab -> "${skipLink.text}" ${skipLink.onScreen ? '(visible)' : '(NOT visible)'}`)
const bad = found.size + noFocus.length + (skipLink.onScreen ? 0 : 1)
console.log(bad ? `\n${found.size} kind(s) of violation` : '\nNo accessibility violations found.')
process.exit(bad ? 1 : 0)
