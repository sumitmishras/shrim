'use client'
import { useFormFields } from '@payloadcms/ui'
import { breakdownMessage, greetingMessage, waLink, type CalcData } from '@/lib/crm/whatsapp'

/** Call + WhatsApp buttons at the top of a lead. Calculator leads also get "Send breakdown on WhatsApp". */
export default function LeadActions() {
  const phone = useFormFields(([f]) => f.phone?.value as string | undefined)
  const name = useFormFields(([f]) => f.name?.value as string | undefined)
  const calc = useFormFields(([f]) => f.calculator?.value as CalcData | undefined)
  if (!phone || !/^\d{10}$/.test(phone)) return null
  const breakdown = breakdownMessage(name, calc)
  return (
    <div className="shrim-actions" role="group" aria-label="Contact this lead">
      <a className="shrim-btn" href={`tel:+91${phone}`}>📞 Call {phone}</a>
      <a className="shrim-btn" href={waLink(phone, greetingMessage(name))} target="_blank" rel="noopener noreferrer">💬 WhatsApp</a>
      {breakdown && (
        <a className="shrim-btn shrim-btn-primary" href={waLink(phone, breakdown)} target="_blank" rel="noopener noreferrer">📤 Send breakdown on WhatsApp</a>
      )}
    </div>
  )
}
