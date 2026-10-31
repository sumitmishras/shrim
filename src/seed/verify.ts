import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'

const ok = (c: boolean, m: string) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${m}`); if (!c) process.exitCode = 1 }

async function main() {
  const payload = await getPayload({ config })
  const s = await payload.findGlobal({ slug: 'siteSettings', locale: 'hi', fallbackLocale: false })
  console.log('hi promise:', s.thankYouPromise)
  const svc = await payload.find({ collection: 'services', locale: 'hi', limit: 10 })
  ok(svc.totalDocs === 5 && svc.docs.every((d) => /[ऀ-ॿ]/.test(d.title)), '5 services with Hindi titles')
  ok((await payload.count({ collection: 'faqs' })).totalDocs === 30, '30 faqs')
  const hiFaq = await payload.find({ collection: 'faqs', locale: 'hi', limit: 1 })
  ok(/[ऀ-ॿ]/.test(hiFaq.docs[0].question), 'faq Hindi')
  const rt = await payload.findGlobal({ slug: 'rates', locale: 'hi' })
  ok(rt.rates?.length === 12 && !!rt.sampleData, '12 sample rates flagged')
  ok(/[ऀ-ॿ]/.test(rt.breakdown?.[0]?.label ?? ''), 'breakdown Hindi label')

  // Staff user for access tests
  const email = 'staff-test@example.com'
  await payload.delete({ collection: 'users', where: { email: { equals: email } } })
  const staff = await payload.create({ collection: 'users', data: { email, password: 'Test-pass-12345!', role: 'staff' } })
  const admin = (await payload.find({ collection: 'users', where: { role: { equals: 'admin' } }, limit: 1 })).docs[0]

  const lead = await payload.create({ collection: 'leads', data: { name: 'Test Lead', phone: '9876543210' } })
  const lead2 = await payload.create({ collection: 'leads', data: { name: 'Test Lead 2', phone: '9876543211' } })
  ok(/^SHR-\d{4}-\d{4}$/.test(lead.reference ?? ''), `reference ${lead.reference}`)
  ok(lead2.reference !== lead.reference, `second reference ${lead2.reference}`)
  ok(lead.statusHistory?.length === 1 && lead.statusHistory[0].to === 'new', 'initial history entry')

  // Staff updates status + adds a note (real access rules)
  const up = await payload.update({
    collection: 'leads', id: lead.id, user: staff, overrideAccess: false,
    data: { status: 'contacted', notes: [{ note: 'Called, will visit Sunday' }], name: 'HACKED', statusHistory: [{ from: 'won', to: 'won' }] },
  })
  ok(up.status === 'contacted', 'staff can change status')
  ok(up.name === 'Test Lead', 'staff cannot edit name')
  ok(up.statusHistory?.length === 2 && up.statusHistory[1].from === 'new' && up.statusHistory[1].to === 'contacted', 'status change logged, forged history ignored')
  ok(up.notes?.length === 1 && !!up.notes[0].at && (up.notes[0].author as { id?: number })?.id === staff.id || (up.notes?.[0].author as unknown) === staff.id, 'note stamped with author/time')

  // Staff tries to forge old note author
  const forged = await payload.update({
    collection: 'leads', id: lead.id, user: staff, overrideAccess: false,
    data: { notes: [{ id: up.notes![0].id, note: 'edited', author: admin.id, at: '2020-01-01T00:00:00.000Z' }] },
  })
  ok(forged.notes?.[0].at === up.notes![0].at, 'existing note time cannot be forged')

  let denied = false
  try { await payload.delete({ collection: 'leads', id: lead.id, user: staff, overrideAccess: false }) } catch { denied = true }
  ok(denied, 'staff cannot delete leads')
  let denied2 = false
  try { await payload.create({ collection: 'services', data: { title: 'x', slug: 'x' }, user: staff, overrideAccess: false }) } catch { denied2 = true }
  ok(denied2, 'staff cannot create services')

  // Public cannot see drafts
  const pub = await payload.find({ collection: 'projects', overrideAccess: false })
  ok(pub.totalDocs === 0, 'drafts hidden from public')
  const pubG = await payload.find({ collection: 'guides', overrideAccess: false })
  ok(pubG.totalDocs === 0, 'draft guides hidden from public')
  // Testimonial consent rule
  let blocked = false
  try { await payload.create({ collection: 'testimonials', data: { clientName: 'X', status: 'published', consentToPublish: false } }) } catch { blocked = true }
  ok(blocked, 'cannot publish testimonial without consent')

  await payload.delete({ collection: 'leads', where: { name: { like: 'Test Lead' } } })
  await payload.delete({ collection: 'users', id: staff.id })
  process.exit(process.exitCode ?? 0)
}
main().catch((e) => { console.error(e); process.exit(1) })
