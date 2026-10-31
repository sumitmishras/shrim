import type { CollectionConfig } from 'payload'
import { hideFromStaff, isAdmin, publishedOrUser } from '../access'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: { useAsTitle: 'clientName', defaultColumns: ['clientName', 'area', 'status', 'consentToPublish'], hidden: hideFromStaff, group: 'Content' },
  access: { read: publishedOrUser, create: isAdmin, update: isAdmin, delete: isAdmin },
  fields: [
    { name: 'clientName', type: 'text', required: true, admin: { description: 'Full name, or initials (e.g. "R. Singh") if the client prefers' } },
    { name: 'area', type: 'text' },
    { name: 'project', type: 'relationship', relationTo: 'projects' },
    { name: 'service', type: 'relationship', relationTo: 'services' },
    { name: 'text', type: 'textarea', localized: true },
    { name: 'video', type: 'upload', relationTo: 'media', admin: { description: 'Video testimonial (mp4/webm)' } },
    { name: 'rating', type: 'number', min: 1, max: 5, admin: { description: 'Only if the client really gave a rating. Leave empty otherwise.' } },
    {
      name: 'consentToPublish', type: 'checkbox', required: true, defaultValue: false, label: 'Client has agreed to publish this',
      validate: (v: unknown, { siblingData }: { siblingData: { status?: string } }) =>
        siblingData?.status === 'published' && !v ? 'Cannot publish without the client’s consent.' : true,
    },
    { name: 'status', type: 'select', required: true, defaultValue: 'draft', options: ['draft', 'published'], admin: { position: 'sidebar' } },
  ],
}
