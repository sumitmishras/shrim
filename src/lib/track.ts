'use client'

declare global { interface Window { dataLayer?: Record<string, unknown>[] } }

/** Push an event to the GTM dataLayer. Never pass names, phone numbers or emails. */
export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event, ...params })
}
