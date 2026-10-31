import type { CollectionBeforeChangeHook, CollectionConfig, Field } from 'payload'
import { adminOnlyField, isAdmin, isAdminOrStaff } from '../access'

export const leadStatuses = [
  { label: 'New', value: 'new' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Qualified', value: 'qualified' },
  { label: 'Site Visit', value: 'site-visit' },
  { label: 'Quotation Sent', value: 'quotation-sent' },
  { label: 'Negotiation', value: 'negotiation' },
  { label: 'Won', value: 'won' },
  { label: 'Lost', value: 'lost' },
]

/** Staff may only change status, lost reason, follow-up date and notes. Everything else is admin-only to edit. */
const locked = { update: adminOnlyField }
const ro = (f: Field): Field => ({ ...f, access: { ...('access' in f ? f.access : {}), ...locked } }) as Field

type Row = { id?: string; at?: string; author?: unknown; [k: string]: unknown }

const buildReference: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== 'create' || data.reference) return data
  const year = new Date().getFullYear()
  const prefix = `SHR-${year}-`
  const last = await req.payload.find({
    collection: 'leads', where: { reference: { like: prefix } }, sort: '-reference', limit: 1, depth: 0, req, overrideAccess: true,
  })
  const n = last.docs[0]?.reference ? parseInt(last.docs[0].reference.slice(prefix.length), 10) || 0 : 0
  data.reference = `${prefix}${String(n + 1).padStart(4, '0')}`
  return data
}

/** Audit trail: rebuilt server-side from the stored history, so clients can never forge entries. */
const auditStatus: CollectionBeforeChangeHook = ({ data, originalDoc, operation, req }) => {
  const history: Row[] = Array.isArray(originalDoc?.statusHistory) ? [...originalDoc.statusHistory] : []
  const to = data.status ?? originalDoc?.status
  const from = operation === 'create' ? null : originalDoc?.status
  if (operation === 'create' || (to && to !== from)) {
    history.push({ from, to, at: new Date().toISOString(), by: req.user?.id ?? null })
  }
  data.statusHistory = history
  return data
}

/** Notes: existing rows keep their original author/time; new rows are stamped with the current user and time. */
const stampNotes: CollectionBeforeChangeHook = ({ data, originalDoc, req }) => {
  if (!Array.isArray(data.notes)) return data
  const before = new Map<string, Row>((originalDoc?.notes ?? []).map((n: Row) => [String(n.id), n]))
  data.notes = data.notes.map((n: Row) => {
    const old = n.id ? before.get(String(n.id)) : undefined
    return old ? { ...n, at: old.at, author: old.author } : { ...n, at: new Date().toISOString(), author: req.user?.id ?? null }
  })
  return data
}

export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: {
    useAsTitle: 'reference',
    defaultColumns: ['reference', 'name', 'phone', 'service', 'status', 'scoreBand', 'nextFollowUp', 'createdAt'],
    listSearchableFields: ['reference', 'name', 'phone', 'email'],
    group: 'CRM',
  },
  defaultSort: '-createdAt',
  access: {
    read: isAdminOrStaff,
    create: isAdminOrStaff,
    update: isAdminOrStaff,
    delete: isAdmin, // staff cannot delete
  },
  hooks: { beforeChange: [buildReference, auditStatus, stampNotes] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Pipeline',
          fields: [
            { name: 'reference', type: 'text', unique: true, index: true, admin: { readOnly: true, description: 'Auto-generated, e.g. SHR-2026-0001' }, access: locked },
            { name: 'status', type: 'select', required: true, defaultValue: 'new', options: leadStatuses, index: true },
            {
              name: 'lostReason', type: 'select', admin: { condition: (d) => d?.status === 'lost' },
              options: [
                { label: 'Price', value: 'price' }, { label: 'Timeline', value: 'timeline' }, { label: 'Chose competitor', value: 'competitor' },
                { label: 'Not genuine', value: 'not-genuine' }, { label: 'No response', value: 'no-response' }, { label: 'Other', value: 'other' },
              ],
            },
            { name: 'nextFollowUp', type: 'date', index: true, admin: { date: { pickerAppearance: 'dayOnly' } } },
            { name: 'assignedTo', type: 'relationship', relationTo: 'users', access: locked },
            {
              type: 'row',
              fields: [
                { name: 'score', type: 'number', min: 0, max: 100, admin: { readOnly: true, description: 'Auto score (0–100)' }, access: locked },
                { name: 'scoreBand', type: 'select', options: ['hot', 'warm', 'cold'], index: true, admin: { readOnly: true }, access: locked },
                { name: 'scoreOverride', type: 'number', min: 0, max: 100, admin: { description: 'Manual override (admin only)' }, access: locked },
              ],
            },
            {
              name: 'notes', type: 'array', labels: { singular: 'Note', plural: 'Notes' },
              fields: [
                { name: 'note', type: 'textarea', required: true },
                { name: 'at', type: 'date', admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
                { name: 'author', type: 'relationship', relationTo: 'users', admin: { readOnly: true } },
              ],
            },
            {
              type: 'row',
              fields: [
                ro({ name: 'quotationAmount', type: 'number', label: 'Quotation (₹)' }),
                ro({ name: 'wonAmount', type: 'number', label: 'Won amount (₹)' }),
                ro({ name: 'wonDate', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' } } }),
              ],
            },
            {
              name: 'statusHistory', type: 'array', label: 'Status history (audit trail)', admin: { readOnly: true, initCollapsed: true },
              fields: [
                { name: 'from', type: 'select', options: leadStatuses },
                { name: 'to', type: 'select', options: leadStatuses },
                { name: 'at', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
                { name: 'by', type: 'relationship', relationTo: 'users' },
              ],
            },
          ],
        },
        {
          label: 'Enquiry',
          fields: [
            ro({ name: 'name', type: 'text', required: true }),
            ro({ name: 'phone', type: 'text', required: true, index: true }),
            ro({ name: 'email', type: 'email' }),
            ro({ name: 'locality', type: 'text' }),
            ro({ name: 'service', type: 'select', options: [
              { label: 'House construction', value: 'house-construction' }, { label: 'Interior', value: 'interior' }, { label: 'Renovation', value: 'renovation' },
              { label: 'Fabrication', value: 'fabrication' }, { label: 'Turnkey', value: 'turnkey' }, { label: 'Commercial', value: 'commercial' }, { label: 'Not sure', value: 'not-sure' },
            ] }),
            ro({ name: 'areaSize', type: 'text', label: 'Plot / built-up area' }),
            ro({ name: 'floors', type: 'text' }),
            ro({ name: 'plotStatus', type: 'select', options: [{ label: 'Plot ready', value: 'ready' }, { label: 'Under purchase', value: 'under-purchase' }, { label: 'Existing building', value: 'existing-building' }] }),
            ro({ name: 'budgetBand', type: 'select', options: [
              { label: 'Under ₹10 lakh', value: 'under-10' }, { label: '₹10–25 lakh', value: '10-25' }, { label: '₹25–50 lakh', value: '25-50' },
              { label: '₹50 lakh – 1 crore', value: '50-100' }, { label: 'Above ₹1 crore', value: '100-plus' },
            ] }),
            ro({ name: 'timeline', type: 'select', options: [
              { label: 'Immediately', value: 'immediately' }, { label: '1–3 months', value: '1-3-months' }, { label: '3–6 months', value: '3-6-months' }, { label: 'Just exploring', value: 'exploring' },
            ] }),
            ro({ name: 'preferredVisitDate', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' } } }),
            ro({ name: 'preferredVisitSlot', type: 'select', options: [{ label: 'Morning', value: 'morning' }, { label: 'Afternoon', value: 'afternoon' }, { label: 'Evening', value: 'evening' }] }),
            ro({ name: 'message', type: 'textarea' }),
            ro({ name: 'calculator', type: 'json', admin: { description: 'Calculator inputs and the estimate shown to the visitor' } }),
          ],
        },
        {
          label: 'Source & attribution',
          fields: [
            ro({ name: 'source', type: 'select', index: true, options: [{ label: 'Site visit form', value: 'site-visit' }, { label: 'Calculator', value: 'calculator' }, { label: 'Contact form', value: 'contact' }, { label: 'Service page', value: 'service-page' }, { label: 'Manual entry', value: 'manual' }] }),
            ro({ name: 'sourceDetail', type: 'text', admin: { description: 'e.g. the service page name' } }),
            {
              name: 'attribution', type: 'group', access: locked,
              fields: [
                { name: 'utm_source', type: 'text' }, { name: 'utm_medium', type: 'text' }, { name: 'utm_campaign', type: 'text' },
                { name: 'utm_term', type: 'text' }, { name: 'utm_content', type: 'text' },
                { name: 'gclid', type: 'text' }, { name: 'fbclid', type: 'text' },
                { name: 'landingPage', type: 'text' }, { name: 'referrer', type: 'text' },
                { name: 'firstVisitAt', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
                { name: 'device', type: 'select', options: ['mobile', 'tablet', 'desktop'] },
                { name: 'channel', type: 'select', index: true, options: [{ label: 'Google Ads', value: 'google-ads' }, { label: 'Meta Ads', value: 'meta-ads' }, { label: 'Organic', value: 'organic' }, { label: 'Google Business Profile', value: 'gbp' }, { label: 'Direct', value: 'direct' }, { label: 'WhatsApp', value: 'whatsapp' }, { label: 'Other', value: 'other' }], admin: { description: 'Derived from the fields above when the lead is saved (milestone 4)' } },
              ],
            },
            {
              name: 'consent', type: 'group', access: locked,
              fields: [
                { name: 'given', type: 'checkbox', defaultValue: false },
                { name: 'at', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
                { name: 'textVersion', type: 'text', admin: { description: 'Version of the consent wording the visitor agreed to' } },
              ],
            },
          ],
        },
      ],
    },
  ],
}
