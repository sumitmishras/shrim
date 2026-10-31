import type { CollectionConfig } from 'payload'
import path from 'path'
import { hideFromStaff, isAdmin } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { hidden: hideFromStaff, group: 'Content' },
  access: { read: () => true, create: isAdmin, update: isAdmin, delete: isAdmin },
  fields: [{ name: 'alt', type: 'text', required: true, localized: true, admin: { description: 'Describe the photo in a few words (for Google and screen readers)' } }],
  upload: {
    // Local disk (a Docker volume in production)
    staticDir: path.resolve(process.cwd(), 'media'),
    mimeTypes: ['image/*', 'video/mp4', 'video/webm'],
    imageSizes: [
      { name: 'card', width: 800, height: undefined },
      { name: 'hero', width: 1920, height: undefined },
    ],
  },
}
