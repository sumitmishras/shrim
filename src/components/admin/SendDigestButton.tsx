'use client'
import { useState } from 'react'

const TEXT: Record<string, string> = {
  sent: 'Sent. Check Telegram.', 'nothing-to-report': 'Nothing to report today (no follow-ups, no new leads yesterday).',
  'not-configured': 'Telegram is not set up yet. See TELEGRAM_SETUP.md.', failed: 'Telegram did not accept it. Check the token and chat ID.',
}

export default function SendDigestButton() {
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const send = async () => {
    setBusy(true); setMsg('')
    try {
      const r = await fetch('/api/leads/digest', { method: 'POST', credentials: 'include' })
      const j = await r.json()
      setMsg(TEXT[j.result] ?? j.error ?? 'Done')
    } catch { setMsg('Could not reach the server.') }
    setBusy(false)
  }
  return (
    <div className="shrim-digest">
      <button type="button" className="shrim-btn" disabled={busy} onClick={send}>{busy ? 'Sending…' : '✉ Send today’s digest to Telegram now'}</button>
      {msg && <p role="status">{msg}</p>}
    </div>
  )
}
