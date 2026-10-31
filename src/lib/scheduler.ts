import { getPayloadClient } from './payload'
import { sendDigest, shouldSendDigest } from './digest'
import { telegramConfigured } from './telegram'
import { todayIST } from './crm/dates'

/**
 * Tiny in-app scheduler (no paid service). Checks once a minute; sends the digest once a day at 9 AM IST.
 * The "already sent today" marker is stored in the database, so restarts never cause a double send.
 * If Telegram is not configured it does nothing, silently.
 */
export function startScheduler() {
  const g = globalThis as { __shrimScheduler?: boolean }
  if (g.__shrimScheduler || process.env.DISABLE_SCHEDULER === '1') return
  g.__shrimScheduler = true
  let lastTry = 0

  const tick = async () => {
    try {
      if (!telegramConfigured()) return
      const payload = await getPayloadClient()
      const last = await payload.kv.get<string>('digest:last')
      if (!shouldSendDigest(new Date(), last)) return
      if (Date.now() - lastTry < 15 * 60_000) return // after a failure, retry every 15 minutes
      lastTry = Date.now()
      const result = await sendDigest(payload)
      if (result === 'sent' || result === 'nothing-to-report') await payload.kv.set('digest:last', todayIST())
    } catch (e) {
      console.error('[digest] scheduler error:', e instanceof Error ? e.message : e)
    }
  }
  setInterval(tick, 60_000)
  setTimeout(tick, 20_000)
}
