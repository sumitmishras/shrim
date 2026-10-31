import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'

async function main() {
  const payload = await getPayload({ config })
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  if (!email || !password) throw new Error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env')

  const existing = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 })
  if (existing.totalDocs === 0) {
    await payload.create({ collection: 'users', data: { email, password, role: 'admin', name: 'Owner' } })
    payload.logger.info(`Created admin ${email}`)
  } else {
    payload.logger.info(`Admin ${email} already exists`)
  }
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })
