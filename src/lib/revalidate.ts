import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

/**
 * Public pages are cached. Saving or deleting content in the admin clears that cache, so edits show up within a second.
 * (Outside the web server, e.g. the seed script, there is no cache to clear and this quietly does nothing.)
 */
export const revalidateSite = () => {
  try { revalidatePath('/', 'layout') } catch { /* not running inside Next.js */ }
}

export const afterChangeRevalidate: CollectionAfterChangeHook = ({ doc, context }) => {
  if (!context?.disableRevalidate) revalidateSite()
  return doc
}
export const afterDeleteRevalidate: CollectionAfterDeleteHook = ({ doc, context }) => {
  if (!context?.disableRevalidate) revalidateSite()
  return doc
}
export const globalAfterChangeRevalidate: GlobalAfterChangeHook = ({ doc, context }) => {
  if (!context?.disableRevalidate) revalidateSite()
  return doc
}
