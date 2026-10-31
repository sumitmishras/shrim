'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { DefaultCellComponentProps } from 'payload'

const STATUSES = [
  ['new', 'New'], ['contacted', 'Contacted'], ['qualified', 'Qualified'], ['site-visit', 'Site Visit'],
  ['quotation-sent', 'Quotation Sent'], ['negotiation', 'Negotiation'], ['won', 'Won'], ['lost', 'Lost'],
]

/** Status column in the leads list: change the status right from the list. Logged in the lead's history. */
export default function StatusCell({ cellData, rowData }: DefaultCellComponentProps) {
  const router = useRouter()
  const [value, setValue] = useState<string>(String(cellData ?? 'new'))
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const change = async (next: string) => {
    const prev = value
    setValue(next); setBusy(true); setErr('')
    try {
      const res = await fetch(`/api/leads/${(rowData as { id: number | string }).id}`, {
        method: 'PATCH', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: next }),
      })
      if (!res.ok) throw new Error(String(res.status))
      router.refresh()
    } catch {
      setValue(prev); setErr('Could not save')
    } finally { setBusy(false) }
  }

  return (
    <div className="shrim-status">
      <select value={value} disabled={busy} onChange={(e) => change(e.target.value)} aria-label="Change status" onClick={(e) => e.stopPropagation()} data-status={value}>
        {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      {err && <span role="alert" className="shrim-err">{err}</span>}
    </div>
  )
}
