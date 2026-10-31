import type { CollectionConfig } from 'payload'
import path from 'path'

export const Media: CollectionConfig = {
  slug: 'media',
  access: { read: () => true },
  fields: [{ name: 'alt', type: 'text', required: true, localized: true }],
  upload: {
    // Local disk (Docker volume in production)
    staticDir: path.resolve(process.cwd(), 'media'),
    mimeTypes: ['image/*', 'video/mp4', 'video/webm'],
    imageSizes: [
      { name: 'card', width: 800, height: undefined },
      { name: 'hero', width: 1920, height: undefined },
    ],
  },
}
