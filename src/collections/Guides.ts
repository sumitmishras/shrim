import type { CollectionConfig } from 'payload'
import { afterChangeRevalidate, afterDeleteRevalidate } from '../lib/revalidate'
import { hideFromStaff, isAdmin, publishedOrUser } from '../access'
import { slugFromTitle } from '../lib/slug'

export const Guides: CollectionConfig = {
  slug: 'guides',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'status', 'publishedAt'], hidden: hideFromStaff, group: 'Content' },
  access: { read: publishedOrUser, create: isAdmin, update: isAdmin, delete: isAdmin },
  hooks: { afterChange: [afterChangeRevalidate], afterDelete: [afterDeleteRevalidate] },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true, hooks: { beforeValidate: [slugFromTitle] } },
    { name: 'excerpt', type: 'textarea', localized: true },
    { name: 'outline', type: 'textarea', localized: true, admin: { description: 'Draft outline for the writer. Not shown on the website.' } },
    { name: 'content', type: 'richText', localized: true },
    { name: 'cover', type: 'upload', relationTo: 'media' },
    { name: 'author', type: 'text', defaultValue: 'Rahul Tripathi' },
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar' } },
    { name: 'relatedService', type: 'relationship', relationTo: 'services', admin: { position: 'sidebar', description: 'Used for the CTA box inside the article' } },
    {
      type: 'collapsible', label: 'SEO', admin: { initCollapsed: true },
      fields: [{ name: 'metaTitle', type: 'text', localized: true }, { name: 'metaDescription', type: 'textarea', localized: true }],
    },
    { name: 'status', type: 'select', required: true, defaultValue: 'draft', options: ['draft', 'published'], admin: { position: 'sidebar' } },
  ],
}
