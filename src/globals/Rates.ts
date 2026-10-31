import type { GlobalConfig } from 'payload'
import { hideFromStaff, isAdmin } from '../access'

const serviceOptions = [
  { label: 'House construction', value: 'house-construction' },
  { label: 'Renovation', value: 'renovation' },
  { label: 'Interior', value: 'interior' },
  { label: 'Turnkey', value: 'turnkey' },
  { label: 'Fabrication', value: 'fabrication' },
]

export const Rates: GlobalConfig = {
  slug: 'rates',
  admin: { hidden: hideFromStaff, group: 'Settings', description: 'Drives the cost calculator and “starting from” prices on service pages.' },
  access: { read: () => true, update: isAdmin },
  fields: [
    {
      name: 'sampleData', type: 'checkbox', defaultValue: true, label: 'These are SAMPLE values – UPDATE BEFORE LAUNCH',
      admin: { description: 'Untick only after you have entered your real rates.' },
    },
    {
      name: 'rates', type: 'array', labels: { singular: 'Rate', plural: 'Rates per sq ft' },
      admin: { description: 'One row per service × quality tier' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'service', type: 'select', required: true, options: serviceOptions },
            { name: 'tier', type: 'select', required: true, options: ['basic', 'standard', 'premium'] },
            { name: 'rate', type: 'number', required: true, min: 0, label: '₹ per sq ft' },
          ],
        },
        { name: 'note', type: 'text' },
      ],
    },
    {
      name: 'extras', type: 'array', admin: { description: 'Optional add-ons in the calculator' },
      fields: [
        { name: 'key', type: 'select', required: true, options: ['parking', 'boundaryWall', 'basement'] },
        { name: 'label', type: 'text', required: true, localized: true },
        { name: 'pricing', type: 'select', required: true, defaultValue: 'fixed', options: [{ label: 'Fixed amount (₹)', value: 'fixed' }, { label: '₹ per sq ft of built-up area', value: 'perSqft' }] },
        { name: 'value', type: 'number', required: true, min: 0 },
        { name: 'note', type: 'text' },
      ],
    },
    {
      name: 'breakdown', type: 'array', admin: { description: 'Approximate cost split shown after the estimate. Each service should add up to 100%.' },
      fields: [
        { name: 'service', type: 'select', required: true, options: serviceOptions },
        { name: 'label', type: 'text', required: true, localized: true },
        { name: 'percent', type: 'number', required: true, min: 0, max: 100 },
      ],
    },
    { name: 'rangePercent', type: 'number', defaultValue: 10, min: 0, max: 50, label: 'Estimate range ± %' },
  ],
}
