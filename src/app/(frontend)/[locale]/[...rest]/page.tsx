import { notFound } from 'next/navigation'

/** Any unknown URL under a language lands here and renders the custom 404 inside the site layout. */
export default function CatchAll() {
  notFound()
}
