import type { CollectionConfig } from 'payload'
import { hideFromStaff, isAdmin } from '../access'
import { slugFromTitle } from '../lib/slug'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug', 'order'], hidden: hideFromStaff, group: 'Content' },
  access: { read: () => true, create: isAdmin, update: isAdmin, delete: isAdmin },
  defaultSort: 'order',
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true, hooks: { beforeValidate: [slugFromTitle] }, admin: { description: 'Part of the URL. Do not change after launch.' } },
    { name: 'order', type: 'number', defaultValue: 0 },
    { name: 'summary', type: 'text', localized: true, admin: { description: 'One line shown on service cards' } },
    { name: 'cardImage', type: 'upload', relationTo: 'media' },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'heroHeadline', type: 'text', localized: true },
    { name: 'heroSub', type: 'textarea', localized: true },
    {
      name: 'painPoints', type: 'array', localized: true, maxRows: 6, labels: { singular: 'Problem', plural: 'Problems we solve' },
      fields: [{ name: 'title', type: 'text', required: true }, { name: 'text', type: 'textarea' }],
    },
    {
      name: 'inclusions', type: 'array', localized: true, labels: { singular: 'Item', plural: "What's included" },
      fields: [{ name: 'text', type: 'text', required: true }],
    },
    {
      name: 'tiers', type: 'array', localized: true, maxRows: 3, admin: { description: 'Starting rates come from Globals → Rates' },
      fields: [
        { name: 'tier', type: 'select', required: true, options: ['basic', 'standard', 'premium'] },
        { name: 'label', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        { name: 'highlights', type: 'array', fields: [{ name: 'text', type: 'text', required: true }] },
      ],
    },
    {
      type: 'collapsible', label: 'SEO', admin: { initCollapsed: true },
      fields: [
        { name: 'metaTitle', type: 'text', localized: true },
        { name: 'metaDescription', type: 'textarea', localized: true },
      ],
    },
  ],
}
