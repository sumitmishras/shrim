import type { GlobalConfig } from 'payload'
import { hideFromStaff, isAdmin } from '../access'

export const Tracking: GlobalConfig = {
  slug: 'tracking',
  admin: { hidden: hideFromStaff, group: 'Settings' },
  access: { read: () => true, update: isAdmin },
  fields: [
    { name: 'gtmId', type: 'text', label: 'Google Tag Manager ID', admin: { description: 'GTM-XXXXXXX. Falls back to NEXT_PUBLIC_GTM_ID. GA4, Google Ads, Meta Pixel and Clarity are added inside GTM.' } },
    { name: 'metaPixelId', type: 'text', admin: { description: 'Only needed for the future Conversions API helper' } },
  ],
}
