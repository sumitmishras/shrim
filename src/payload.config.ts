import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Services } from './collections/Services'
import { Projects } from './collections/Projects'
import { Testimonials } from './collections/Testimonials'
import { Guides } from './collections/Guides'
import { Faqs } from './collections/Faqs'
import { Pages } from './collections/Pages'
import { AboutPage } from './globals/AboutPage'
import { Leads } from './collections/Leads'
import { SiteSettings } from './globals/SiteSettings'
import { Rates } from './globals/Rates'
import { Tracking } from './globals/Tracking'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    components: { views: { dashboard: { Component: '/components/admin/Dashboard' } } },
  },
  collections: [Leads, Services, Projects, Testimonials, Guides, Faqs, Pages, Media, Users],
  globals: [SiteSettings, Rates, Tracking, AboutPage],
  localization: {
    locales: [
      { label: 'English', code: 'en' },
      { label: 'हिन्दी', code: 'hi' },
    ],
    defaultLocale: 'en',
    fallback: true,
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
  }),
  sharp,
  plugins: [],
})
