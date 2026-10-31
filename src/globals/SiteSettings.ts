import type { GlobalConfig } from 'payload'
import { hideFromStaff, isAdmin } from '../access'

export const SiteSettings: GlobalConfig = {
  slug: 'siteSettings',
  access: { read: () => true, update: isAdmin },
  admin: { hidden: hideFromStaff, group: 'Settings' },
  fields: [
    { name: 'phone', type: 'text', defaultValue: 'PLACEHOLDER', admin: { description: 'Display phone, e.g. +91 98XXXXXXXX' } },
    { name: 'whatsapp', type: 'text', defaultValue: 'PLACEHOLDER', admin: { description: 'Digits only with country code, e.g. 919876543210' } },
    { name: 'email', type: 'email', defaultValue: 'info@shrimconstruction.in' },
    { name: 'addressFull', type: 'textarea', defaultValue: '86F/4, Khasra No 195-196, Mallhaur Road, Near Amity University, Chinhat (Nizampur Mallhaur), Lucknow, Uttar Pradesh – 226028' },
    { name: 'addressShort', type: 'text', defaultValue: 'Chinhat, Lucknow' },
    { name: 'showFullAddress', type: 'checkbox', defaultValue: false },
    { name: 'gstin', type: 'text', defaultValue: '09BAYPT7371Q2Z3' },
    { name: 'officeHours', type: 'text', defaultValue: 'Mon–Sat, 9:30 AM – 6:30 PM', localized: true },
    {
      name: 'social',
      type: 'group',
      fields: [
        { name: 'instagram', type: 'text' },
        { name: 'facebook', type: 'text' },
        { name: 'youtube', type: 'text' },
        { name: 'googleBusiness', type: 'text' },
      ],
    },
    {
      name: 'hero',
      type: 'group',
      admin: { description: 'Home page hero. Video is optional; the poster / image shows while it loads or if it is missing.' },
      fields: [
        { name: 'video', type: 'upload', relationTo: 'media', admin: { description: 'mp4 or webm, compressed under 3 MB. Plays muted, looped.' } },
        { name: 'poster', type: 'upload', relationTo: 'media', admin: { description: 'Still frame for the video' } },
        { name: 'image', type: 'upload', relationTo: 'media', admin: { description: 'Used when there is no video' } },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      label: 'Google / SEO details',
      fields: [
        { name: 'openingHoursSpec', type: 'text', defaultValue: 'Mo-Sa 09:30-18:30', admin: { description: 'For Google, in this format: Mo-Sa 09:30-18:30. Keep in step with “Office hours” above.' } },
        { name: 'geoLat', type: 'number', label: 'Office latitude', admin: { description: 'From Google Maps: right-click the office pin and copy the first number, e.g. 26.9001' } },
        { name: 'geoLng', type: 'number', label: 'Office longitude', admin: { description: 'The second number, e.g. 81.0212' } },
      ],
    },
    { name: 'thankYouPromise', type: 'text', localized: true, defaultValue: 'Hum 30 minute ke andar call karenge' },
    {
      name: 'stats',
      type: 'group',
      fields: [
        { name: 'yearsExperience', type: 'text', defaultValue: '7+' },
        { name: 'projectCount', type: 'text', defaultValue: '[PROJECT COUNT]', admin: { description: 'Real number only. Leave placeholder to hide.' } },
      ],
    },
  ],
}
