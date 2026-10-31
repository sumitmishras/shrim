import type { CollectionConfig } from 'payload'
import { afterChangeRevalidate, afterDeleteRevalidate } from '../lib/revalidate'
import { hideFromStaff, isAdmin } from '../access'

/** Simple text pages: commercial, privacy-policy, terms. */
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug'], hidden: hideFromStaff, group: 'Content' },
  access: { read: () => true, create: isAdmin, update: isAdmin, delete: isAdmin },
  hooks: { afterChange: [afterChangeRevalidate], afterDelete: [afterDeleteRevalidate] },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'select', required: true, unique: true, options: ['commercial', 'privacy-policy', 'terms'] },
    { name: 'intro', type: 'textarea', localized: true },
    { name: 'body', type: 'richText', localized: true },
    { name: 'metaDescription', type: 'textarea', localized: true },
  ],
}
