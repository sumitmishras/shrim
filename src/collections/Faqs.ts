import type { CollectionConfig } from 'payload'
import { hideFromStaff, isAdmin } from '../access'

export const Faqs: CollectionConfig = {
  slug: 'faqs',
  admin: { useAsTitle: 'question', defaultColumns: ['question', 'category', 'service', 'order'], hidden: hideFromStaff, group: 'Content' },
  access: { read: () => true, create: isAdmin, update: isAdmin, delete: isAdmin },
  defaultSort: 'order',
  fields: [
    { name: 'question', type: 'text', required: true, localized: true },
    { name: 'answer', type: 'textarea', required: true, localized: true },
    { name: 'category', type: 'select', required: true, defaultValue: 'general', options: [{ label: 'General (home page)', value: 'general' }, { label: 'Specific service', value: 'service' }] },
    { name: 'service', type: 'relationship', relationTo: 'services', admin: { condition: (d) => d?.category === 'service' } },
    { name: 'order', type: 'number', defaultValue: 0 },
  ],
}
