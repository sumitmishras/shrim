import 'dotenv/config'
import os from 'os'
import path from 'path'
import fs from 'fs'
import sharp from 'sharp'
import { getPayload, type Payload } from 'payload'
import config from '../payload.config'

/**
 * LOCAL REVIEW ONLY.
 *   npm run samples:publish    publishes the [SAMPLE – REPLACE] projects + testimonials with neutral images
 *   npm run samples:unpublish  puts everything back to draft and deletes the sample images
 */
const mode = process.argv[2]

const art = (label: string, hue: string, tone: 'before' | 'after') => `
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200" viewBox="0 0 1600 1200">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${hue}"/><stop offset="1" stop-color="${tone === 'before' ? '#8d8a85' : '#e9d9c3'}"/></linearGradient></defs>
  <rect width="1600" height="1200" fill="url(#g)"/>
  <g fill="none" stroke="rgba(255,255,255,.55)" stroke-width="6">
    <path d="M300 760 L800 380 L1300 760 M380 720 V980 H1220 V720 M720 980 V800 H880 V980"/>
  </g>
  <rect x="40" y="1090" width="620" height="70" rx="12" fill="rgba(0,0,0,.6)"/>
  <text x="64" y="1137" font-family="Helvetica, Arial, sans-serif" font-size="34" fill="#fff">[SAMPLE – REPLACE] ${label}</text>
</svg>`

async function makeMedia(payload: Payload, label: string, hue: string, tone: 'before' | 'after') {
  const file = path.join(os.tmpdir(), `shrim-sample-${label.replace(/\W+/g, '-').toLowerCase()}.jpg`)
  await sharp(Buffer.from(art(label, hue, tone))).jpeg({ quality: 78 }).toFile(file)
  const m = await payload.create({ collection: 'media', data: { alt: `[SAMPLE – REPLACE] ${label}` }, filePath: file })
  fs.rmSync(file, { force: true })
  return m.id
}

async function deleteSampleMedia(payload: Payload) {
  await payload.delete({ collection: 'media', where: { alt: { like: '[SAMPLE' } } })
}

async function main() {
  const payload = await getPayload({ config })
  const projects = await payload.find({ collection: 'projects', where: { slug: { like: 'sample-project-' } }, limit: 10, depth: 0 })
  const testimonials = await payload.find({ collection: 'testimonials', where: { clientName: { like: '[SAMPLE' } }, limit: 10, depth: 0 })

  if (mode === 'publish') {
    await deleteSampleMedia(payload)
    for (const p of projects.docs) {
      const n = p.slug.endsWith('1') ? 1 : 2
      const before = await makeMedia(payload, `Before ${n}`, '#6f6b66', 'before')
      const after = await makeMedia(payload, `After ${n}`, '#c8792b', 'after')
      const g = [] as number[]
      for (let i = 1; i <= 4; i++) g.push(await makeMedia(payload, `Gallery ${n}.${i}`, ['#b86a22', '#9a5a1f', '#d58a3d', '#7d4a1a'][i - 1], 'after'))
      await payload.update({
        collection: 'projects', id: p.id,
        data: { status: 'published', featured: true, beforeImages: [{ image: before }], afterImages: [{ image: after }], gallery: g.map((image) => ({ image })), showBudgetPublicly: false },
      })
    }
    for (const t of testimonials.docs) await payload.update({ collection: 'testimonials', id: t.id, data: { status: 'published', consentToPublish: true } })
    payload.logger.info(`[samples] published ${projects.totalDocs} projects, ${testimonials.totalDocs} testimonials`)
  } else if (mode === 'unpublish') {
    for (const p of projects.docs) {
      await payload.update({ collection: 'projects', id: p.id, data: { status: 'draft', featured: false, beforeImages: [], afterImages: [], gallery: [] } })
    }
    for (const t of testimonials.docs) await payload.update({ collection: 'testimonials', id: t.id, data: { status: 'draft', consentToPublish: false } })
    await deleteSampleMedia(payload)
    payload.logger.info('[samples] back to draft, sample images deleted')
  } else {
    console.error('Usage: samples.ts publish|unpublish')
    process.exit(1)
  }
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })
