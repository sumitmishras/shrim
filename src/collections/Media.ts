import type { CollectionConfig } from 'payload'
import path from 'path'
import { afterChangeRevalidate, afterDeleteRevalidate } from '../lib/revalidate'
import { APIError } from 'payload'
import { hideFromStaff, isAdmin } from '../access'

const MAX_VIDEO_MB = 10

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { hidden: hideFromStaff, group: 'Content' },
  access: { read: () => true, create: isAdmin, update: isAdmin, delete: isAdmin },
  hooks: {
    beforeValidate: [
      // Big videos make pages slow. Stop them at upload with a clear message.
      ({ req, data }) => {
        const f = req.file
        const bytes = f?.data?.length ?? f?.size ?? 0
        if (f && f.mimetype?.startsWith('video/') && bytes > MAX_VIDEO_MB * 1024 * 1024) {
          throw new APIError(`This video is ${(bytes / 1048576).toFixed(1)} MB. Videos must be under ${MAX_VIDEO_MB} MB (the home page hero video should be under 3 MB). Compress it first, for example with HandBrake, and upload again.`, 400, undefined, true)
        }
        return data
      },
    ],
    afterChange: [afterChangeRevalidate],
    afterDelete: [afterDeleteRevalidate],
  },
  fields: [{ name: 'alt', type: 'text', required: true, localized: true, admin: { description: 'Describe the photo in a few words (for Google and screen readers)' } }],
  upload: {
    // Local disk (a Docker volume in production)
    staticDir: path.resolve(process.cwd(), 'media'),
    mimeTypes: ['image/*', 'video/mp4', 'video/webm'],
    // Phone photos can be 12+ megapixels. Keep the stored original at most 2400px wide; smaller sizes are made for the site.
    resizeOptions: { width: 2400, withoutEnlargement: true },
    adminThumbnail: 'card',
    imageSizes: [
      { name: 'card', width: 800, height: undefined },
      { name: 'hero', width: 1920, height: undefined },
    ],
  },
}
