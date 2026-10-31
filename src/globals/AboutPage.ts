import type { GlobalConfig } from 'payload'
import { globalAfterChangeRevalidate } from '../lib/revalidate'
import { hideFromStaff, isAdmin } from '../access'

export const AboutPage: GlobalConfig = {
  slug: 'aboutPage',
  label: 'About page',
  admin: { hidden: hideFromStaff, group: 'Content' },
  access: { read: () => true, update: isAdmin },
  hooks: { afterChange: [globalAfterChangeRevalidate] },
  fields: [
    { name: 'headline', type: 'text', localized: true },
    { name: 'story', type: 'textarea', localized: true, admin: { description: 'Rahul Tripathi’s story. Leave a blank line between paragraphs.' } },
    { name: 'founderName', type: 'text', defaultValue: 'Rahul Tripathi' },
    { name: 'founderPhoto', type: 'upload', relationTo: 'media' },
    {
      name: 'teamPhotos', type: 'array',
      fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }, { name: 'caption', type: 'text', localized: true }],
    },
    {
      name: 'values', type: 'array', localized: true,
      fields: [{ name: 'title', type: 'text', required: true }, { name: 'text', type: 'textarea' }],
    },
  ],
}
