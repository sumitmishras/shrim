// Unit checks for tracking + SEO helpers (no server needed).
import crypto from 'crypto'
import { buildMetaEvent, metaPhone, sendMetaLead, sha256 } from '../src/lib/meta-capi'
import { articleLd, breadcrumbLd, faqLd, organizationLd, serviceLd } from '../src/lib/jsonld'

let fails = 0
const ok = (c: boolean, m: string) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${m}`); if (!c) fails++ }
const eq = (a: unknown, b: unknown, m: string) => ok(JSON.stringify(a) === JSON.stringify(b), `${m}${JSON.stringify(a) === JSON.stringify(b) ? '' : `  (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`}`)
const raw = (v: string) => crypto.createHash('sha256').update(v).digest('hex')

// --- Meta CAPI
eq(sha256('  Test@Example.com '), raw('test@example.com'), 'meta: email is trimmed, lower-cased, SHA-256 hashed')
eq(metaPhone('98765 43210'), '919876543210', 'meta: phone gets the 91 country code')
const lead = { eventId: 'SHR-2026-0007', phone: '9876543210', email: 'a@b.com', name: 'Rahul Kumar', source: 'site-visit', url: 'https://x.in/contact', ip: '1.2.3.4', ua: 'UA', fbp: 'fb.1.1.2', adsConsent: true }
const ev = buildMetaEvent(lead, 'Lead', 1_700_000_000_000)
const body = JSON.stringify(ev)
ok(ev.event_id === 'SHR-2026-0007' && ev.event_time === 1_700_000_000 && ev.action_source === 'website', 'meta: event id (= lead reference), time and source')
ok(ev.user_data.ph?.[0] === raw('919876543210') && ev.user_data.em?.[0] === raw('a@b.com') && ev.user_data.fn?.[0] === raw('rahul'), 'meta: phone, email and first name are hashed')
ok(!body.includes('9876543210') && !body.includes('a@b.com') && !body.includes('Rahul'), 'meta: no plain-text personal data in the payload')
eq(buildMetaEvent({ ...lead, ip: 'local' }, 'Lead').user_data.client_ip_address, undefined, 'meta: placeholder IP is not sent')
delete process.env.META_CAPI_ENABLED
eq(await sendMetaLead(lead), 'disabled', 'meta: disabled by default')
process.env.META_CAPI_ENABLED = 'true'
eq(await sendMetaLead({ ...lead, adsConsent: false }), 'no-consent', 'meta: enabled but no ads consent -> nothing sent')
process.env.META_PIXEL_ID = '123'; delete process.env.META_CAPI_TOKEN
eq(await sendMetaLead({ ...lead, adsConsent: true }), 'not-configured', 'meta: enabled + consent but no token -> not configured')
delete process.env.META_CAPI_ENABLED; delete process.env.META_PIXEL_ID

// --- JSON-LD
const s = { phone: '+91 98765 43210', whatsapp: 'PLACEHOLDER', email: 'info@shrimconstruction.in', gstin: '09BAYPT7371Q2Z3', social: { instagram: 'https://instagram.com/x', facebook: null }, seo: { openingHoursSpec: 'Mo-Sa 09:30-18:30', geoLat: null, geoLng: null } } as never
const org = organizationLd(s, 'en') as Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
ok(org['@type'] === 'GeneralContractor' && org.taxID === '09BAYPT7371Q2Z3' && org.address.postalCode === '226028' && org.address.addressLocality === 'Lucknow' && org.address.streetAddress.includes('Mallhaur Road'), 'jsonld: GeneralContractor with GST address')
ok(org.areaServed.length === 12 && org.areaServed.some((a: { name: string }) => a.name === 'Chinhat, Lucknow'), 'jsonld: Lucknow + all 11 localities as areas served')
ok(org.telephone === '+919876543210' && org.sameAs.length === 1 && !('geo' in org), 'jsonld: phone, only real social links, no geo until set')
ok(!('telephone' in (organizationLd({ ...(s as object), phone: 'PLACEHOLDER' } as never, 'en') as object)), 'jsonld: placeholder phone is never published')
eq((organizationLd({ ...(s as object), seo: { geoLat: 26.9, geoLng: 81.02 } } as never, 'en') as Record<string, any>).geo, { '@type': 'GeoCoordinates', latitude: 26.9, longitude: 81.02 }, 'jsonld: geo appears once coordinates are set')
const svc = serviceLd({ locale: 'hi', slug: 'interior', name: 'इंटीरियर', description: 'd' }) as Record<string, any>
ok(svc['@type'] === 'Service' && svc.url.endsWith('/hi/services/interior') && svc.provider['@id'] === org['@id'], 'jsonld: Service links to the organisation and the Hindi URL')
eq(faqLd([]), null, 'jsonld: no FAQ schema when there are no questions')
const faq = faqLd([{ question: 'Q?', answer: 'A.' }]) as Record<string, any>
ok(faq['@type'] === 'FAQPage' && faq.mainEntity[0].acceptedAnswer.text === 'A.', 'jsonld: FAQPage')
const art = articleLd({ locale: 'en', slug: 'g', title: 'T', author: 'Rahul Tripathi', published: '2026-10-01T00:00:00Z', modified: '2026-10-02T00:00:00Z' }) as Record<string, any>
ok(art['@type'] === 'Article' && art.author.name === 'Rahul Tripathi' && art.dateModified === '2026-10-02T00:00:00Z' && art.image.endsWith('/og-default.jpg'), 'jsonld: Article with author, dates, fallback image')
const bc = breadcrumbLd('en', 'Home', [{ name: 'Services', path: '/services' }, { name: 'Interior', path: '/services/interior' }]) as Record<string, any>
eq(bc.itemListElement.map((i: { position: number; name: string }) => [i.position, i.name]), [[1, 'Home'], [2, 'Services'], [3, 'Interior']], 'jsonld: breadcrumb positions')
ok(bc.itemListElement.every((i: { item: string }) => i.item.startsWith('http')), 'jsonld: breadcrumb items are absolute URLs')

console.log(fails ? `\n${fails} FAILED` : '\nAll tracking/SEO logic checks passed.')
process.exit(fails ? 1 : 0)
