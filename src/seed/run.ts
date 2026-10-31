import 'dotenv/config'
import { getPayload, type Payload } from 'payload'
import config from '../payload.config'
import { generalFaqs, guides, rates, sampleProject, services, siteSettingsHi } from './data'

/**
 * Idempotent: creates what is missing and never overwrites entries the owner may have edited.
 * Run with `npm run seed`.
 */
async function main() {
  const payload = await getPayload({ config })
  const log = (m: string) => payload.logger.info(`[seed] ${m}`)

  await seedAdmin(payload, log)
  const serviceIds = await seedServices(payload, log)
  await seedFaqs(payload, serviceIds, log)
  await seedGuides(payload, log)
  await seedSamples(payload, serviceIds, log)
  await seedGlobals(payload, log)
  log('done')
  process.exit(0)
}

type Log = (m: string) => void

async function seedAdmin(payload: Payload, log: Log) {
  const email = process.env.SEED_ADMIN_EMAIL, password = process.env.SEED_ADMIN_PASSWORD
  if (!email || !password) throw new Error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env')
  const found = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 })
  if (found.totalDocs) return log(`admin ${email} exists`)
  await payload.create({ collection: 'users', data: { email, password, role: 'admin', name: 'Owner' } })
  log(`created admin ${email}`)
}

async function seedServices(payload: Payload, log: Log) {
  const ids: Record<string, number> = {}
  for (const s of services) {
    const found = await payload.find({ collection: 'services', where: { slug: { equals: s.slug } }, limit: 1, depth: 0 })
    if (found.docs[0]) { ids[s.slug] = found.docs[0].id; continue }
    const pick = (l: 'en' | 'hi') => ({
      title: s.title[l], summary: s.summary[l], heroHeadline: s.heroHeadline[l], heroSub: s.heroSub[l],
      painPoints: s.painPoints[l], inclusions: s.inclusions[l], tiers: s.tiers[l],
      metaTitle: s.metaTitle[l], metaDescription: s.metaDescription[l],
    })
    const doc = await payload.create({ collection: 'services', locale: 'en', data: { slug: s.slug, order: s.order, ...pick('en') } })
    await payload.update({ collection: 'services', id: doc.id, locale: 'hi', data: pick('hi') })
    ids[s.slug] = doc.id
    log(`service ${s.slug}`)
  }
  return ids
}

async function seedFaqs(payload: Payload, serviceIds: Record<string, number>, log: Log) {
  const existing = await payload.count({ collection: 'faqs' })
  if (existing.totalDocs > 0) return log('faqs exist, skipped')
  let order = 0
  const add = async (en: { q: string; a: string }, hi: { q: string; a: string }, extra: Record<string, unknown>) => {
    const doc = await payload.create({ collection: 'faqs', locale: 'en', data: { question: en.q, answer: en.a, order: ++order, ...extra } as never })
    await payload.update({ collection: 'faqs', id: doc.id, locale: 'hi', data: { question: hi.q, answer: hi.a } })
  }
  for (const f of generalFaqs) await add(f.en, f.hi, { category: 'general' })
  for (const s of services) {
    for (let i = 0; i < s.faqs.en.length; i++) await add(s.faqs.en[i], s.faqs.hi[i], { category: 'service', service: serviceIds[s.slug] })
  }
  log(`created ${order} faqs`)
}

async function seedGuides(payload: Payload, log: Log) {
  for (const g of guides) {
    const found = await payload.find({ collection: 'guides', where: { slug: { equals: g.slug } }, limit: 1, depth: 0 })
    if (found.docs[0]) continue
    const doc = await payload.create({ collection: 'guides', locale: 'en', data: { slug: g.slug, title: g.title.en, outline: g.outline.en, status: 'draft' } })
    await payload.update({ collection: 'guides', id: doc.id, locale: 'hi', data: { title: g.title.hi, outline: g.outline.hi } })
    log(`guide ${g.slug}`)
  }
}

async function seedSamples(payload: Payload, serviceIds: Record<string, number>, log: Log) {
  for (const n of [1, 2] as const) {
    const p = sampleProject(n)
    const slug = `sample-project-${n}`
    const found = await payload.find({ collection: 'projects', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
    if (found.docs[0]) continue
    const t = await payload.create({
      collection: 'testimonials',
      data: { clientName: '[SAMPLE – REPLACE] Client name', area: p.area, service: serviceIds[p.service], text: '[SAMPLE – REPLACE] Testimonial text.', consentToPublish: false, status: 'draft' },
    })
    await payload.create({
      collection: 'projects', locale: 'en',
      data: { ...p, slug, service: serviceIds[p.service], testimonial: t.id, featured: false, status: 'draft' },
    })
    log(`sample project ${n} (draft)`)
  }
}

async function seedGlobals(payload: Payload, log: Log) {
  const r = await payload.findGlobal({ slug: 'rates', depth: 0 })
  if (!r.rates?.length) {
    const l = (x: { label: { en: string; hi: string } }, k: 'en' | 'hi') => ({ ...x, label: x.label[k] })
    await payload.updateGlobal({ slug: 'rates', locale: 'en', data: { ...rates, extras: rates.extras.map((x) => l(x, 'en')), breakdown: rates.breakdown.map((x) => l(x, 'en')) } as never })
    const after = await payload.findGlobal({ slug: 'rates', depth: 0, locale: 'en' })
    // Hindi labels: rows are shared across locales, so update each row's label in 'hi'.
    await payload.updateGlobal({
      slug: 'rates', locale: 'hi',
      data: {
        extras: after.extras?.map((row, i) => ({ ...row, label: rates.extras[i].label.hi })),
        breakdown: after.breakdown?.map((row, i) => ({ ...row, label: rates.breakdown[i].label.hi })),
      } as never,
    })
    log('rates (sample values)')
  }
  const s = await payload.findGlobal({ slug: 'siteSettings', locale: 'hi', fallbackLocale: false })
  if (!s.thankYouPromise || s.thankYouPromise === 'Hum 30 minute ke andar call karenge') {
    await payload.updateGlobal({ slug: 'siteSettings', locale: 'en', data: { phone: 'PLACEHOLDER', whatsapp: 'PLACEHOLDER' } })
    await payload.updateGlobal({ slug: 'siteSettings', locale: 'hi', data: siteSettingsHi })
    log('site settings')
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
