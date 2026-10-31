import type { CollectionConfig } from 'payload'
import { afterChangeRevalidate, afterDeleteRevalidate } from '../lib/revalidate'
import { hideFromStaff, isAdmin, publishedOrUser } from '../access'
import { slugFromTitle } from '../lib/slug'

const images = (name: string, description?: string) => ({
  name, type: 'array' as const, admin: { description },
  fields: [{ name: 'image', type: 'upload' as const, relationTo: 'media' as const, required: true }],
})

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'service', 'area', 'featured', 'status'], hidden: hideFromStaff, group: 'Content' },
  access: { read: publishedOrUser, create: isAdmin, update: isAdmin, delete: isAdmin },
  hooks: { afterChange: [afterChangeRevalidate], afterDelete: [afterDeleteRevalidate] },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true, hooks: { beforeValidate: [slugFromTitle] } },
    { name: 'service', type: 'relationship', relationTo: 'services', required: true },
    { name: 'area', type: 'text', required: true, admin: { description: 'Locality, e.g. Gomti Nagar Extension' } },
    {
      type: 'row',
      fields: [
        { name: 'plotSize', type: 'text', admin: { description: 'e.g. 1500 sq ft' } },
        { name: 'builtUpArea', type: 'text', admin: { description: 'e.g. 1800 sq ft' } },
        { name: 'duration', type: 'text', admin: { description: 'e.g. 7 months' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'budgetRange', type: 'text', admin: { description: 'e.g. ₹35–40 lakh' } },
        { name: 'showBudgetPublicly', type: 'checkbox', defaultValue: false },
      ],
    },
    { name: 'challenge', type: 'textarea', localized: true },
    { name: 'solution', type: 'textarea', localized: true },
    { name: 'result', type: 'textarea', localized: true },
    images('beforeImages', 'Shown in the before/after slider. Add them in the same order as the After images.'),
    images('afterImages'),
    images('gallery'),
    { name: 'video', type: 'upload', relationTo: 'media', admin: { description: 'Self-hosted video (mp4/webm)' } },
    { name: 'videoUrl', type: 'text', admin: { description: 'Or a YouTube link' } },
    { name: 'testimonial', type: 'relationship', relationTo: 'testimonials' },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    { name: 'status', type: 'select', required: true, defaultValue: 'draft', options: ['draft', 'published'], admin: { position: 'sidebar' } },
  ],
}
