import { getDictionary } from '@/i18n/dictionary'
import { formatMoney } from '../leads/estimate'

export type CalcData = {
  inputs?: { service?: string; area?: number; floors?: number; tier?: string }
  estimate?: { builtUp?: number; low?: number; high?: number; breakdown?: { label: string; label_hi?: string; percent: number }[] } | null
}

const hi = getDictionary('hi')
export const waLink = (phone: string, text: string) => `https://wa.me/91${phone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(text)}`
const first = (name?: string) => (name ?? '').trim().split(/\s+/)[0] || ''

export const greetingMessage = (name?: string) =>
  `नमस्ते${first(name) ? ` ${first(name)} जी` : ''}, SHRIM Construction की तरफ़ से। आपने हमारी वेबसाइट पर पूछताछ की थी। बताइए, हम आपकी क्या मदद कर सकते हैं?`

/** Hindi message with the estimate range and breakdown, sent from the owner's own WhatsApp. Null when the lead has no estimate. */
export function breakdownMessage(name: string | undefined, calc?: CalcData | null): string | null {
  const e = calc?.estimate
  if (!e?.low || !e.high) return null
  const i = calc?.inputs ?? {}
  const svc = hi.forms.calc.serviceOpts[i.service ?? ''] ?? ''
  const tier = hi.forms.calc.tierOpts[i.tier ?? ''] ?? ''
  const floors = i.service !== 'interior' && (i.floors ?? 1) > 1 ? ` × ${i.floors} मंज़िल` : ''
  const lines = [
    `नमस्ते${first(name) ? ` ${first(name)} जी` : ''}, SHRIM Construction की तरफ़ से।`,
    '',
    'आपने हमारी वेबसाइट पर खर्चा निकाला था। उसका पूरा ब्यौरा यह है:',
    '',
    `🏗 ${[svc, tier].filter(Boolean).join(' · ')}`,
    i.area ? `📐 ${i.area} sq ft${floors} = ${e.builtUp ?? i.area} sq ft` : null,
    `💰 अनुमानित खर्चा: ${formatMoney(e.low, 'hi')} – ${formatMoney(e.high, 'hi')}`,
    e.breakdown?.length ? '' : null,
    e.breakdown?.length ? 'पैसा कहाँ लगता है (मोटा अंदाज़ा):' : null,
    ...(e.breakdown ?? []).map((b) => `• ${b.label_hi || b.label} – ${b.percent}%`),
    '',
    'ये approximate estimate है, असली खर्चा साइट विज़िट के बाद पता चलता है। साइट विज़िट बिल्कुल फ्री है – आपको कौन-सा दिन और समय ठीक रहेगा?',
    '',
    '— SHRIM | Construction • Interiors • Fabrication',
  ]
  return lines.filter((l) => l !== null).join('\n')
}
